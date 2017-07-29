/*
Usage: $(selector).aspect(options);

Set the aspect ratio of the selector based on the options.

    $('svg').aspect({     // Apply directly to all SVG elements
      height: 0.8         // height = 0.80 * width
    })
    $('body').aspect({    // Bind to body
      selector: 'svg',    // Apply to all SVG elements
      width: 1.25         // width = 1.25 * height
    })

Note: Shawn Allen has an alternate mechanism at
https://github.com/shawnbot/svg-aspect-ratio/blob/master/svg-autosize.js
*/
import {getSize, findall} from './start.js'
let aspect = function(options) {
  options = options || {}
  var resize,
      self = this,
      width = options.width,
      height = options.height,
      doc = self[0].ownerDocument,
      $win = $(doc.defaultView || doc.parentWindow)

  if (options.off) {
    $win.off('.g.aspect')
    return self
  }

  resize = function () {
    (options.selector ? findall(self, options.selector) : self).each(function() {
      var $this = $(this),
          w = $this.data('width') || width,
          h = $this.data('height') || height,
          box = getSize(this)

      if (h)      $this.css('height', Math.ceil(h * box.width))
      else if (w) $this.css('width',  Math.ceil(w * box.height))
    })
  }

  $win
    .on('load.g.aspect', resize)
    .on('resize.g.aspect', resize)
    .on('orientationchange.g.aspect', resize)
  resize()
  return self
}
export {aspect}