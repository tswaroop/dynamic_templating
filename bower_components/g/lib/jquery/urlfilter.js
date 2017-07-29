import {parse} from './../url.js'
var _url_parse_qname  = ['searchKey', 'searchList']
let urlfilter = function(options) {
  options = options || {}
  var self = this,
      attr = options.attr || 'href',
      selector = options.selector || ('[' + attr + ']'),
      remove = 'remove' in options ? options.remove : true,
      doc = self[0].ownerDocument,
      loc = (doc.defaultView || doc.parentWindow).location,
      hist = (doc.defaultView || doc.parentWindow).history,
      default_toggle = options.toggle,
      default_target = options.target

  if (options.off)
    return self.off('click.urlfilter')

  return self.on('click.urlfilter', selector, function(e) {
    e.preventDefault()

    /*
    If the target is...       the URL is get/set at
    ------------------------  ---------------------
    unspecified (=> window)   location.href
    'pushState'               location.href
    '#'                       location.hash
    anything else             $(target).data('src')
    */

    var $this = $(this),
        toggle = $this.data('toggle') || default_toggle,
        target = $this.data('target') || default_target,
        href = $this.attr(attr),
        q = parse(href)[_url_parse_qname[0]],
        trigger = {type: 'loaded.g.urlfilter', q: q},
        url, key

    if (remove)
      for (key in q)
        if (q[key] === '')
          q[key] = null

    function target_url(url) {
      return parse(url)
                .join(href, {query: false, hash: false})
                .update(q, toggle)
    }

    if (!target) {
      loc.href = target_url(loc.href)
      $this.trigger(trigger)
    }
    else if (target == '#') {
      // location.hash may not be always available, so split from location.href
      loc.hash = target_url(loc.href.split('#')[1] || '')
      $this.trigger(trigger)
    }
    else if (target.match(/^pushstate$/i)) {
      hist.pushState({}, '', target_url(loc.href))
      $this.trigger(trigger)
    }
    else {
      $(target).each(function() {
        var $target = $(this)
        url = target_url($target.data('src'))
        $target.data('src', url).load(url.toString(), function() {
          $target.trigger(trigger)
        })
      })
    }
  })
}

export {urlfilter}