'use strict';

const ChessBoard = require('./chessBoard');
const QueensClauses = require('./qeensClauses');
const Two = require('two.js');
const Util = require('./util');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    });
}

class Frame {
    constructor(n = 8, seed = 69) {
        // chessboard
        this.scene = document.getElementById('scene');
        let size = Math.min(this.scene.clientHeight, this.scene.clientWidth) * 0.9;
        this.two = new Two({
            'height': size,
            'width': size,
            'autostart': true
        });
        this.two.appendTo(scene);
        this.board = new ChessBoard(this.two, size);

        // user interactions
        this.nField = document.getElementById('n-field');
        this.seedField = document.getElementById('seed-field');
        this.microToggle = document.getElementById('micro-toggle');
        this.autoToggle = document.getElementById('auto-toggle');
        this.nextButton = document.getElementById('next-button');
        this.resetButton = document.getElementById('reset-button');

        this.nField.addEventListener('change', _ => this.changeN());
        this.seedField.addEventListener('change', _ => this.changeSeed());
        this.microToggle.addEventListener('change', event => this.changeMicro(event));
        this.autoToggle.addEventListener('change', event => this.changeAuto(event));
        this.nextButton.addEventListener('click', _ => this.onNext());
        this.resetButton.addEventListener('click', _ => this.onReset());

        // log
        this.log = document.getElementById('log-entries');
        this.log.addEventListener("click", event => this.onEntry(event));

        // davis putnam worker
        this.dpw = new Worker('./davisPutnamWorker.js');
        this.dpw.addEventListener('message', event => {
            let cmd = event.data.cmd;
            let options = event.data.options;
            
            switch(cmd) {
                case 'start':
                    this.onWorkerStart(options);
                    break;
                case 'end':
                    this.onWorkerEnd(options);
                    break;
                case 'choose':
                case 'unitCut':
                case 'backtrack':
                case 'satisfied':
                case 'notSatisfiable':
                    this.newLogEntry(cmd, options);
                    this.board.setState(options.state);
                    break;
                default:
            }
        });

        // init state with values
        this.n = null;
        this.auto = false;
        this.clauses = null;
        this.seedField.value = n;
        this.changeSeed();
        this.nField.value = seed;
        this.changeN();
    }

    /**
     * 
     * @param {Event} event 
     */
    onEntry(event) {
        /**
         * @type {HTMLElement}
         */
        let target = event.target;
        // only trigger on entries
        if (target.classList.contains('entry')) {
            let state = JSON.parse(target.dataset.state);
            this.board.setState(state);
        }
    }

    newLogEntry(cmd, options) {
        const entry = document.createElement('div');
        entry.classList.add('entry');
        entry.classList.add(cmd);
        entry.dataset.state = JSON.stringify(options.state);

        let text;
        switch(cmd) {
            case 'choose':
                text = 'Choose \'' + options.literal + '\'';
                break;
            case 'backtrack':
                text = 'Backtrack';
                break;
            case 'unitCut':
                text = Util.clauseToString([options.literal]) + ', ' + Util.clauseToString(options.clause) + ' &vdash; ' + Util.clauseToString(options.result);
                break;
            case 'satisfied':
                text = 'Problem satisfied';
                break;
            case 'notSatisfiable':
                text = 'Problem is not satisfiable';
                break;
            default:
        }
        entry.innerHTML = text;

        // prepend entry
        this.log.insertBefore(entry, this.log.firstChild);
    }

    onWorkerStart(options) {
        this.nField.disabled = true;
        this.seedField.disabled = true;
        this.autoToggle.disabled = !this.auto;
        this.microToggle.disabled = true;
        this.nextButton.disabled = true;
        this.resetButton.disabled = true;
    }

    onWorkerEnd(options) {
        this.board.setState(options.state);

        // auto play next step with delay
        if (this.auto && !options.done) {
            setTimeout(() => {
                this.onNext();
            }, 1000);
        } else {
            // enable buttons according to result
            this.nField.disabled = false;
            this.seedField.disabled = false;
            this.autoToggle.disabled = options.done;
            this.microToggle.disabled = false;
            this.nextButton.disabled = options.done;
            this.resetButton.disabled = false;

            if (this.auto) this.autoToggle.checked = this.auto = false;
        }
    }

    changeN() {
        let n = Number(this.nField.value);
        if (isNaN(n) || n < 1){
            alert('only numbers greater 0 are allowed.');
            return;
        }
        console.log('set n to ' + n);
        
        // reset will trigger this function too so we check if we need to recalculate or use the old values
        if (this.n != n) {
            this.n = n;
            this.board.n = n;
            this.clauses = QueensClauses(n);
        } else {
            //this.board.clear();
        }
        this.log.innerHTML = "";
        this.dpw.postMessage({
            'cmd': 'clauses',
            'options': {
                'clauses': this.clauses
            }
        });
    }

    changeSeed() {
        console.log('set seed to ' + this.seedField.value);
        this.dpw.postMessage({
            'cmd': 'seed',
            'options': {
                'seed': this.seedField.value
            }
        });
    }

    /**
     * Sets a random seed for the seed input field. And triggers the event of a new seed being set.
     * 
     * @source https://stackoverflow.com/a/1349426
     * @param {Number} length - of the string 
     */
    randomSeed(length) {
        let seed = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            seed += possible.charAt(Math.round(Math.random() * (possible.length - 1)));

        this.seedField.value = seed;
        this.changeSeed();
    }
    
    onReset() {
        this.changeN();
    }

    onNext() {
        this.dpw.postMessage({
            'cmd': 'step',
            'options': {
                'step': 1
            }
        });
    }

    /**
     * @param {Event} event 
     */
    changeMicro(event) {
        console.log('set micro to ', event.currentTarget.checked);
        this.dpw.postMessage({
            'cmd': 'micro',
            'options': {
                'micro': event.currentTarget.checked
            }
        });
    }

    /**
     * @param {Event} event 
     */
    changeAuto(event) {
        this.auto = event.currentTarget.checked;
        if (this.auto) {
            console.log('activated auto');
            this.onNext();
        } else {
            console.log('deactivated auto');
        }
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

const frame = new Frame();
window.addEventListener('resize', _ => {
    let scene = frame.scene;
    let size = Math.min(scene.clientWidth, scene.clientHeight) * 0.9;
    frame.two.height = size;
    frame.two.width = size;

    // scale the elements to fit the scene
    frame.two.scene.scale = size / frame.board.size;
});