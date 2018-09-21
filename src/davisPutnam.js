const { Set, Stack } = require('immutable');

/**
 * Returns a random element of a set
 * @param {Set<T>} set
 * @returns {T} 
 */
function randomElement(set) {
    return set.slice(Math.round(Math.random() * (set.size - 1))).first();
}

/**
 * Negates the literal with an !
 * @param {String} literal
 */
function negateLiteral(literal) {
    return ("!" + literal).replace(/^!!/, '');
}

class DavisPutnam {
    /**
     * @param {Array<Array<String>>} clauses
     */
    constructor(clauses) {
        /**
         * @type {Stack<Set<Set<String>>>}
         */
        this._clausesStack = new Stack().asMutable();
        /**
         * @type {Set<Set<String>>}
         */
        this._clauses = new Set([new Set()]);
        /**
         * @type {Array<Array<String>>}
         */
        this.clauses = clauses;
        /**
         * @type {Set<Set<String>>}
         */
        this.used = new Set().asMutable();

        /**
         * @type {Stack<Set<String>>}
         */
        this._literalsStack = new Stack().asMutable();
        /**
         * @type {Set<String>}
         */
        this._literals = new Set();
    }

    /**
     * @param {Array<Array<String>>} clauses
     */
    set clauses(clauses) {
        this._clauses = new Set(clauses.map(clause => new Set(clause)));
    }

    /**
     * Returns a set of all unit clauses of the current clauses
     * @param {Set<Set<String>>} clauses
     * @returns {Set<Set<String>>}
     */
    get units() {
        return this._clauses.filter(clause => clause.size == 1 && !this.used.has(clause));
    }

    /**
     * @returns {Array<Array<String>>}
     */
    get clauses() {
        return this._clauses.toJS();
    }

    /**
     * @returns {Array<String>}
     */
    get literals() {
        return this._literals.toJS();
    }

    /**
     * @param {Number} step if the step is a negative number it will run till it's solved
     * @returns {Boolean} true if the set of clauses was solved or can't be solved and false if the algorythm didn't finish yet.
     */
    solve(step = -1, largeSteps = true) {
        step = Math.round(step);
        do {
            while (!this.units.isEmpty() && step != 0) {
                var unit = randomElement(this.units);
                this.used.add(unit);
    
                var literal = randomElement(unit);
                this.reduce(literal);
                if (!largeSteps) step--;
            }
            // exit if steps was reached
            if (step == 0) {
                continue;
            }

            // unsolvable
            if (this._clauses.has(new Set())) {
                if (this._clausesStack.isEmpty()) {
                    this._clauses = new Set([new Set()]);
                    return true;
                }
                // pop from stack to do the next
                this._clauses = this._clausesStack.peek();
                this._clausesStack.pop();
                this._literals = this._literalsStack.peek();
                this._literalsStack.pop();
                this.used.clear();
                continue;
            }
            // solution found
            if (this._clauses.map(clause => clause.size == 1).filter(bool => !bool).isEmpty()) {
                return true;
            }

            // add clauses and literals to the stack
            var literal = this.selectLiteral();
            var notLiteral = negateLiteral(literal);

            this._clausesStack.push(this._clauses.add(new Set([notLiteral])));
            this._literalsStack.push(this._literals.add(notLiteral));

            this._clauses = this._clauses.add(new Set([literal]));
            this._literals = this._literals.add(literal);

            step--;
        } while (!this._clausesStack.isEmpty() && step != 0)

        return false;
    }

    /**
     * @param {String} literal
     * @returns {DavisPutnam}
     */
    reduce(literal) {
        /**
         * @type {String}
         */
        var notLiteral = negateLiteral(literal);

        /**
         * @type {Set<Set<String>>}
         */
        var newClauses = new Set().asMutable();
        this._clauses.forEach(clause => {
            if (clause.has(notLiteral)) {
                newClauses.add(clause.filter(literal => literal != notLiteral));
            } else if (!clause.has(literal) || clause.equals(new Set([literal]))) {
                newClauses.add(clause);
            }
        });
        this._clauses = newClauses.asImmutable();

        return this;
    }

    /**
     * @returns {String}
     */
    selectLiteral() {
        return randomElement(this._clauses.flatten().filter(literal => !this._literals.has(literal)));
    }
}

module.exports = DavisPutnam;