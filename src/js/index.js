'use strict';

const ChessBoard = require('./chessBoard');
const QueensClauses = require('./qeensClauses');
const Two = require('two.js');
const Util = require('./util');

// force page refresh on hot reload (Parcel Stuff)
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    });
}

/**
 * A Frame class to setup the GUI for the N-Queens Problem animation.
 * It creates all handlers and background tasks for the user interaction and visual representation.
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
class Frame {
    constructor(options) {
        // overwrite default settings with the options
        const settings = {
            n: 8,
            seed: 69
        };
        this.settings = {...settings, ...options};

        // Two.js chessboard for visual representation of the state
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

        // get user interaction elements by their id
        this.nField = document.getElementById('n-field');
        this.seedField = document.getElementById('seed-field');
        this.microToggle = document.getElementById('micro-toggle');
        this.autoToggle = document.getElementById('auto-toggle');
        this.nextButton = document.getElementById('next-button');
        this.resetButton = document.getElementById('reset-button');
        this.log = document.getElementById('log-entries');

        // setup listeners for those user interaction elements
        this.nField.addEventListener('change', _ => this.changeN());
        this.seedField.addEventListener('change', _ => this.changeSeed());
        this.microToggle.addEventListener('change', _ => this.changeMicro());
        this.autoToggle.addEventListener('change', _ => this.changeAuto());
        this.nextButton.addEventListener('click', _ => this.onNext());
        this.resetButton.addEventListener('click', _ => this.onReset());
        this.log.addEventListener("click", event => this.onEntry(event));

        // setup the DavisPutnamWorker as a independent thread
        this.dpw = new Worker('./davisPutnamWorker.js');
        // create a listener for incoming commands of the worker
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
                    // undefined command
            }
        });

        // init frame
        this.n = null;
        this.auto = false;
        this.calculating = false;
        this.clauses = null;
        
        // set start values of the animation
        this.nField.value = settings.n;
        this.seedField.value = settings.seed;

        // init chessboard
        this.changeSeed();
        this.changeN();
    }

    /**
     * This function is called when the user clicks on a log entry.
     * It changes the state of the chessboard to the state it had when the entry was added to the log.
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
            // remove old selected flag
            let selected = this.log.querySelector('.selected');
            if (selected) selected.classList.remove('selected');

            // add new selected flag and retrieve the state
            target.classList.add('selected');
            let state = JSON.parse(target.dataset.state);
            this.board.setState(state);
        }
    }

    /**
     * This function creates a new log entry depending on the type of command that came from the DavisPutnamWorker.
     * 
     * @param {String} cmd 
     * @param {*} options 
     */
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
                // unknown command
                return;
        }
        entry.innerHTML = text;

        // remove old selected flag
        let selected = this.log.querySelector('.selected');
        if (selected) selected.classList.remove('selected');
        // add new selected flag
        entry.classList.add('selected');

        // prepend entry
        this.log.insertBefore(entry, this.log.firstChild);
    }

    /**
     * This function is called when the worker starts calculating.
     * It locks the user interaction to prevent new unwanted commands to be send to the worker.
     * 
     * @param {{calculating: Boolean}} options 
     */
    onWorkerStart(options) {
        this.nField.disabled = true;
        this.seedField.disabled = true;
        this.autoToggle.disabled = !this.auto;
        this.microToggle.disabled = true;
        this.nextButton.disabled = true;
        this.resetButton.disabled = true;

        // lock next step
        this.calculating = options.calculating;
    }

    /**
     * This function is called when the worker finished its calculation.
     * It unlocks the user interaction again.
     * 
     * @param {*} options 
     */
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

    /**
     * This function is called if the user changes the N for the N-Queens Problem.
     * It changes the chessboard to be able to visualize the new problem and calculates the new set of clauses for the DavisPutnamWorker.
     */
    changeN() {
        let n = Number(this.nField.value);
        if (isNaN(n) || n < 1){
            alert('only numbers greater 0 are allowed.');
            this.nField.value = this.board.n;
            return;
        }
        if (n > 32) {
            if (!confirm('are you sure you want to use such a high number?')) {
                this.nField.value = this.board.n;
                return;
            }
        }
        
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

    /**
     * This function is called if the user changes the seed.
     * It hands the seed over to the DavisPutnamWorker.
     */
    changeSeed() {
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
    
    /**
     * This function is called if the user wants to reset the animation.
     * It basically sets the N to the same value.
     */
    onReset() {
        this.changeN();
    }

    /**
     * This function is called if the user wants to see the next step of the calculation.
     * It tells the DavisPutnamWorker to calculate the next step.
     */
    onNext() {
        if (!this.calculating) this.dpw.postMessage({
            'cmd': 'step',
            'options': {
                'step': 1
            }
        });
    }

    /**
     * This function is called if the user wants to change from micro to macro steps and vice versa.
     */
    changeMicro() {
        this.dpw.postMessage({
            'cmd': 'micro',
            'options': {
                'micro': this.microToggle.checked
            }
        });
    }

    /**
     * This function is called if the user wants to start or stop the automated steps.
     */
    changeAuto() {
        this.auto = this.autoToggle.checked;
        if (this.auto) {
            this.onNext();
        } else {
            // auto is false
        }
    }
}

// initialize frame
const frame = new Frame();
// resize Two.js on window resize for responsiveness
window.addEventListener('resize', _ => {
    let scene = frame.scene; // get container of two.js object
    let size = Math.min(scene.clientWidth, scene.clientHeight) * 0.9;
    frame.two.height = size;
    frame.two.width = size;

    // scale the elements to fit the scene
    frame.two.scene.scale = size / frame.board.size;
});