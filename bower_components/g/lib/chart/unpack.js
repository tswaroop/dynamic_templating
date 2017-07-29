import * as network from './network.js'
let unpack = function() {
  var force,
      width,
      height

  function self(update) {
    var nodes = update.data(),
        i = -1,
        l = nodes.length

    // Initialize x0 and y0 to x and y
    while (++i < l) {
        nodes[i].x0 = nodes[i].x
        nodes[i].y0 = nodes[i].y
    }

    function gravity(k) {
      return function(d) {
        d.x += (d.x0 - d.x) * k
        d.y += (d.y0 - d.y) * k
      }
    }

    var collide = network.collide.circle(function(node) { return node.r })
    force
      .size([width, height])
      .nodes(nodes)
      .on('tick', function tick(e) {
        update.each(gravity(e.alpha * 0.1))
        var q = d3.geom.quadtree(nodes),
            i = 0
        while (++i < l)
          q.visit(collide(nodes[i]))
        update.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')' })
      })
      .start()
  }
  self.width = function(v) { if (!arguments.length) return width; width = v; return self }
  self.height = function(v) { if (!arguments.length) return height; height = v; return self }
  self.force = function(v) { if (!arguments.length) return force; force = v; return self }

  return self.force(
      d3.layout.force()
        .charge(0)
        .gravity(0.01)
    )
}
export {unpack}