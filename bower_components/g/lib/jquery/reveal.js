let reveal = function(options) {
  options = options || {}
  var self = this,
      attr = options.attr || 'data-reveal',
      selector = options.selector || '[' + attr + ']',
      done = {}

  if (options.off)
    return self.off('.g.reveal')

  $(selector).each(function() {
    // Set the initial reveal position based on the data-start attribute
    var $source = $(this),
        target = $source.data('target') || options.target || selector,
        start,
        $target,
        type,
        hideClass,
        hidden
    if (!done[target]) {
      start = +($source.data('start') || options.start || 0)
      hideClass = $source.data('hide-class') || options.hideClass || 'fade'
      type = $source.data('type') || options.type || 'overlay'
      hidden = '.' + hideClass
      $target = $(target)

      if (type == 'overlay') {
        // Show up to start, hide the rest
        $target.eq(start).filter(hidden).removeClass(hideClass)
        $target.slice(start + 1).not(hidden).addClass(hideClass)
      } else if (type == 'single') {
        // Show only the start, hide the rest
        $target.eq(start).filter(hidden).removeClass(hideClass)
        $target.not($target.eq(start)).not(hidden).addClass(hideClass)
      }
      done[target] = 1
    }
  })

  return self.on('click.g.reveal', selector, function() {
    var $source = $(this),
        $target = $($source.data('target') || options.target || selector),
        hideClass = $source.data('hide-class') || options.hideClass || 'fade',
        type = $source.data('type') || options.type || 'overlay',
        loop = $source.data('loop') || options.loop,
        hidden = '.' + hideClass,
        reveal = $source.attr(attr),
        $hidden, $shown, $current, slide, nslides

    if (type == 'overlay') {                                // Overlay mode
      if (reveal.match(/next/i)) {                          // Next: show first hidden item
        $hidden = $target.filter(hidden)
        if (!$hidden.length) {
          if (loop) {
            $target.slice(1).addClass(hideClass)
            $current = $target.eq(0)
          } else {
            $current = $target.last()
          }
        } else {
          $current = $hidden.first().removeClass(hideClass)
        }
        slide = $target.index($current)
      } else if (reveal.match(/prev/i)) {                   // Prev: hide last shown item
        $shown = $target.not(hidden)
        if ($shown.length <= 1) {
          if (loop) {
            $target.removeClass(hideClass)
            $current = $target.last()
          }
        } else {
          $shown.last().addClass(hideClass)
          $current = $shown.eq(-2)
        }
        slide = $target.index($current)
      } else {                                              // n: show up to nth slide
        slide = +reveal
        if (slide < 0) slide = $target.length + slide
        $target.slice(0, slide + 1).filter(hidden).removeClass(hideClass)
        $target.slice(slide + 1).not(hidden).addClass(hideClass)
      }
    }
    else if (type == 'single') {                            // Single slide mode
      nslides =  $target.length
      $shown = $target.not(hidden)
      if (reveal.match(/next/i)) {                          // Next: show slide after last visible
        if ($shown.length) {
          slide = $target.index($shown.last()) + 1
          if (slide >= nslides)
            slide = loop ? 0 : nslides - 1
        }
        else
          slide = 0                                         //       or the first slide
      }
      else if (reveal.match(/prev/i)) {                     // Prev: show slide before last visible
        if ($shown.length) {
          slide = $target.index($shown.last()) - 1
          if (slide < 0)
            slide = loop ? nslides - 1 : 0
        }
        else
          slide = nslides - 1                               //       or the last slide
      }
      else
        slide = +reveal                                     // n: show nth slide

      $current = $target.eq(slide)
      $current.filter(hidden).removeClass(hideClass)
      $target.not($current).not(hidden).addClass(hideClass)
    }

    $source.trigger({
      type: 'shown.g.reveal',
      slide: slide
    })
  })
}
export {reveal}