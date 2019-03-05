const { Set } = require('immutable');

/**
 * The Util object helps handling simple operations with sets and clauses
 * 
 * @author Koen Loogman
 */
const Util = {
    /**
     * @param {Set<String>} set
     * @returns {Set<Set<String>>}
     */
    atMostOne(set) {
        let negatedSet = set.map(literal => Util.negateLiteral(literal));
        let result = new Set();
        negatedSet.forEach(a => {
            result = result.union(negatedSet.filter(b => a != b).map(b => new Set([a, b])));
        });
        return result;
    },
    /**
     * Returns a random element of a set
     * @param {Set<T>} set
     * @returns {T} 
     */
    randomElement(set) {
        return set.slice(Math.round(Math.random() * (set.size - 1))).first();
    },
    /**
     * Negates the literal
     * @param {String} literal
     */
    negateLiteral(literal) {
        return ("!" + literal).replace(/^!!/, '');
    }
}

module.exports = Util;