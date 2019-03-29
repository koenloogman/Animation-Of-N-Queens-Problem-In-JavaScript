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
    constructor(options) {
        // overwrite default settings with the options
        const settings = {
            n: 8,
            seed: 69
        };
        this.settings = {...settings, ...options};

        // chessboard
        this.scene = document.getElementById('scene');
        let size = Math.min(this.scene.clientHeight, this.scene.clientWidth) * 0.9;
        this.two = new Two({
            'height': size,
            'width': size,
            'autostart': true
        });
        this.two.appendTo(scene);
        this.board = new ChessBoard({
            'two': this.two,
            'size': size
        });

        // user interactions
        this.nField = document.getElementById('n-field');
        this.seedField = document.getElementById('seed-field');
        this.microToggle = document.getElementById('micro-toggle');
        this.autoToggle = document.getElementById('auto-toggle');
        this.nextButton = document.getElementById('next-button');
        this.resetButton = document.getElementById('reset-button');

        this.nField.addEventListener('change', _ => this.changeN());
        this.seedField.addEventListener('change', _ => this.changeSeed());
        this.microToggle.addEventListener('change', _ => this.changeMicro());
        this.autoToggle.addEventListener('change', _ => this.changeAuto());
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

        // init frame
        this.n = null;
        this.auto = false;
        this.calculating = false;
        this.clauses = null;
        this.nField.value = settings.n;
        this.seedField.value = settings.seed;

        // init chessboard
        this.changeSeed();
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

        // span is used to syntax highlight so move up to the div element
        while (target.nodeName == 'SPAN') {
            target = target.parentNode;
        }

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
                let _class = options.literal.substr(0, 1) != '!' ? 'true' : 'false';
                text = 'Choose <span class="literal ' + _class + '">\'' + options.literal + '\'</span>';
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

        // lock next step
        this.calculating = true;
    }

    onWorkerEnd(options) {
        // hand state to chessboard
        this.board.setState(options.state);
        // free next step
        this.calculating = false;

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

            // disable auto if set
            if (this.auto) {
                this.autoToggle.checked = false;
                this.changeAuto();
            }
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
        if (!this.calculating) this.dpw.postMessage({
            'cmd': 'step',
            'options': {
                'step': 1
            }
        });
    }

    /**
     * 
     */
    changeMicro() {
        console.log('set micro to ', this.microToggle.checked);
        this.dpw.postMessage({
            'cmd': 'micro',
            'options': {
                'micro': this.microToggle.checked
            }
        });
    }

    /**
     * 
     */
    changeAuto() {
        this.auto = this.autoToggle.checked;
        if (this.auto) {
            console.log('activated auto');
            this.onNext();
        } else {
            console.log('deactivated auto');
        }
    }
}

const frame = new Frame();
window.addEventListener('resize', _ => {
    let scene = frame.scene;
    let size = Math.min(scene.clientWidth, scene.clientHeight) * 0.9;
    frame.two.height = size;
    frame.two.width = size;

    // scale the elements to fit the scene
    frame.two.scene.scale = size / frame.board.size;
});