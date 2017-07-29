/*
  Wraps text inside an SVG element.

  Inspiration:

  - http://stackoverflow.com/questions/7046986/svg-using-getcomputedtextlength-to-wrap-text/7059050#7059050
  - http://bl.ocks.org/mbostock/7555321
  - http://svgjs.com/javascripts/svg.textflow.js

  Impact of attributes:
  - x, y, dx, dy, dominant-baseline: used as-is
  - line-height: specified in ems
  - vertical-align: used for vertical alignment. TODO

  Browser compability to check on IE9, Firefox, iOS, Android:
  - Get textContent
  - Set textContent to empty a node
*/

let wrap = function(node) {
  var text = node.textContent,
      width = +node.getAttributeNS(null, 'width') || node.getComputedTextLength(),
      height = +node.getAttributeNS(null, 'height'),
      x = node.getAttributeNS(null, 'x') || 0,
      y = node.getAttributeNS(null, 'y') || 0,
      dx = node.getAttributeNS(null, 'dx'),
      baseline = node.getAttributeNS(null, 'dominant-baseline'),
      dy = node.getAttributeNS(null, 'dy') || '',
      lineHeight = +node.getAttributeNS(null, 'line-height') || 1.3,
      words = text.trim().split(/\s+/).reverse(),
      line = [],
      tspan, word

  // If dy= is specified in ems, start with that as line number
  if (dy.match(/em$/))
    dy = parseFloat(dy)
  // If dy= is specified in pixels, adjust the y= value instead
  else if (dy.match(/^-?[0-9]+/)){
    y = (+y) + (+dy)
    dy = 0
  } else
    dy = 0

  // Empty child nodes
  node.textContent = ''

  function new_tspan() {
    var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttributeNS(null, 'x', x)
    tspan.setAttributeNS(null, 'y', y)
    if (dx) tspan.setAttributeNS(null, 'dx', dx)
    if (baseline) tspan.setAttributeNS(null, 'dominant-baseline', baseline)
    tspan.setAttributeNS(null, 'dy', dy + 'em')
    node.appendChild(tspan)
    return tspan
  }

  tspan = new_tspan()
  while (word = words.pop()) {
    line.push(word)
    tspan.textContent = line.join(' ')

    // .getComputedTextLength(), takes up 99% of the time.
    // Minimise the # of calls to this function
    if (tspan.getComputedTextLength() > width) {
      line.pop()
      tspan.textContent = line.join(' ')
      line = [word]
      dy += lineHeight
      tspan = new_tspan()
      if (height && node.getBBox().height >= height) {
        node.removeChild(tspan)
        break
      }
      else
        tspan.textContent = word
    }
  }
  return node
}

export {wrap}