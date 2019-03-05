'use strict';

const $ = require('jquery');
const { DavisPutnam, DavisPutnamConsumer } = require('./davisPutnam.js');
const QueensClauses = require('./qeensClauses');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

class Frame extends DavisPutnamConsumer {
    /**
     * @param {DavisPutnam} davisPutnam 
     */
    constructor(davisPutnam) {
        super();
        if (davisPutnam) davisPutnam.addConsumer(this);
    }

    onReduce() {
        console.log('changed reduce')
    }
}

// const clauses = [
//     ['r','p','s'],
//     ['r','s'],
//     ['q','p','s'],
//     ['!p','!q'],
//     ['!p','s','!r'],
//     ['p','!q','r'],
//     ['!r','!s','q'],
//     ['p','q','r','s'],
//     ['r','!s','q'],
//     ['!r','s','!q'],
//     ['s','!r']
// ];
const S = QueensClauses(8);

let davisPutnam = new DavisPutnam(S);
let frame = new Frame(davisPutnam);

const setToString = (set) => {
    return '{' + set.join(', ') + '}';
}
const literalsToString = (set) => {
    return setToString(set.map(literal => '"' + literal + '"'));
}
const clausesToString = (clauses) => {
    return setToString(clauses.map(clause => literalsToString(clause)));
}

// create frame
$('body').append('<div id="header"></div><div id="body"></div><div id="footer"></div>');
const header = $('#header');
const body = $('#body');
const footer = $('#footer');

// add step button
header.append('<button id="step-button">Next Step</button>');
const stepButton = $('#step-button');

body.append('<h2>Used literals:</h2><p id="used">' + clausesToString(davisPutnam.used) + '</p>');
body.append('<h2>Choosen literals:</h2><p id="literals">' + literalsToString(davisPutnam.literals) + '</p>');
body.append('<h2>Set of clauses:</h2><p id="clauses">' + clausesToString(davisPutnam.clauses) + '</p>');
const used = $('#used');
const literals = $('#literals');
const clauses = $('#clauses');

stepButton.click((event) => {
    clauses.html(clausesToString(davisPutnam.step().clauses));
    literals.html(literalsToString(davisPutnam.literals));
    used.html(clausesToString(davisPutnam.used));
    if (davisPutnam.done()) clauses.append(davisPutnam.solved() ? '<br>Done!' : '<br>Not solveable');
});
