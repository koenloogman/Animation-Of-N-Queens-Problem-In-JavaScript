'use strict';

const $ = require('jquery');
const { DavisPutnam, DavisPutnamConsumer } = require('./davisPutnam.js');
const ChessBoard = require('./chessBoard');
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
    constructor(n = 8, seed = null) {
        super();

        this.clauses = QueensClauses(n);
        this.davisPutnam = new DavisPutnam(this.clauses, seed);
        this.davisPutnam.addConsumer(this);
        this.board = new ChessBoard(n);
        this.auto = false;

        // create frame
        $('body').append('<div id="header"></div><div id="body"></div><div id="footer"></div>');
        this.header = $('#header');
        this.body = $('#body');
        this.footer = $('#footer');

        // add step button
        this.header.append('<button id="step-button">Next Step</button>');
        this.header.append(' micro steps: <input type="checkbox" id="micro-toggle"></input>');
        this.header.append(' auto: <input type="checkbox" id="auto-toggle"></input>');
        this.header.append(' <button id="reset-button">Reset</button>');
        this.stepButton = $('#step-button');
        this.microToggle = $('#micro-toggle');
        this.autoToggle = $('#auto-toggle');
        this.resetButton = $('#reset-button');

        this.stepButton.click(event => this.onNext(event));
        this.microToggle.change(event => this.onMicro(event));
        this.autoToggle.change(event => this.onAuto(event));
        this.resetButton.click(event => this.onReset(event));

        this.body.append('<pre id="board-target">' + this.board.toString() + '</pre>');
        
        this.body.append('<div id="step-info"></div>');
        this.boardTarget = $('#board-target');
        this.stepInfo = $('#step-info');
    }

    draw() {
        this.boardTarget.html(this.board.toString());
        this.stepButton.prop('disabled', this.davisPutnam.done());
        this.board.setState(this.davisPutnam.clauses);
    }
    
    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onReset(event) {
        this.davisPutnam.clauses = this.clauses;
        this.board.clear();
        this.stepInfo.html('');
        this.footer.html('');
        this.draw();
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onNext(event) {
        this.footer.html('');
        this.davisPutnam.step();
        this.draw();

        if (!this.davisPutnam.done() && this.auto) {
            setTimeout(() => {
                frame.stepButton.click();
            }, 100);
        }
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onMicro(event) {
        this.davisPutnam.micro = event.currentTarget.checked;
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onAuto(event) {
        this.auto = event.currentTarget.checked;
    }

    onChoose(event) {
        super.onChoose(event);
        this.footer.append('Choose ' + event.literal + '<br>');
    }

    onUnitCut(event) {
        super.onUnitCut(event);
        this.stepInfo.html('<div>Literal: ' + event.literal + '</div>');
    }

    onBacktrack(event) {
        super.onBacktrack(event);
        this.footer.append('Backtracked<br>');
    }

    onSatisfied(event) {
        super.onSatisfied(event);
        this.draw();
        this.footer.append('Solution found! [' + event.solution.join('] , [') + ']<br>');
    }

    onNotSatisfiable(event) {
        super.onNotSatisfiable(event);
        this.draw();
        this.footer.append('No solution found...<br>');
    }
}

// const clauses = [
//     ['r','s'],
//     ['s','!r'],
//     ['!p','!q'],
//     ['q','p','s'],
//     ['r','p','s'],
//     ['p','!q','r'],
//     ['r','!s','q'],
//     ['!r','!s','q'],
//     ['!p','s','!r'],
//     ['!r','s','!q'],
//     ['p','q','r','s'],
// ];

const frame = new Frame(8, 'seed');
console.log(frame);