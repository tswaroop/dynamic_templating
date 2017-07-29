/* Animates a set of paths */

let doodle = function(options) {
  options = options || {}

  // By default, options.fill is true
  if (!('fill' in options))
    options.fill = true

      // Constant indices into the paths[] array
  var PATH = 0,
      WIDTH = 1,
      END_POS = 2,
      PATH_LENGTH = 3,
      FILL = 4,

      // Variables
      self = this,
      paths = [],             // List of path information, captured when .doodle() is first called
      total_width = 0,        // Total width of all paths in pixels
      default_duration = 0,   // Counter for duration specified by data-duration="..."
      easing = options.easing || function(t) { return t },
      start_pos = 0,  // starting position, in time domain
      start_time,     // timestamp at which start_pos was set
      pos,            // current position, in time domain
      path_pos,       // current position, in path domain
      end_path_pos,   // position at which current path ends, in path domain
      duration,       // duration of this doodle in seconds
      index,          // generic index variable
      length,         // generic length variable
      path,           // current path that's being animated
      request_id,     // requestAnimationFrame id. False-y if none is pending
      timeout_id      // setTimeout id. False-y if none is pending

  self
    // Turn off any other doodling on these paths
    .off('stop.g.doodle start.g.doodle')
    // And re-define the events
    .on('stop.g.doodle', function(e, position) {
      if (!request_id)
        return
      if (typeof position != 'undefined') {
        // Move to specified position. 1 is the end, 0 is the start
        start_pos = position
        start_time = Date.now()
        draw()
      } else {
        // Store the current pos as start_pos to allow resuming
        start_pos = pos
      }
      // Cancel ticks as well as loop
      request_id = cancelAnimationFrame(request_id)
      if (timeout_id)
        timeout_id = clearTimeout(timeout_id)
    })
    .on('start.g.doodle', function(e, position) {
      if (request_id)
        return
      if (typeof position != 'undefined') {
        // When a specific position is set
        start_pos = position
        path_pos = easing(position)
        // Set or reset stroke-dashoffset. All paths after pos are set to the end, those before are set to 0
        for (index=0; index < length; index++)
          paths[index][PATH].attr('stroke-dashoffset', path_pos < paths[index][END_POS] ? paths[index][PATH_LENGTH] : 0)
        // If options.fill, set or reset fill. All paths after pos are cleared, those before are filled
        if (options.fill)
          for (index=0; index < length; index++)
              paths[index][PATH].css('fill', path_pos < paths[index][END_POS] ? 'none' : paths[index][FILL])
      }
      // Reset the index and position. The first tick() will correct things
      index = 0
      path = paths[index]
      end_path_pos = path[WIDTH]
      start_time = Date.now()
      tick()
    })
    .each(function() {
      var $this = $(this),
          width = parseFloat($this.data('duration') || '1'),
          path_length = this.getTotalLength()
      default_duration += width
      if (!options.absolute)
        width *= path_length
      total_width += width
      // index:   PATH   WIDTH  END_POS      PATH_LENGTH  FILL
      paths.push([$this, width, total_width, path_length, $this.css('fill') || null])
      $this.attr({
        'stroke-dasharray': path_length + ' ' + path_length,
        'stroke-dashoffset': path_length
      })
      if (options.fill)
        $this.css('fill', 'none')
    })
  for (index=0, length=paths.length; index < length; index++) {
    paths[index][WIDTH] /= total_width
    paths[index][END_POS] /= total_width
  }

  // Duration is specified in options
  // or is the sum of the data-doodle durations
  // or defaults to a pre-defined number of seconds
  duration = (options.duration || default_duration || 2) * 1000

  function draw() {
    pos = start_pos + (Date.now() - start_time) / duration
    path_pos = easing(pos)
    // Find the current path that is being animated
    if (index >= length || path_pos >= paths[index][END_POS]) {
      while ((index < length) && (path_pos >= paths[index][END_POS])) {
        paths[index][PATH].attr('stroke-dashoffset', 0)
        if (options.fill)
          paths[index][PATH].css('fill', paths[index][FILL])
        index++
      }
      if (index >= length) {
        if (typeof options.loop != 'undefined')
          timeout_id = setTimeout(function() {
            self.last().trigger('stop').trigger('start', [0])
          }, options.loop * 1000)
        self.last().trigger('end.g.doodle')
        return false
      }
      path = paths[index]
      end_path_pos = path[WIDTH] + paths[index - 1][END_POS]
    }

    // Set its stroke offset
    path[PATH].attr('stroke-dashoffset', path[PATH_LENGTH] * (end_path_pos - path_pos) / path[WIDTH])
    return true
  }

  function tick() {
    if (draw())
      request_id = requestAnimationFrame(tick)
  }
  if (typeof options.start === 'undefined' || options.start)
    self.last().trigger('start.g.doodle', [0])

  return self
}

export {doodle}