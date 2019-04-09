const { Set } = require('immutable');

/**
 * The Util object helps handling simple operations with sets and clauses.
 * Like negating a literal or turning those structures into HTML formatted strings.
 * 
 * @author Koen Loogman
 */
const Util = {
    /**
     * Negates the literal.
     * 
     * @example
     * Util.negateLiteral('p'); // returns !p
     * Util.negateLiteral('!p'); // returns p
     * 
     * @param {String} literal
     */
    negateLiteral(literal) {
        return ('!' + literal).replace(/^!!/, '');
    },

    /**
     * Returns an HTML formatted string of the set.
     * 
     * @example
     * Util.setToString(['p', 'q', 1]); // returns <span class="set">{ p , q , 1 }</span>
     * 
     * @param {Array<String>} set 
     */
    setToString(set) {
        return '<span class="set">{ ' + set.join(', ') + ' }</span>';
    },

    /**
     * Returns an HTML formatted string of the clause.
     * 
     * @example
     * Util.clauseToString(['!p', 'q']); // returns <span class="set">{ <span class="literal false">'!p'</span>, <span class="literal true">'q'</span> }</span>
     * 
     * @param {Array<String>} set 
     */
    clauseToString(set) {
        return this.setToString(set.map(literal => {
            let _class = literal.substr(0, 1) != '!' ? 'true' : 'false';
            return '<span class="literal ' + _class + '">\'' + literal + '\'</span>'
        }));
    },
    
    /**
     * Returns an HTML formatted string of the set of clauses.
     * 
     * @param {Array<String>} set 
     */
    clausesToString(clauses) {
        return this.setToString(clauses.map(clause => this.clauseToString(clause)));
    }
}

module.exports = Util;