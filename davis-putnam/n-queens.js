// use set class of JS.Class
JS.require('JS.Set', function(Set) {
    /**
     * @param {Set<Set<String>>} clauses 
     * @param {Set<String>} literals 
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
        var negatedSet = new Set(set.map(l => negateLiteral(l)));
        setProduct = new Set(negatedSet.product(negatedSet).map(set => new Set(set)));
        return setProduct.keepIf(set => set.size > 1);
    }

    function atMostOneInRow(row, n) {
        var set = new Set(range(1, n).map(column => "(" + row + ", " + column +")"));
        return atMostOne(set);
    }

    function oneInColumn(column, n) {
        var set = new Set(range(1, n).map(row => "(" + row + ", " + column +")"));
        return new Set([set]);
    }

    function atMostOneInUpperDiagonal(k, n) {
        var set = new Set(range(1, n));
        set = new Set(set.product(set).filter(s => s[0] + s[1] == k).map(s => "(" + s[0] + ", " + s[1] +")"));
        return atMostOne(set);
    }

    function atMostOneInLowerDiagonal(k, n) {
        var set = new Set(range(1, n));
        set = new Set(set.product(set).filter(s => s[0] - s[1] == k).map(s => "(" + s[0] + ", " + s[1] +")"));
        return atMostOne(set);
    }

    function allClauses(n) {
        var clauses = new Set();
        range(1, n).forEach(row => {clauses = clauses.union(atMostOneInRow(row, n));});
        range(-(n - 2), n - 2).forEach(k => {clauses = clauses.union(atMostOneInLowerDiagonal(k, n));});
        range(3, 2 * n - 1).forEach(k => {clauses = clauses.union(atMostOneInUpperDiagonal(k, n));});
        range(1, n).forEach(column => {clauses = clauses.union(oneInColumn(column, n));});
        return clauses;
    }

    console.log(davisPutnam(allClauses(8)));
});