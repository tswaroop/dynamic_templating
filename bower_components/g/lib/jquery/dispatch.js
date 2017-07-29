/*
Usage: $(selector).dispatch(event, options);

Simulate the event on the selector.

    $('a').dispatch('click');
    $('input').dispatch('change');

Options
-------
- bubbles: whether the event bubbles or not. default: true
- cancelable: whether the event is cancelable or not. default: true
- All other `new Event()` options will also work
*/

var _event;
try {
  new Event('click');
  _event = function(name, options) {
    // At least on Firefox, you need to send the right event subclass.
    // See https://developer.mozilla.org/en-US/docs/Web/Reference/Events for the list
    // This is a partial implementation
    if (name.match(/click$|^mouse|^menu$/)) return new MouseEvent(name, options)
    else if (name.match(/^key/))            return new KeyboardEvent(name, options)
    else if (name.match(/^focus|^blur$/))   return new FocusEvent(name, options)
    else                                    return new Event(name, options);
  };
} catch (e) {
  _event = function(name, options) {
    var evt = document.createEvent('event');
    evt.initEvent(name, options.bubbles, options.cancelable);
    return evt;
  };
}
var dispatch = function(name, options) {
  return this.each(function() {
    this.dispatchEvent(_event(name, $.extend({
      bubbles: true,
      cancelable: true
    }, options)));
  });
};

export {dispatch}
