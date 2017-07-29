let map = function() {
  var shape,        // GeoJSON shape
      width,
      height,
      force,
      projection,
      path,
      unpack,
      draw_label,
      size = function() { return 5; },
      self = {}

  function center_shape() {
    // http://bl.ocks.org/4707858
    // Centers mercator projections
    projection
      .scale(1)
      .translate([0, 0])

    var b = path.bounds(shape),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2]

    projection
      .scale(s)
      .translate(t)
  }

  function add_labels(selection) {
    if (!draw_label)
      return

    // Create text nodes for each shape features
    var update = selection.selectAll('text.map')
      .data(shape.features)

    update
      .transition()
    update.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')     // Vertically centered
      .attr('class', 'map')
    update.exit()
      .remove()

    // Transform the text nodes and position them at the center of the shape element
    update.attr('transform', function(d) {
      var centroid = path.centroid(d)
      return 'translate(' + centroid[0] + ',' + centroid[1] + ')'
    })

    // Apply the label drawing function
    draw_label(update)

    return self
  }


  self.map = function(selection) {
    center_shape()
    var update = selection.selectAll('path.map')
      .data(shape.features)
    update
      .transition()
      .attr('transform', null)
      .attr('d', path)
    update.enter()
      .append('path')
      .attr('class', 'map')
      .attr('transform', null)
      .attr('d', path)
    update.exit()
      .remove()

    add_labels(selection)
    return update
  }

  self.dorling = function(selection) {
    center_shape()
    var circle_path = function(d) {
          return d.r > 0 ? 'M0,0m-{r},0a{r},{r} 0 1,0 {d},0a{r},{r} 0 1,0 -{d},0'
                            .replace(/\{r\}/g, d.r)
                            .replace(/\{d\}/g, 2 * d.r)
                         : 'M0,0'
        },
        nodes = shape.features.map(function(d, i) {
          var centroid = path.centroid(d.geometry)
          return (typeof centroid === 'undefined') ? {x:0, y:0} : {
               x : centroid[0],
               y : centroid[1],
               r : size(d, i),
               properties: d.properties
          }
        }),
        update = selection.selectAll('path.map').data(nodes)

    update
      // Don't transition dorling, for now. Change in values look weird
      // .transition()
      .attr('d', circle_path)
    update.enter()
      .append('path')
      .attr('class', 'map')
      .attr('d', circle_path)
    update.exit()
      .remove()

    if (!unpack) {
      unpack = unpack()
        .width(width)
        .height(height)
    }
    unpack(update)

    add_labels(selection)
    return update
  }

  self.shape = function(v) { if (!arguments.length) return shape; shape = v; return self; }
  self.width = function(v) { if (!arguments.length) return width; width = v; return self; }
  self.height = function(v) { if (!arguments.length) return height; height = v; return self; }
  self.force = function(v) { if (!arguments.length) return force; force = v; return self; }
  self.size = function(v) { if (!arguments.length) return size; size = v; return self; }
  self.path = function(v) { if (!arguments.length) return path; path = v; return self; }
  self.label = function(v) { if (!arguments.length) return draw_label; draw_label = v; return self; }
  self.projection = function(v) {
    if (!arguments.length) return projection
    projection = v
    path = d3.geo.path()
      .projection(v)
    return self
  }

  return self
    .projection(d3.geo.mercator())
    .force(
      d3.layout.force()
        .charge(0)
        .gravity(0.01)
    )
}

export {map}
