const { Set } = require('immutable');
const seedrandom = require('seedrandom');
const Util = require('./util');

/**
 * The DavisPutnam class is an iterative implementation of the algorithm for a step by step calculation.
 * It simulates the recursive calls of the original implementation using stacks.
 * 
 * TODO: Add more comments and documentation with examples
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
    constructor(options) {
        // overwrite default settings with the options
        const settings = {
            clauses: new Set([new Set()]),
            seed: null
        };
        let {clauses, seed} = {...settings, ...options};

        // Internal
        /**
         * @type {Array<{clauses: Set<Set<String>>, literals: Stack<Set<String>>, used: Stack<Set<Set<String>>>}>}
         */
        this.stack = [];
        /**
         * @type {Set<Set<String>>}
         */
        this._clauses = null;
        /**
         * @type {Set<String>}
         */
        this.literals = new Set();
        /**
         * @type {Set<Set<String>>}
         */
        this.used = new Set();
        /**
         * @type {String}
         */
        this.literal = null;

        /**
         * @type {Set<DavisPutnamConsumer>}
         */
        this.consumers = new Set().asMutable();

        // External
        /**
         * @type {Array<Array<String>>}
         */
        this.clauses = clauses;
        /**
         * @type {String}
         */
        this._seed = null;
        this.seed = seed;
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
    get useable() {
        return this._clauses.filter(clause => clause.size == 1 && !this.used.has(clause));
    }
    /**
     * Returns a set of all clauses that can be unit cut by the current literal.
     * If the literal is not set it will return an empty set.
     * 
     * @returns {Set<Set<String>>}
     */
    get cutable() {
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
        this.consumers.add(consumer);
        return this;
    }
    /**
     * Removes a consumer.
     * @param {DavisPutnamConsumer} consumer 
     * 
     * @returns {DavisPutnam} itself
     */
    removeConsumer(consumer) {
        this.consumers.remove(consumer);
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
        this.literals = new Set();
        this.used = new Set();
        this.literal = null;

        // clear stack
        this.stack = [];

        // check if already satisfied
        if (this.satisfied()) {
            this.consumers.forEach(consumer => consumer.onSatisfied({
                'state': this.state
            }));
        }

        // check if current state is not satisfiable
        if (this.notSatisfiable()) {
            // overwrite clauses
            this._clauses = new Set([new Set()]);
            this.consumers.forEach(consumer => consumer.onNotSatisfiable({
                'state': this.state
            }));
        }
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
     * Returns the state
     * 
     * @returns {Array<String>}
     */
    get state() {
        return this._clauses.filter(clause => clause.size == 1).flatten().toJS();
    }

    /**
     * @returns {Boolean} true if done.
     */
    done() {
        return this.satisfied() || (this.notSatisfiable() && this._clauses.size == 1);
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
        return this._clauses.has(new Set()) && this.stack.isEmpty();
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
            while (!this.useable.isEmpty() && !this._clauses.has(new Set()) && step != 0) {
                // select a new literal and subsume till unit cuts can be done with said literal
                while (this.cutable.isEmpty() && !this.useable.isEmpty()) {
                    /**
                     * @type {Set<String>}
                     */
                    let unit = this.rndElement(this.useable);
                    this.used = this.used.add(unit);
                    this.literal = unit.first();

                    // subsume
                    let clauses = this._clauses.filter(clause => clause.has(this.literal) && clause.size != 1);
                    this._clauses = this._clauses.subtract(clauses);

                    if (clauses.size > 0) this.consumers.forEach(consumer => consumer.onSubsume({
                        'literal': this.literal,
                        'clauses': clauses.toJS(),
                        'state': this.state
                    }));
                }

                // check if cuts can be done before trying to do a unit cut
                if (!this.cutable.isEmpty()) {
                    // do unit cut on one specific clause
                    let target = this.rndElement(this.cutable);
                    let result = target.remove(Util.negateLiteral(this.literal));
                    this._clauses = this._clauses.remove(target).add(result);
                    
                    this.consumers.forEach(consumer => consumer.onUnitCut({
                        'literal': this.literal,
                        'clause': target.toJS(),
                        'result': result.toJS(),
                        'state': this.state
                    }));
                    if (this.micro) step--;
                }
            }

            // check if satisfied
            if (this.satisfied()) {
                this.consumers.forEach(consumer => consumer.onSatisfied({
                    'state': this.state
                }));
                continue;
            }
            if (step == 0) continue;
            step--;

            // check if current state is not satisfiable
            if (this._clauses.has(new Set())) {
                if (this.notSatisfiable()) {
                    // overwrite clauses
                    this._clauses = new Set([new Set()]);
                    this.consumers.forEach(consumer => consumer.onNotSatisfiable({
                        'state': this.state
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
            this.stack.push({
                clauses: this._clauses.add(new Set([negLiteral])),
                literals: this.literals.add(negLiteral),
                used: this.used
            });

            // use the literal for the next
            this._clauses = this._clauses.add(new Set([literal]));
            this.literals = this.literals.add(literal);

            this.consumers.forEach(consumer => consumer.onChoose({
                'literal': literal,
                'literals': this.literals.toJS(),
                'state': this.state
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
        let oldLiterals = this.literals;

        // pop from stack to do the next
        /**
         * @type {{clauses: Set<Set<String>>, literals: Stack<Set<String>>, used: Stack<Set<Set<String>>>}}
         */
        let values = this.stack.pop();
        this._clauses = values.clauses;
        this.literals = values.literals;
        this.used = values.used;

        // get the choosen literal
        this.literal = this.literals.subtract(oldLiterals).first();

        this.consumers.forEach(consumer => {
            consumer.onBacktrack({
                'state': this.state
            });
            consumer.onChoose({
                'literal': this.literal,
                'literals': this.literals.toJS(),
                'state': this.state
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
     * @param {{literal: String, literals: Array<String>, state: Array<String>}} event 
     */
    onChoose(event) {
        console.log(`choosen literal '` + event.literal + `'` + event.literals.map(l => `'` + l + `'`));
    }

    /**
     * This function is called when the DavisPutnam algorithm does a unit cut on a clause.
     * The event contains the used literal and clause as well as the result of the unit cut.
     * @param {{literal: String, clause: Array<String>, result: Array<String>, state: Array<String>}} event 
     */
    onUnitCut(event) {
        console.log(`unit cut with '` + event.literal + `' on {'` + event.clause.join(`', '`) + `'}`);
    }

    /**
     * This function is called when the DavisPutnam algorithm subsumes with a literal.
     * The event contains the used literal and the affected clauses that got removed from the set of clauses.
     * @param {{literal: String, clauses: Array<Array<String>>, state: Array<String>}} event 
     */
    onSubsume(event) {
        console.log(`subsume with '` + event.literal + `' removing following clauses`, event.clauses)
    }

    /**
     * This function is called if a backtrack occurs.
     * The original implementation is recursive - this one on the other hand iterative.
     * It does mimic the recursive implementation tho. So this function is called if one "recursive call" fails and a different "route" is taken.
     * @param {{state: Array<String>}}
     */
    onBacktrack(event) {
        console.log(`backtracked`);
    }

    /**
     * This function is called if the algorithm was able to satisfy the problem.
     * The solution is also handed over via the event.
     * @param {{state: Array<String>}} event 
     */
    onSatisfied(event) {
        console.log(`satisfied`);
    }

    /**
     * This function is called if the algorithm is not able to satisfy the problem.
     * @param {{state: Array<String>}}
     */
    onNotSatisfiable(event) {
        console.log(`not satisfiable`);
    }
}

module.exports = { DavisPutnam, DavisPutnamConsumer };