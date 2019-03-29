const { DavisPutnam, DavisPutnamConsumer } = require('./davisPutnam.js');

/**
 * 
 * @author Koen Loogman <koen@loogman.de>
 */
class DavisPutnamWorker extends	DavisPutnamConsumer {
    constructor() {
        super();

        // create davis putnam instance an add consumer
        this.davisPutnam = new DavisPutnam();
        this.davisPutnam.addConsumer(this);

        // listen to events
        self.addEventListener('message', event => {
            let cmd = event.data.cmd;
            let options = event.data.options;

            // handle commands
            switch(cmd) {
                case 'seed':
                    this.onSeed(options);
                    break;
                case 'clauses':
                    this.onClauses(options);
                    break;
                case 'micro':
                    this.onMicro(options);
                    break;
                case 'step':
                    this.onStep(options);
                    break;
                default:
            }
        });
    }

    /**
     * Tells the main script that the worker started calculating.
     */
    onStart() {
        self.postMessage({
            'cmd': 'start',
            'options': {
                'calculating': true
            }
        });
    }

    /**
     * Tells the main script that the worker is done.
     */
    onEnd() {
        self.postMessage({
            'cmd': 'end',
            'options': {
                'done': this.davisPutnam.done(),
                'satisfied': this.davisPutnam.satisfied(),
                'notSatisfiable': this.davisPutnam.notSatisfiable(),
                'micro': this.davisPutnam.micro,
                'state': this.davisPutnam.state
            }
        });
    }

    /**
     * Sets the seed of the davis putnam object.
     * 
     * @param {{seed: string}} options 
     */
    onSeed(options) {
        this.davisPutnam.seed = options.seed;
    }

    /**
     * Sets the clauses of the davis putnam object.
     * 
     * @param {{clauses: Array<Array<String>>}} options 
     */
    onClauses(options) {
        this.onStart();
        this.davisPutnam.clauses = options.clauses;
        this.onEnd();
    }

    /**
     * Sets the micro value of the davis putnam object.
     * 
     * @param {{micro: Boolean}} options 
     */
    onMicro(options) {
        this.davisPutnam.micro = options.micro;
    }

    /**
     * Calls the step function on the davis putnam algorithm with the given amount of steps.
     * 
     * @param {{step: Number}} options 
     */
    onStep(options) {
        this.onStart();
        this.davisPutnam.step(options.step || 1);
        this.onEnd();
    }

    // Following functions overwrite those of the extended DavisPutnamConsumer
    /**
     * @param {{literal: String, literals: Array<String>, state: Array<String>}} event
     */
    onChoose(event) {
        self.postMessage({
            'cmd': 'choose',
            'options': event
        });
    }

    /**
     * @param {{literal: String, clause: Array<String>, result: Array<String>, state: Array<String>}} event
     */
    onUnitCut(event) {
        self.postMessage({
            'cmd': 'unitCut',
            'options': event
        });
    }

    /**
     * @param {{literal: String, clauses: Array<Array<String>>, state: Array<String>}} event
     */
    onSubsume(event) {
        self.postMessage({
            'cmd': 'subsume',
            'options': event
        });
    }

    /**
     * @param {{state: Array<String>}}
     */
    onBacktrack(event) {
        self.postMessage({
            'cmd': 'backtrack',
            'options': event
        });
    }

    /**
     * @param {{state: Array<String>}} event
     */
    onSatisfied(event) {
        self.postMessage({
            'cmd': 'satisfied',
            'options': event
        });
    }

    /**
     * @param {{state: Array<String>}} event
     */
    onNotSatisfiable(event) {
        self.postMessage({
            'cmd': 'notSatisfiable',
            'options': event
        });
    }
}

// init worker
const davisPutnamWorker = new DavisPutnamWorker();