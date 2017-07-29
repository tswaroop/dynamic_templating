let zoom = function(options) {
  options = options || {}
  var selector = options.selector,
      speed = options.speed || 50,
      container = d3.select(selector),
      children = d3.selectAll(container.node().childNodes)
        .filter(function() { return this.nodeName != '#text' }),
      abruptzoom = d3.behavior.zoom()
        .on('zoom', function() {
          children.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
          smoothzoom.translate(d3.event.translate).scale(d3.event.scale)
        }),
      smoothzoom = d3.behavior.zoom()
        .on('zoom', function() {
          children.transition(speed).attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
          abruptzoom.translate(d3.event.translate).scale(d3.event.scale)
        })

  if (options.off) {
    container
      .on('.zoom', null)          // Unbind zoom behaviour. https://github.com/mbostock/d3/issues/894
    children
      .classed('zoom', true)
      .transition()
        .attr('transform', '')
  }
  else {
    container
      .call(abruptzoom)
      .classed('zoom', false)
  }

  var self = {
    // self.on(event, handler) binds handler to event on both smoothzoom and abruptzoom
    // e.g. self.on('zoomstart', handler)
    'on': function(event, handler) {
      smoothzoom.on(event, handler)
      abruptzoom.on(event, handler)
      return self
    },

    'to': function (nodes) {
      var bounds={},
          i=0,
          el, box, trans, scale;
      if (!nodes || !nodes.length) {
        return smoothzoom.translate([0, 0]).scale(1).event(container)
      }
      for (; el=nodes[i]; i++) {
        box = el.getBBox()
        // If the element is transformed, add the transformed position
        trans = (el.getAttribute('transform') || '').match(/translate\(([\+\-\d\.]+),([\+\-\d\.]+)\)/)
        if (trans) {
          box.x += +trans[1]
          box.y += +trans[2]
        }
        /* jshint -W018 */ // ignore confusing use of ! message. ! is needed to handle invalid values
        if (!(box.x >= bounds.x)) bounds.x = box.x
        if (!(box.y >= bounds.y)) bounds.y = box.y
        if (!(box.x + box.width <= bounds.x2)) bounds.x2 = box.x + box.width
        if (!(box.y + box.height <= bounds.y2)) bounds.y2 = box.y + box.height
      }
      bounds.width = bounds.x2 - bounds.x
      bounds.height = bounds.y2 - bounds.y
      scale = Math.min(width / bounds.width, height / bounds.height) * 0.7
      smoothzoom
        .translate([(-bounds.x - bounds.width/2) * scale + width/2, (-bounds.y - bounds.height/2) * scale  + height/2])
        .scale(scale)
        .event(container)
      return self
    }
  }

  return self
}

export {zoom}
