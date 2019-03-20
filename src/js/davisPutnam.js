const { Set, Stack } = require('immutable');
const seedrandom = require('seedrandom');
const Util = require('./util');

/**
 * The DavisPutnam class is an iterative implementation of the algorithm for a step by step calculation.
 * It simulates the recursive calls of the original implementation using stacks.
 * 
 * TODO: Use only one stack instead of 3
 * TODO: Optimize and make it cleaner
 * TODO: Also add more comments and documentation with examples
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
class DavisPutnam {
    /**
     * The constructor for the davis putnam algorithm.
     * It receives a set of clauses and a seed.
     * A set of clauses can be for example:
     * 
     *      [['p', 'q'], ['!p', 's'], ['!s']]
     * 
     * Which is equal to the propositional logical formula: (p or q) and (not p or s) and (not s).
     * As for the seed any string is accepted.
     * 
     * @param {Array<Array<String>>} clauses - a set of clauses
     * @param {String} seed - a seed for the random number generator
     * 
     * @returns {DavisPutnam} itself
     */
    constructor(clauses = new Set([new Set()]), seed = null) {
        // Internal
        /**
         * @type {Stack<Set<Set<String>>>}
         */
        this._clausesStack = new Stack().asMutable();
        /**
         * @type {Set<Set<String>>}
         */
        this._clauses = new Set([new Set()]);
        /**
         * @type {Stack<Set<String>>}
         */
        this._literalsStack = new Stack().asMutable();
        /**
         * @type {Set<String>}
         */
        this._literals = new Set();
        /**
         * @type {Stack<Set<Set<String>>>}
         */
        this._usedStack = new Stack().asMutable();
        /**
         * @type {Set<Set<String>>}
         */
        this._used = new Set();
        /**
         * @type {String}
         */
        this.literal = null;

        /**
         * @type {Set<DavisPutnamConsumer>}
         */
        this._consumers = new Set().asMutable();

        // External
        /**
         * @type {Array<Array<String>>}
         */
        this.clauses = clauses;
        /**
         * @type {String}
         */
        this.seed =  seed;
        /**
         * If its value is true the Algorithm will do micro steps
         * @type {Boolean}
         */
        this.micro = false;

        return this;
    }
    /**
     * Returns a set of all not used unit clauses of the current clauses.
     * These are clauses with just one literal that have not been used to reduce the set of clauses previously.
     * 
     * @returns {Set<Set<String>>}
     */
    get _useable() {
        return this._clauses.filter(clause => clause.size == 1 && !this._used.has(clause));
    }
    /**
     * Returns a set of all clauses that can be unit cut by the current literal.
     * If the literal is not set it will return an empty set.
     * 
     * @returns {Set<Set<String>>}
     */
    get _cutable() {
        if (!this.literal) return new Set();
        return this._clauses.filter(clause => clause.has(Util.negateLiteral(this.literal)));
    }
    /**
     * @param {String} seed
     */
    set seed(seed) {
        this._seed = seed;
        this.random = seedrandom(this.seed);
    }
    /**
     * @returns {String}
     */
    get seed() {
        return this._seed;
    }

    /**
     * Adds a consumer.
     * @param {DavisPutnamConsumer} consumer
     * 
     * @returns {DavisPutnam} itself
     */
    addConsumer(consumer) {
        this._consumers.add(consumer);
        return this;
    }
    /**
     * Removes a consumer.
     * @param {DavisPutnamConsumer} consumer 
     * 
     * @returns {DavisPutnam} itself
     */
    removeConsumer(consumer) {
        this._consumers.remove(consumer);
        return this;
    }

    /**
     * Sets a new set of clauses to be satisfied and resets all previous progress.
     * 
     * @param {Array<Array<String>>} clauses
     */
    set clauses(clauses) {
        // reseed random function
        this.seed = this.seed;

        this._clauses = new Set(clauses.map(clause => new Set(clause)));
        this._literals = new Set();
        this._used = new Set();

        // clear stacks
        this._clausesStack.clear();
        this._literalsStack.clear();
        this._usedStack.clear();
    }
    /**
     * Returns an two dimensional array of literals of the current state.
     * 
     * @returns {Array<Array<String>>}
     */
    get clauses() {
        return this._clauses.toJS();
    }

    /**
     * @returns {Boolean} true if done.
     */
    done() {
        return this.satisfied() || this.notSatisfiable();
    }

    /**
     * @returns {Boolean} true if solution found.
     */
    satisfied() {
        // get set of unit clauses
        let units = this._clauses.filter(clause => clause.size == 1);
        // get all literals contained in those unit clauses
        let literals = units.flatten();

        // check if set of clauses is only consisting of those unit clauses and if it makes sense
        return this._clauses.subtract(units).isEmpty() && units.filter(clause => literals.has(Util.negateLiteral(clause.first()))).isEmpty();
    }
    /**
     * @returns {Boolean} true if no solution can found.
     */
    notSatisfiable() {
        return this._clauses.has(new Set()) && this._clausesStack.isEmpty();
    }

    
    /**
     * Runs the davis putnam for the given amount of steps.
     * @param {Number} step if the step is a negative number it will run till it's satisfied
     * 
     * @returns {DavisPutnam} itself
     */
    step(step = 1) {
        step = Math.round(step); // make steps a whole number

        // macro step loop
        while (!this.done() && step != 0) {
            // micro step loop for subsume and unit cuts
            while (!this._useable.isEmpty() && !this._clauses.has(new Set()) && step != 0) {
                // select a new literal and subsume till unit cuts can be done with said literal
                while (this._cutable.isEmpty() && !this._useable.isEmpty()) {
                    /**
                     * @type {Set<String>}
                     */
                    let unit = this._useable.first();
                    this._used = this._used.add(unit);
                    this.literal = unit.first();

                    // subsume
                    let clauses = this._clauses.filter(clause => clause.has(this.literal) && clause.size != 1);
                    this._clauses = this._clauses.subtract(clauses);

                    if (clauses.size > 0) this._consumers.forEach(consumer => consumer.onSubsume({
                        'davisPutnam': this,
                        'literal': this.literal,
                        'clauses': clauses.toJS()
                    }));
                }

                // check if cuts can be done before trying to do a unit cut
                if (!this._cutable.isEmpty()) {
                    // do unit cut on one specific clause
                    let target = this._cutable.first();
                    let result = target.remove(Util.negateLiteral(this.literal));
                    this._clauses = this._clauses.remove(target).add(result);
                    
                    this._consumers.forEach(consumer => consumer.onUnitCut({
                        'davisPutnam': this,
                        'literal': this.literal,
                        'clause': target.toJS(),
                        'result': result.toJS()
                    }));
                    if (this.micro) step--;
                }
            }

            // check if satisfied
            if (this.satisfied()) {
                this._consumers.forEach(consumer => consumer.onSatisfied({
                    'davisPutnam': this,
                    'solution': this.clauses
                }));
                continue;
            }
            if (step == 0) continue;
            step--;

            // check if current state is not solvable
            if (this._clauses.has(new Set())) {
                if (this.notSatisfiable()) {
                    // overwrite clauses
                    this._clauses = new Set([new Set()]);
                    this._consumers.forEach(consumer => consumer.onNotSatisfiable({
                        'davisPutnam': this
                    }));
                    continue;
                }
                // simulate 2nd recursive call
                this.backtrack();
                continue;
            }

            // choose a literal
            let literal = this.selectLiteral();
            let negLiteral = Util.negateLiteral(literal);

            // put the negated literal on stack for backtracking
            this._clausesStack.push(this._clauses.add(new Set([negLiteral])));
            this._literalsStack.push(this._literals.add(negLiteral));
            this._usedStack.push(this._used);

            // use the literal for the next
            this._clauses = this._clauses.add(new Set([literal]));
            this._literals = this._literals.add(literal);

            this._consumers.forEach(consumer => consumer.onChoose({
                'davisPutnam': this,
                'literal': literal,
                'literals': this._literals.toJS()
            }));
        }
        return this;
    }

    /**
     * Picks the last element of the stacks bringing back it's previous state.
     * Calls backtrack and choose events.
     * 
     * @returns {DavisPutnam} itself
     */
    backtrack() {
        // save old literals to be able to know the newly added
        let oldLiterals = this._literals;

        // pop from stack to do the next
        this._clauses = this._clausesStack.first();
        this._clausesStack.pop();
        this._literals = this._literalsStack.first();
        this._literalsStack.pop();
        this._used = this._usedStack.first();
        this._usedStack.pop();

        // get the choosen literal
        this.literal = this._literals.subtract(oldLiterals).first();

        this._consumers.forEach(consumer => {
            consumer.onBacktrack({
                'davisPutnam': this
            });
            consumer.onChoose({
                'davisPutnam': this,
                'literal': this.literal,
                'literals': this._literals.toJS()
            });
        });
        return this;
    }

    /**
     * Wir wählen ein beliebiges Literal aus einer beliebigen Klausel,
     * so dass weder dieses Literal noch die Negation benutzt wurden.
     * 
     * @returns {String} the selected literal
     */
    selectLiteral() {
        /**
         * @type {Set<String>}
         */
        let literals = this._clauses.flatten().subtract(this._clauses.filter(clause => clause.size == 1).flatten());
        let positive = literals.filter(literal => literal.substr(0, 1) != '!');

        // Prefer positive literals
        return this.rndElement(positive.size > 0 ? positive : literals);
    }
    
    /**
     * Picks a random element of a set.
     * @param {Set<T>} set
     * 
     * @returns {T} the random element
     */
    rndElement(set) {
        return set.slice(Math.round(this.random() * (set.size - 1))).first();
    }
}

/**
 * A consumer class for the DavisPutnam.
 * This class is abstract and has to be extended.
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
class DavisPutnamConsumer {
    constructor() {
        if (this.constructor == DavisPutnamConsumer) {
            throw new Error(`Abstract classes can't be instantiated.`);
        }
    }

    /**
     * This function is called when the DavisPutnam algorithm chooses a literal.
     * The event contains the literal and an array with all chosen literals up to this point.
     * @param {{davisPutnam: DavisPutnam, literal: String, literals: Array<String>}} event 
     */
    onChoose(event) {
        console.log(`choosen literal '` + event.literal + `'` + event.literals.map(l => `'` + l + `'`));
    }

    /**
     * This function is called when the DavisPutnam algorithm does a unit cut on a clause.
     * The event contains the used literal and clause as well as the result of the unit cut.
     * @param {{davisPutnam: DavisPutnam, literal: String, clause: Array<String>, result: Array<String>}} event 
     */
    onUnitCut(event) {
        console.log(`unit cut with '` + event.literal + `' on {'` + event.clause.join(`', '`) + `'}`);
    }

    /**
     * This function is called when the DavisPutnam algorithm subsumes with a literal.
     * The event contains the used literal and the affected clauses that got removed from the set of clauses.
     * @param {{davisPutnam: DavisPutnam, literal: String, clauses: Array<Array<String>>}} event 
     */
    onSubsume(event) {
        console.log(`subsume with '` + event.literal + `' removing following clauses`, event.clauses)
    }

    /**
     * This function is called if a backtrack occurs.
     * The original implementation is recursive - this one on the other hand iterative.
     * It does mimic the recursive implementation tho. So this function is called if one "recursive call" fails and a different "route" is taken.
     * @param {{davisPutnam: DavisPutnam}}
     */
    onBacktrack(event) {
        console.log(`backtracked`);
    }

    /**
     * This function is called if the algorithm was able to satisfy the problem.
     * The solution is also handed over via the event.
     * @param {{davisPutnam: DavisPutnam, solution: Array<String>}} event 
     */
    onSatisfied(event) {
        console.log(`satisfied`);
    }

    /**
     * This function is called if the algorithm is not able to satisfy the problem.
     * @param {{davisPutnam: DavisPutnam}}
     */
    onNotSatisfiable(event) {
        console.log(`not satisfiable`);
    }
}

module.exports = { DavisPutnam, DavisPutnamConsumer };