const { Set, Stack } = require('immutable');

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

    get clauses() {
        return this._clauses.toJS();
    }

    get literals() {
        return this._literals.toJS();
    }

    davisPutnam(step = -1) {
        do {
            this.saturate();

            // unsolvable
            if (this._clauses.has(new Set())) {
                if (this._clausesStack.isEmpty()) {
                    return new Set([new Set()]);
                }
                this._clauses = this._clausesStack.peek();
                this._clausesStack.pop();
                this._literals = this._literalsStack.peek();
                this._literalsStack.pop()
                continue;
            }
            // solution found
            if (this._clauses.map(clause => clause.size == 1).filter(bool => !bool).isEmpty()) {
                return this.clauses;
            }

            // add clauses and literals to the stack
            var literal = this.selectLiteral();
            var notLiteral = DavisPutnam.negateLiteral(literal);

            this._clausesStack.push(this._clauses.add(new Set([notLiteral])));
            this._literalsStack.push(this._literals.add(notLiteral));

            this._clauses = this._clauses.add(new Set([literal]));
            this._literals = this._literals.add(literal);

            step--;
        } while (!this._clausesStack.isEmpty() && step != 0)

        return "ERROR";
    }

    /**
     * @returns {DavisPutnam}
     */
    saturate() {
        /**
         * @type {Set<Set<String>>}
         */
        var units = this._clauses.filter(clause => clause.size == 1);
        /**
         * @type {Set<String>}
         */
        var used = new Set().asMutable();

        // saturate
        while (!units.isEmpty()) {
            var unit = DavisPutnam.randomElement(units);
            used.add(unit);

            var literal = DavisPutnam.randomElement(unit);
            this.reduce(literal);

            units = this._clauses.filter(clause => clause.size == 1 && !used.has(clause));
        }

        return this;
    }

    /**
     * @param {String} literal
     * @returns {DavisPutnam}
     */
    reduce(literal) {
        /**
         * @type {String}
         */
        var notLiteral = DavisPutnam.negateLiteral(literal);

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
        return DavisPutnam.randomElement(this._clauses.flatten().filter(literal => !this._literals.has(literal)));
    }

    /**
     * @param {String} literal
     */
    static negateLiteral(literal) {
        return ("!" + literal).replace(/^!!/, '');
    }

    /**
     * @param {Set<T>} set
     * @returns {T}
     */
    static randomElement(set) {
        return set.slice(Math.round(Math.random() * (set.size - 1))).first();
    }
}

module.exports = DavisPutnam;