/* We assign functions for .draw_circle, .draw_label, etc -- so allow function assignment */
/* eslint-disable no-func-assign */

// A k-partite graph has k sets of nodes.
// Each node represents a unique value for one key.
// For example, with cricket data, I could use ['Player', 'Country', 'Ground'] as the keys.
// Each unique player, country or ground becomes a distinct node.
// Each node has a key, value, id=key|value, rows=[indices into data]
// Each link has a source, target, rows=[indices into data]
let kpartite = function() {
  var nodes = [],
      links = [],
      self = {nodes: nodes, links: links},
      data,
      keys = {},
      intralink = {},
      cols = {},
      node_index = {},
      link_index = {}

  // Add a link between nodes[index1] and nodes[index2] referencing a data row
  function add_link(index1, index2, row) {
    var id = index1 + '\t' + index2
    if (id in link_index)
      links[link_index[id]].rows.push(row)
    else {
      link_index[id] = links.length
      links.push({
        source: nodes[index1],
        target: nodes[index2],
        id: id,
        rows: [row]
      })
    }
  }

  function agg(col) {
    // Aggregate values in a column, setting the [col] attr of every node and link
    var aggregator = cols[col].aggregator,
        accessor = cols[col].accessor
    if (typeof accessor == 'function') {
      nodes.forEach(function(node) {node[col] = aggregator(node.rows.map(function(row) { return accessor(data[row]) })) })
      links.forEach(function(link) {link[col] = aggregator(link.rows.map(function(row) { return accessor(data[row]) })) })
    }
    else if (typeof accessor == 'string') {
      nodes.forEach(function(node) { node[col] = aggregator(node.rows.map(function(row) { return data[row][accessor] })) })
      links.forEach(function(link) { link[col] = aggregator(link.rows.map(function(row) { return data[row][accessor] })) })
    }
    else {
      nodes.forEach(function(node) { node[col] = aggregator(node.rows.map(function(row) { return data[row] })) })
      links.forEach(function(link) { link[col] = aggregator(link.rows.map(function(row) { return data[row] })) })
    }
  }

  function recompute() {
    // Recalculate nodes and links
    var i, row, j, lj, k, lk, key, key1, key2, value, vals, id, row_nodes, col_nodes, indices1, indices2

    if (typeof data == 'undefined' || typeof keys == 'undefined')
      return

    // Reset row indices
    nodes.forEach(function(node) { node.rows = [] })
    links.forEach(function(link) { link.rows = [] })

    for (i=0; row=data[i]; i++) {
      row_nodes = {}    // Row's nodes, grouped by key, to be interlinked

      // Create nodes {key, value, id, rows}
      for (key in keys) {
        col_nodes = row_nodes[key] = []
        vals = keys[key](row)
        if (!Array.isArray(vals))
          vals = [vals]

        for (j=0, lj=vals.length; j<lj; j++) {
          value = vals[j]
          id = key + '\t' + value
          if (id in node_index)
            nodes[node_index[id]].rows.push(i)
          else {
            node_index[id] = nodes.length
            nodes.push({key: key, value: value, id: id, rows: [i]})
          }
          col_nodes.push(node_index[id])
        }
      }

      // Link across columns
      for (key1 in keys) {
        indices1 = row_nodes[key1]
        lj = indices1.length
        for (key2 in keys)
          if (key2 > key1) {
            indices2 = row_nodes[key2]
            lk = indices2.length
            for (j=0; j<lj; j++)
              for (k=0; k<lk; k++)
                add_link(indices1[j], indices2[k], i)
          }
      }

      // Link within columns
      if (intralink[key])
        for (key in keys) {
          col_nodes = row_nodes[key]
          for (j=0, lj=col_nodes.length; j<lj; j++)
            for (k=0; k<lj; k++)
              if (j < k)
                add_link(col_nodes[j], col_nodes[k], i)
        }
    }

    // Compute values
    for (var col in cols)
      agg(col)
  }

  self.data = function(v) {
    if (!arguments.length) return data
    data = v
    recompute()
    return self
  }

  // self
  //  .key('Name', function(row) { return row.attr })
  //  .key('Name', function(row) { return [row.val1, row.val2, ...] })
  //  .key('Name', function(row) { return [...] }, {intralink: false})
  //  .key('Name', null)
  self.key = function(name, value, options) {
    if (!arguments.length) return keys
    if (arguments.length == 1) return keys[name]
    if (!value) {
      delete keys[name]
      delete intralink[name]
    }
    else {
      options = options || {}
      keys[name] = value
      intralink[name] = options.intralink === undefined ? true : options.intralink
    }
    recompute()
    return self
  }

  // self
  //  .val('Value', d3.sum, 'value')
  //  .val('MaxValue', d3.max, function(row) { return +row.value })
  //  .val('Unused', null)
  self.val = function(name, aggregator, accessor) {
    if (!arguments.length) return cols
    if (arguments.length == 1) return cols[name]
    if (!aggregator)
      delete cols[name]
    else
      cols[name] = {aggregator: aggregator, accessor: accessor}
    recompute()
    return self
  }

  return self
}


/*
G.network.relation()
    .add([source], [target])   // Connect each source to each target
    .remove([], [])
*/
let relation = function() {
  var nodes = [],
      links = [],
      max_id = 0,
      self = {nodes: nodes, links: links},
      node_index = {},
      link_index = {}

  // Add a node as an object (if not present)
  function add_node(node) {
    if (typeof node != 'object') {
      if (!(node in node_index))
        nodes.push(node_index[node] = {id: node})
      return node_index[node]
    }

    // If it's not a string, assume it's an object
    // Auto-assign a node ID if required
    if (!('id' in node))
      node.id = max_id++

    if (!(node.id in node_index))
      nodes.push(node_index[node.id] = node)
    return node
  }

  self.add = function(source, target) {
    if (!Array.isArray(source)) source = [source]
    if (!Array.isArray(target)) target = [target]

    var source_length = source.length,
        target_length = target.length,
        i,j, src, tgt, id

    // Convert all sources and targets into nodes, if required
    for (i=0; i<source_length; i++)
      source[i] = add_node(source[i])
    for (j=0; j<target_length; j++)
      target[j] = add_node(target[j])

    for (i=0; i<source_length; i++) {
      src = source[i]
      for (j=0; j<target_length; j++) {
        tgt = target[j]
        id = src.id + '\t' + tgt.id
        if (id in link_index)
          links[link_index[id]].count++
        else {
          link_index[id] = links.length
          links.push({source: src, target: tgt, id: id, count: 1})
        }
      }
    }
  }

  return self
}

// Render a force directed layout based on a network as circles and lines
// The following node attributes are reserved:
//    By D3: index, x, y, px, py, fixed, weight
//    By G:  selected
let force = function() {
  var data,               // G.network data structure with .nodes and .links
      node_filter = {},   // Node filter function
      link_filter = {},   // Link filter function
      nodes,              // Currently active nodes
      node_ids,           // Dict mapping node id to node
      links,              // Currently active links
      collide,            // Collision detection function
      brush = d3.svg.brush(),
      force = d3.layout.force(),
      self = {force: force, brush: brush}

  function _node_release(d) {
    d3.select(this).classed('fixed', d.fixed = false)
    d3.event.stopPropagation()
    force.start()
  }

  function _node_fix(d) {
    d3.select(this).classed('fixed', d.fixed = true)
  }

  function draw_line(lines) {
    lines
      .attr('stroke', 'rgba(0,0,0,.3)')
  }

  // By default, draw transparent circles
  function draw_circle(circles) {
    circles
      .attr('r', 5)
      .attr('fill', 'rgba(0,0,0,.5)')
  }

  // By default, don't draw labels
  var draw_label

  force.on('tick', function() {
    if (collide) {
      var q = d3.geom.quadtree(nodes),
          i = 0,
          n = nodes.length
      while (++i < n)
        q.visit(collide(nodes[i]))
    }
    self.lines.attr('x1', function(d) { return d.source.x })
      .attr('y1', function(d) { return d.source.y })
      .attr('x2', function(d) { return d.target.x })
      .attr('y2', function(d) { return d.target.y })
    var set_pos = function(d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    }
    self.circles.attr('transform', set_pos)
    self.labels.attr('transform', set_pos)
  })

  force.drag()
    .on('dragstart', _node_fix)

  // Filters nodes based on fn(node)
  // self.nodes(fn, ns)     sets fn as a filter named ns
  // self.nodes(fn)         sets fn as a filter named undefined
  // self.nodes(null, ns)   removes the filter named ns
  // self.nodes(null)       removes the filter named undefined
  // self.nodes(ns)         returns the filter named ns
  // self.nodes()           returns the filter named undefined
  self.nodes = function(fn, namespace) {
    // If the first argument isn't a function, it's the namespace. Return fn
    if (typeof fn != 'function' && fn !== null)
      return node_filter[fn]

    // If the first argument is null, delete the filter for this namespace
    if (fn === null)
      delete node_filter[namespace]
    else
      node_filter[namespace] = fn

    nodes = []
    node_ids = {}
    var i, node, ns, remove
    for (i=0; node=data.nodes[i]; i++) {
      remove = false
      for (ns in node_filter)
        if (!node_filter[ns](node)) {
          remove = true
          break
        }
      if (!remove) {
        nodes.push(node)
        node_ids[node.id] = 1
      }
    }

    // Remove links to nodes that have been filtered out
    links = filter_links()
    return self
  }

  // Apply all link filters, and remove links to non-existent nodes
  function filter_links() {
    var filtered_links = [],
        i = 0,
        links = data.links,
        source,
        target,
        link
    if (links.length) {
      for (; link=links[i]; i++) {
        // link.source & link.target are resolved into node objects only after .draw()
        source = typeof link.source == 'object' ? link.source : nodes[link.source]
        target = typeof link.target == 'object' ? link.target : nodes[link.target]
        if (source.id in node_ids && target.id in node_ids)
          filtered_links.push(link)
      }
      for (var ns in link_filter)
        filtered_links = filtered_links.filter(link_filter[ns])
    }
    return filtered_links
  }

  // Filters links based on fn(link)
  // self.links(fn, ns)     sets fn as a filter named ns
  // self.links(fn)         sets fn as a filter named undefined
  // self.links(null, ns)   removes the filter named ns
  // self.links(null)       removes the filter named undefined
  // self.links(ns)         returns the filter named ns
  // self.links()           returns the filter named undefined
  self.links = function(fn, namespace) {
    // If the first argument isn't a function, it's the namespace. Return fn
    if (typeof fn != 'function' && fn !== null)
      return link_filter[fn]

    // If the first argument is null, delete the filter for this namespace
    if (fn === null)
      delete link_filter[namespace]
    else
      link_filter[namespace] = fn

    links = filter_links()
    return self
  }

  self.data = function(v) {
    if (!arguments.length) return data
    data = v
    nodes = data.nodes
    links = data.links

    // Ensure that nodes and links have a unique ID.
    // If they don't assign a sequential one
    var count = 0
    if (nodes.length && !nodes[0].id)
      nodes.forEach(function(node) { node.id = count++ })
    count = 0
    if (links.length && !links[0].id)
      links.forEach(function(link) { link.id = count++ })

    node_ids = {}
    nodes.forEach(function(node) { node_ids[node.id] = node })
    return self
  }

  self.circle  = function(v) { if (!arguments.length) return draw_circle; draw_circle = v; return self }
  self.label   = function(v) { if (!arguments.length) return draw_label;  draw_label  = v; return self }
  self.line    = function(v) { if (!arguments.length) return draw_line;   draw_line   = v; return self }
  self.collide = function(v) { if (!arguments.length) return collide;     collide     = v; return self }

  self.draw = function(svg) {
    svg = d3.select(svg)

    var svg_node = svg.node(),
        viewbox = svg_node.viewBox.baseVal,
        size = svg_node.getBoundingClientRect(),
        width = viewbox.width || size.width,
        height = viewbox.height || size.height
    force.size([width, height])

    // Create / find the g.lines and g.circles layers
    var $brush = svg.select('g.brush')
    if ($brush.empty())
      $brush = svg.append('g').attr('class', 'brush')
    var $lines = svg.select('g.lines')
    if ($lines.empty())
      $lines = svg.append('g').attr('class', 'lines')
    var $circles = svg.select('g.circles')
    if ($circles.empty())
      $circles = svg.append('g').attr('class', 'circles')
    var $labels = svg.select('g.labels')
    if ($labels.empty())
      $labels = svg.append('g').attr('class', 'labels')

    force
      .nodes(nodes)
      .links(links)

    self.lines = $lines.selectAll('line.link')
      .data(links, function(d) { return d.id })
    self.lines.exit().remove()
    if (draw_line) {
      self.lines.enter()
        .append('line')
        .attr('class', 'link')
      draw_line(self.lines)
    }

    self.circles = $circles.selectAll('circle.node')
      .data(nodes, function(d) { return d.id })
    self.circles.exit().remove()
    if (draw_circle) {
      self.circles.enter()
        .append('circle')
        .attr('class', 'node')
        .on('dblclick.release', _node_release)
        .call(force.drag)
      draw_circle(self.circles)
    }

    self.labels = $labels.selectAll('text.node')
      .data(nodes, function(d) { return d.id })
    self.labels.exit().remove()
    if (draw_label) {
      self.labels.enter()
        .append('text')
        .attr('class', 'node')
        .on('dblclick.release', _node_release)
        .call(force.drag)
      draw_label(self.labels)
    }

    if (!svg.on('dblclick.release'))
      svg.on('dblclick.release', function() {
        if (d3.event.target == svg.node()) {
          self.circles
            .filter(function(d) { return d.fixed })
            .classed('fixed', function(d) { return d.fixed = false })
          self.labels
            .filter(function(d) { return d.fixed })
            .classed('fixed', function(d) { return d.fixed = false })
          force.start()
        }
      })

    brush
      .x(d3.scale.identity().domain([0, width]))
      .y(d3.scale.identity().domain([0, height]))
      .on('brush.select', function() {
        var extent = d3.event.target.extent()
        self.circles.classed('selected', function(d) {
          return d.selected = extent[0][0] <= d.x && d.x < extent[1][0] &&
                              extent[0][1] <= d.y && d.y < extent[1][1]
        })
        self.labels.classed('selected', function(d) {
          return d.selected = extent[0][0] <= d.x && d.x < extent[1][0] &&
                              extent[0][1] <= d.y && d.y < extent[1][1]
        })
      })
    brush($brush)

    force.start()
    return self
  }

  return self
}

/* Sample usage:

    force                                         // Take a G.network.force() object
      .collide(                                   // Apply collision
        G.network.collide.circle(                 //    using a circular collission detection
          function(node) { return node.size },    //    with the radius of each node taken from the .size attribute
          4                                       //    and a 4px (optional) padding
      ))
*/
var collide = {
  circle: function(radius_function, padding) {
    padding = padding || 0
    return function(node) {
      var r = radius_function(node) + padding,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = radius_function(node) + padding + radius_function(quad.point)
          if (l < r) {
            l = (l - r) / l * 0.5
            node.x -= x *= l
            node.y -= y *= l
            quad.point.x += x
            quad.point.y += y
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
      }
    }
  }
}
export {kpartite, relation, force, collide}
// TODO: arrows (how to do bi-directional relations?)
//    - http://www.jansipke.nl/creating-network-diagrams-with-d3-js/
//    - http://jsfiddle.net/tk7Wv/2/
