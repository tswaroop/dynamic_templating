var _G_search_transform = function(s) {
      return (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/^ /, '').replace(/ $/, '')
    },
    _G_search_change = function(s) {
      return s.replace(/\s+/g, '.*')
    },
    // data- attribute to store the last performed search
    _G_search_last = 'search-last',
    // data- attribute to store granular search results
    _G_search_results = 'search-results'

let search = function(options) {
  options = options || {}
  var self = this,
      attr = options.attr || 'data-search',
      selector = options.selector || '[' + attr + ']',
      transform = options.transform || _G_search_transform,
      changeSearch = options.changeSearch || _G_search_change,
      showClass = options.showClass || '',
      hideClass = options.hideClass || '',
      refresh, run_search

  if (options.off)
    return self.off('.g.search')

  refresh = function(e) {
    var $el = $(e.target),
        list = [],
        textattr = options.text || $el.attr(attr),
        targets = $(
          $el.data('target') ||
          options.target ||
          (typeof textattr == 'string' ? '[' + textattr + ']' : '*')
        )

    targets.each(
      typeof textattr == 'function' ? function() { var x = textattr(this);              list.push({el: $(this), original: x, text: transform(x), hide: false}) } :
             textattr == '@text'    ? function() { var x = this.textContent;            list.push({el: $(this), original: x, text: transform(x), hide: false}) } :
                                      function() { var x = this.getAttribute(textattr); list.push({el: $(this), original: x, text: transform(x), hide: false}) }
    )
    $el.data(_G_search_results, list)
       .removeData(_G_search_last)
    return list
  }

  run_search = function(e) {
    var $el = $(e.target),
        original_search = $el.val(),
        search = changeSearch(transform(original_search)),
        lastsearch_value = $el.data(_G_search_last)

    if (lastsearch_value == search) return
    $el.data(_G_search_last, search)

    var re = new RegExp(search),
        showcls = $el.data('show-class') || showClass,
        hidecls = $el.data('hide-class') || hideClass || (showcls ? '' : 'fade'),
        i, cell, count,
        results = $el.data(_G_search_results)

    if (!results) results = refresh(e)

    count = results.length
    if (!search.length) {
      for (i=0; cell=results[i]; i++) {
        if (cell.hide) { if (hidecls) cell.el.removeClass(hidecls) }
        else           { if (showcls) cell.el.removeClass(showcls) }
        cell.hide = false
      }
    }
    else {
      for (i=0; cell=results[i]; i++) {
        var hide = !cell.text.match(re)
        if (hide !== cell.hide || !lastsearch_value) {
          if (hidecls) cell.el[ hide ? 'addClass' : 'removeClass'](hidecls)
          if (showcls) cell.el[!hide ? 'addClass' : 'removeClass'](showcls)
          cell.hide = hide
        }
        if (hide) count--
      }
    }

    $el.trigger({
      type: 'shown.g.search',
      searchText: original_search,
      search: search,
      matches: count,
      results: results
    })
  }

  return self
    .on('keyup.g.search', selector, run_search)
    .on('change.g.search', selector, run_search)
    .on('refresh.g.search', refresh)
    .on('search.g.search', function(e) {
      refresh(e)
      run_search(e)
    })
}
export {search}