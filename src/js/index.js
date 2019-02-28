'use strict';

const $ = require('jquery');
const DavisPutnam = require('./davisPutnam.js');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

const clauses = [
    ['r','p','s'],
    ['r','s'],
    ['q','p','s'],
    ['!p','!q'],
    ['!p','s','!r'],
    ['p','!q','r'],
    ['!r','!s','q'],
    ['p','q','r','s'],
    ['r','!s','q'],
    ['!r','s','!q'],
    ['s','!r']
];

let davisPutnam = new DavisPutnam(clauses);

const setToString = (set) => {
    return '{' + set.join(', ') + '}';
}
const clausesToString = (clauses) => {
    return setToString(clauses.map(clause => setToString(clause)));
}

// create frame
$('body').append('<div id="header"></div><div id="body"></div><div id="footer"></div>');
const header = $('#header');
const body = $('#body');
const footer = $('#footer');

// add step button
header.append('<button id="step-button">Next Step</button>');
const stepButton = $('#step-button');
body.append('<h2>Original set of clauses:</h2><p id="original">' + clausesToString(clauses) + '</p>');
body.append('<h2>Current set of clauses:</h2><p id="current"></p>');
const current = $('#current');

stepButton.click((event) => {
    current.html(clausesToString(davisPutnam.solve(1, false).clauses));
    if (davisPutnam.done()) current.append(davisPutnam.solved() ? '<br>Done!' : '<br>Not solveable');
});
