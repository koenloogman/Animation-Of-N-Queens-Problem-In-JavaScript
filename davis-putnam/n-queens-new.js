/**
 * @param {Array<Array<String>>} clauses 
 * @param {Array<String>} literals 
 */
function davisPutnam(clauses, literals = new Set()) {
    clauses = saturate(clauses);

    // unsolvable
    if (clauses.contains(new Set())) {
        return new Set([new Set()]);
    }
    // solution found
    if (clauses.all(clause => clause.size == 1)) {
        return clauses;
    }
    var literal = selectLiteral(clauses, literals);
        var notLiteral = negateLiteral(literal);

        var tmpClauses = new Set(clauses);
        var tmpLiterals = new Set(literals);
        tmpClauses.add(new Set([literal]));
        tmpLiterals.add(literal);

        var set = davisPutnam(tmpClauses, tmpLiterals);
        // solution found
        if (!set.contains(new Set())) {
            return set;
        }

        (tmpClauses = new Set(clauses)).add(new Set([notLiteral]));
        (tmpLiterals = new Set(literals)).add(notLiteral);
        return davisPutnam(tmpClauses, tmpLiterals);
}

/**
 * @param {Set<Set<String>>} set 
 */
function saturate(set) {
    var units = new Set(set).keepIf(s => s.size == 1);
    var used = new Set();
    while (!units.isEmpty()) {
        var unit = arb(units);
        used.add(unit);
        var l = arb(unit);
        set = reduce(set, l);
        units = new Set(set).keepIf(s => s.size == 1 && !used.contains(s));
    }
    return set;
}

/**
 * @param {Set<Set<String>>} set 
 * @param {String} literal
 * 
 * @returns {Set<Set<String>>}
 */
function reduce(set, literal) {
    var notLiteral = negateLiteral(literal);
    var result = new Set([new Set([literal])]);
    set.forEach(s => {
        if (s.contains(notLiteral)) {
            result.add(new Set(s).keepIf(l => l != notLiteral));
        } else if (!s.contains(literal)) {
            result.add(s);
        }
    });
    return result;
}

/**
 * @param {Set<Set<String>>} set 
 * @param {Set<String>} used 
 */
function selectLiteral(set, used) {
    return arb(new Set(set).flatten().keepIf(l => !used.contains(l)));
}
/**
 * @param {String} literal 
 */
function negateLiteral(literal) {
    return ("!" + literal).replace(/^!!/, '');
}

/**
 * @param {Set} set 
 */
function arb(set) {
    return set.toArray()[Math.round(Math.random() * (set.length - 1))];
}

// n queens
function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function atMostOne(set) {
    var result = new Array();
    var negatedSet = set.map(l => negateLiteral(l));
    var used = new Array();
    negatedSet.forEach(a => {
        used.push(a);
        negatedSet.filter(b => !used.includes(b)).forEach(b => {
            result.push([a, b]);
        });
    });
    return result;
}

function atMostOneInRow(row, n) {
    var set = range(1, n).map(column => row + "," + column);
    return atMostOne(set);
}

function oneInColumn(column, n) {
    var set = range(1, n).map(row => row + "," + column);
    return [set];
}

function atMostOneInUpperDiagonal(k, n) {
    var result = new Array();
    range(1, n).forEach(a => {
        range(1, n).filter(b => a + b == k).forEach(b => {
            result.push(a + "," + b);
        });
    });
    return atMostOne(result);
}

function atMostOneInLowerDiagonal(k, n) {
    var result = new Array();
    range(1, n).forEach(a => {
        range(1, n).filter(b => a - b == k).forEach(b => {
            result.push(a + "," + b);
        });
    });
    return atMostOne(result);
}

function allClauses(n) {
    var clauses = new Array();
    range(1, n).forEach(row => {
        atMostOneInRow(row, n).forEach(clause => clauses.push(clause));
    });
    range(-(n - 2), n - 2).forEach(k => {
        atMostOneInLowerDiagonal(k, n).forEach(clause => clauses.push(clause));
    });
    range(3, 2 * n - 1).forEach(k => {
        atMostOneInUpperDiagonal(k, n).forEach(clause => clauses.push(clause));
    });
    range(1, n).forEach(column => {
        oneInColumn(column, n).forEach(clause => clauses.push(clause));
    });
    return clauses;
}

console.log(allClauses(8));