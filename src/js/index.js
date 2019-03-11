'use strict';

const $ = require('jquery');
const { DavisPutnam, DavisPutnamConsumer } = require('./davisPutnam.js');
const ChessBoard = require('./chessBoard');
const QueensClauses = require('./qeensClauses');
const Util = require('./util');

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
    constructor(n = 8) {
        super();

        this.clauses = QueensClauses(n);
        this.davisPutnam = new DavisPutnam(this.clauses);
        this.davisPutnam.addConsumer(this);
        this.board = new ChessBoard(n);

        // create frame
        $('body').append('<div id="header"></div><div id="body"></div><div id="footer"></div>');
        this.header = $('#header');
        this.body = $('#body');
        this.footer = $('#footer');

        // add step button
        this.header.append('<button id="step-button">Next Step</button>');
        this.header.append(' micro steps: <input type="checkbox" id="micro-toggle"></input>');
        this.header.append('<button id="reset-button">Reset</button>');
        this.stepButton = $('#step-button');
        this.microToggle = $('#micro-toggle');
        this.resetButton = $('#reset-button');

        this.stepButton.click(event => this.onNext(event));
        this.microToggle.change(event => this.onMicro(event));
        this.resetButton.click(event => this.onReset(event));

        this.draw();
    }

    draw() {
        this.stepButton.prop('disabled', this.davisPutnam.solved());
        this.board.setState(this.davisPutnam.clauses);
        this.body.html('<pre>' + this.board.toString() + '</pre>');
    }
    
    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onReset(event) {
        this.davisPutnam.clauses = this.clauses;
        this.board.clear();
        this.footer.html('');

        this.draw();
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onNext(event) {
        this.davisPutnam.step();
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onMicro(event) {
        this.davisPutnam.micro = event.currentTarget.checked;
    }

    onReduce(event) {
        this.draw();
    }

    onSolved(event) {
        this.draw();
        this.footer.html('Solution found!');
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

const frame = new Frame();