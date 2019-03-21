'use strict';

const $ = require('jquery');
const ChessBoard = require('./chessBoard');
const QueensClauses = require('./qeensClauses');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

class Frame {
    constructor(n = 8, seed = null) {
        this.seed = seed;
        this.clauses = QueensClauses(n);

        
        this.board = new ChessBoard(n);
        this.auto = false;
        
        this.dpw = new Worker('./davisPutnamWorker.js');
        this.dpw.addEventListener('message', event => {
            let cmd = event.data.cmd;
            let options = event.data.options;

            switch(cmd) {
                case 'step':
                    this.onStep(options);
                    break;
                default:
            }
            console.log('dpw:', event.data);
            if (options.state) this.board.setState(options.state);
            this.draw();
        });

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
        this.nextButton = $('#step-button');
        this.microToggle = $('#micro-toggle');
        this.autoToggle = $('#auto-toggle');
        this.resetButton = $('#reset-button');

        this.nextButton.click(event => this.onNext(event));
        this.microToggle.change(event => this.onMicro(event));
        this.autoToggle.change(event => this.onAuto(event));
        this.resetButton.click(event => this.onReset(event));

        this.body.append('<pre id="board-target">' + this.board.toString() + '</pre>');
        
        this.body.append('<div id="step-info"></div>');
        this.boardTarget = $('#board-target');

        // init stuff
        this.onReset();
        this.onSeed();
    }

    draw() {
        this.boardTarget.html(this.board.toString());
    }

    onStep(options) {
        // auto play next step with delay
        if (this.auto && !options.done) {
            setTimeout(() => {
                this.nextButton.click();
            }, 100);
        } else {
            this.nextButton.prop('disabled', options.done);
        }
    }
    
    onReset() {
        this.dpw.postMessage({
            'cmd': 'clauses',
            'options': {
                'clauses': this.clauses
            }
        });

        this.nextButton.prop('disabled', false);
        this.board.clear();
        this.draw();
    }

    onSeed() {
        this.dpw.postMessage({
            'cmd': 'seed',
            'options': {
                'seed': this.seed
            }
        });
    }

    onNext() {
        this.nextButton.prop('disabled', true);
        this.dpw.postMessage({
            'cmd': 'step',
            'options': {
                'step': 1
            }
        });
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onMicro(event) {
        // this.davisPutnam.micro = event.currentTarget.checked;
    }

    /**
     * @param {JQuery.ClickEvent<HTMLElement, HTMLElement, null, HTMLElement>} event 
     */
    onAuto(event) {
        this.auto = event.currentTarget.checked;
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

const frame = new Frame(16, 'seed');