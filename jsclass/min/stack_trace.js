!function(e){var t="object"==typeof exports,n="undefined"==typeof JS?require("./core"):JS,r=n.Observable||require("./observable").Observable,s=n.Enumerable||require("./enumerable").Enumerable,i=n.Console||require("./console").Console;t&&(exports.JS=exports),e(n,r,s,i,t?exports:n)}(function(e,t,n,r,s){"use strict";var i=new e.Module("StackTrace",{extend:{logger:new e.Singleton({include:r,active:!1,update:function(e,t){if(this.active)switch(e){case"call":return this.logEnter(t);case"return":return this.logExit(t);case"error":return this.logError(t)}},indent:function(){var e=" ";return i.forEach(function(){e+="|  "}),e},fullName:function(e){var t=r,n=e.method,s=e.env,i=n.name,o=n.module;return t.nameOf(s)+(o===s?"":"("+t.nameOf(o)+")")+"#"+i},logEnter:function(e){var t=this.fullName(e),n=r.convert(e.args).replace(/^\[/,"(").replace(/\]$/,")");this._open&&this.puts(),this.reset(),this.print(" "),this.consoleFormat("bgblack","white"),this.print("TRACE"),this.reset(),this.print(this.indent()),this.blue(),this.print(t),this.red(),this.print(n),this.reset(),this._open=!0},logExit:function(e){var t=this.fullName(e);e.leaf?(this.consoleFormat("red"),this.print(" --> ")):(this.reset(),this.print(" "),this.consoleFormat("bgblack","white"),this.print("TRACE"),this.reset(),this.print(this.indent()),this.blue(),this.print(t),this.red(),this.print(" --> ")),this.consoleFormat("yellow"),this.puts(r.convert(e.result)),this.reset(),this.print(""),this._open=!1},logError:function(e){this.puts(),this.reset(),this.print(" "),this.consoleFormat("bgred","white"),this.print("ERROR"),this.consoleFormat("bold","red"),this.print(" "+r.convert(e)),this.reset(),this.print(" thrown by "),this.bold(),this.print(i.top().name),this.reset(),this.puts(". Backtrace:"),this.backtrace()},backtrace:function(){i.reverseForEach(function(e){var t=r.convert(e.args).replace(/^\[/,"(").replace(/\]$/,")");this.print("      | "),this.consoleFormat("blue"),this.print(e.name),this.red(),this.print(t),this.reset(),this.puts(" in "),this.print("      |  "),this.bold(),this.puts(r.convert(e.object))},this),this.reset(),this.puts()}}),include:[t,n],wrap:function(e,t,n){var r=i,s=function(){var s;r.push(this,t,n,Array.prototype.slice.call(arguments));try{s=e.apply(this,arguments)}catch(i){r.error(i)}return r.pop(s),s};return s.toString=function(){return""+e},s.__traced__=!0,s},stack:[],forEach:function(e,t){n.forEach.call(this.stack,e,t)},top:function(){return this.stack[this.stack.length-1]||{}},push:function(e,t,n,r){var s=this.stack;s.length>0&&(s[s.length-1].leaf=!1);var i={object:e,method:t,env:n,args:r,leaf:!0};i.name=this.logger.fullName(i),this.notifyObservers("call",i),s.push(i)},pop:function(e){var t=this.stack.pop();t.result=e,this.notifyObservers("return",t)},error:function(e){if(e.logged)throw e;throw e.logged=!0,this.notifyObservers("error",e),this.stack=[],e}}});i.addObserver(i.logger),s.StackTrace=i});
//@ sourceMappingURL=stack_trace.js.map