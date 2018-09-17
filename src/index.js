'use strict';
const p5 = require('./p5');
const Sketch = require('./sketch');

//Force page refresh on hot reload
if (module.hot) {
    module.hot.accept(function () {
        window.location.reload();
    })
}

// start p5
new p5(Sketch);