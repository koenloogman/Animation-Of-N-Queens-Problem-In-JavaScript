const { Set, Range } = require('immutable');
const Util = require('./util');

/**
 * Returns a set of clauses that allows only one of the given literals to be true.
 * 
 * @example
 * atMostOne(['p', 'q', 's']); // returns [['!p', '!q'], ['!p', '!s'], ['!q', '!s']]
 * 
 * @param {Set<String>} set - the set containing the literals
 * @returns {Set<Set<String>>}
 */
function atMostOne(set) {
    let negatedSet = set.map(literal => Util.negateLiteral(literal));
    let result = new Set();
    negatedSet.forEach(a => {
        result = result.union(negatedSet.filter(b => a != b).map(b => new Set([a, b])));
    });
    return result;
}

/**
 * Returns a set of clauses where only one of the row can be true.
 * 
 * @param {Number} row - the row of the grid
 * @param {Number} n - the length of the row
 */
function atMostOneInRow(row, n) {
    var set = Range(1, n + 1).map(column => row + "," + column);
    return atMostOne(set);
}

/**
 * Returns a set of clauses where at least one in the column is true.
 * 
 * @param {Number} column - column of the grid
 * @param {Number} n - length of the column
 */
function oneInColumn(column, n) {
    var set = Range(1, n + 1).map(row => row + "," + column);
    return new Set([set]);
}

/**
 * Returns a set of clauses where only one in the upper diagonal can be true.
 * 
 * @param {Number} k - helper variable to get the diagonal
 * @param {Number} n - size of the board
 */
function atMostOneInUpperDiagonal(k, n) {
    var result = new Set();
    Range(1, n + 1).forEach(a => {
        result = result.union(Range(1, n + 1).filter(b => a + b == k).map(b => a + "," + b));
    });
    return atMostOne(result);
}

/**
 * Returns a set of clauses where only one in the lower diagonal can be true.
 * 
 * @param {Number} k - helper variable to get the diagonal
 * @param {Number} n - size of the board
 */
function atMostOneInLowerDiagonal(k, n) {
    var result = new Set();
    Range(1, n + 1).forEach(a => {
        result = result.union(Range(1, n + 1).filter(b => a - b == k).map(b => a + "," + b));
    });
    return atMostOne(result);
}

/**
 * Returns a set of clauses for the N-Queens Problem.
 * 
 * @param {Number} n - number N for the N-Queens Problem
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
const QueensClauses = (n) => {
    var clauses = new Set();
    // from 1 .. n
    Range(1, n + 1).forEach(a => {
        clauses = clauses.union(atMostOneInRow(a, n));
        clauses = clauses.union(oneInColumn(a, n));
    });

    Range(-(n - 2), n - 2 + 1).forEach(k => {
        clauses = clauses.union(atMostOneInLowerDiagonal(k, n));
    });
    Range(3, 2 * n - 1 + 1).forEach(k => {
        clauses = clauses.union(atMostOneInUpperDiagonal(k, n));
    });
    return clauses.toJS();
}

module.exports = QueensClauses;