let panzoom = function(options) {
  options = options || {}
  var self = this,
      attr = options.attr || 'data-zoom',
      selector = options.selector || '[' + attr + ']',
      default_target = options.target,
      default_zoom = options.zoom || 4,
      viewBox = 'viewBox',    // The value MUST remain 'viewBox'. Do not change
      animdata = 'animated'

  if (options.off)
    return self.off('click.panzoom')

  self.on('click', selector, function(e) {
    var $selector = $(this),
        target = $selector.data('target') || default_target,
        zoom = $selector.attr(attr) || default_zoom,
        $target = $(target)

    function clearZoom() {
      $target.each(function() {
        var newbox = $(this).data(viewBox)
        if (d3)
          d3.select(this).transition().duration(100).attr(viewBox, newbox)
        else
          this.setAttribute(viewBox, newbox)
      })
    }

    function setZoom(e) {
      $target.each(function() {
        var $this = $(this),
            viewBoxParts = $this.data(viewBox),
            size = this.getBoundingClientRect(),
            width = +viewBoxParts[2] || size.width,
            height = +viewBoxParts[3] || size.height,
            // For IE: use pageX, not offsetX
            offset = $this.offset(),
            x = e.pageX - offset.left,
            y = e.pageY - offset.top,
            newbox = [x, y, width / zoom, height / zoom].join(' ')

        if (d3 && !e.type.match(/move/)) {
          $this.data(animdata, true)
          d3.select(this)
            .transition()
              .duration(100)
              .attr(viewBox, newbox)
              .each('end', function() { $this.data(animdata, false) })
        }
        else if (!$this.data(animdata))
          this.setAttribute(viewBox, newbox)
      })
    }

    if ($selector.is('.active')) {
      clearZoom()
      $target
        .off('.panzoom')
        .each(function() { $(this).removeData(viewBox) })
    } else {
      $target
        .each(function() { $(this).data(viewBox, (this.getAttribute(viewBox) || '').split(/,|\s+/)) })
        .on('mousemove.panzoom', setZoom)
      setZoom(e)
    }
    $selector.toggleClass('active')
  })

  return self
}
export {panzoom}