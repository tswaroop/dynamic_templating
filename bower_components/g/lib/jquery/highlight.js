import {findall, notall} from './start.js'
let highlight = function(options) {
  options = options || {}
  var self = this,
      attr = options.attr || 'data-highlight',
      selector = options.selector || '[' + attr + ']',
      leaveDelay = options.leaveDelay || 30,
      toggle = options.toggle,
      exit_timer,
      selected = []         // list of toggled-on nodes to use for highlighting

  if (options.off)
    return self.off('.g.highlight')

  function select(selected, source) {
    var $source = $(source),
        $target = $($source.data('target') || options.target || selector),
        hideClass = $source.data('hide-class') || options.hideClass || 'fade',
        showClass = $source.data('show-class') || options.showClass || '',
        highlighted = $(),
        unhighlighted,
        nselected = selected.length,
        i = nselected

    if (nselected) {
      // Use selectors to identify highlighted elements
      while (i--) highlighted = highlighted.add(findall($target, $(selected[i]).attr(attr)))
      unhighlighted = $target.not(highlighted)

      // Touch the DOM minimally. For example:
      // - add    .showClass where it's to be highlighted, but not already containing .showClass
      // - remove .showClass where not  to be highlighted, but     already containing .showClass
      if (showClass) {
        notall (highlighted,   '.' + showClass).addClass(showClass)
        findall(unhighlighted, '.' + showClass).removeClass(showClass)
      }
      if (hideClass) {
        findall(highlighted,   '.' + hideClass).removeClass(hideClass)
        notall (unhighlighted, '.' + hideClass).addClass   (hideClass)
      }
    }
    else {
      // If no elements are selected, remove all selectors
      if (showClass) findall($target, '.' + showClass).removeClass(showClass)
      if (hideClass) findall($target, '.' + hideClass).removeClass(hideClass)
    }

    self.trigger({
      type: 'shown.g.highlight',
      selected: $(selected),
      matches: (nselected ? highlighted : $target).length,
      highlighted: highlighted,
      unhighlighted: unhighlighted
    })
  }

  self
    .on('mouseenter.g.highlight', selector, function(e) {
      if (exit_timer) exit_timer = clearTimeout(exit_timer)
      if (!selected.length) select([e.target], this)
    })
    .on('mouseleave.g.highlight', selector, function() {
      if (exit_timer) exit_timer = clearTimeout(exit_timer)
      var source = this
      if (!selected.length) exit_timer = setTimeout(function() { select([], source) }, leaveDelay)
    })
    .on('click.g.highlight', selector, function(e) {
      var $this = $(this), index
      // If data-toggle or the toggle option are specified, toggle selection
      if ($this.data('toggle') || toggle) {
        index = selected.indexOf(e.target)
        if (index >= 0) {
          selected.splice(index, 1)
          $this.removeClass('active')
        } else {
          selected.push(e.target)
          $this.addClass('active')
        }
        select(selected, this)
      }
    })
    .on('clear.g.highlight', function() {
      $(selected).removeClass('active')
      selected.splice(0)
      select(selected, this)
    })

  return self
};
export {highlight}