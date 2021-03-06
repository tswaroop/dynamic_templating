/*
  url.parse() provides results consistent with window.location.

  0 href                Full URL source
  1 protocol            http, https, etc
  2 origin              username:password@hostname:port
  6 hostname            hostname
  7 port                port
  9 pathname            full path, excluding hash
 12 search              search parameters
 13 hash                url fragment

  The following are not part of window.location, but provided anyway.

  3 userInfo            username:password
  4 username            username
  5 password            password
  8 relative:           Everything after origin
 10 directory:          Directory part of pathname
 11 file:               File part of pathname
  - searchKey           search as an ordered dict of strings
  - searchList          search as an ordered dict of arrays
 */

var
_url_parse_key    = ['href','protocol','origin','userInfo','username','password','hostname','port','relative','pathname','directory','file','search','hash'],
_url_parse_qname  = ['searchKey', 'searchList'],
_url_parse_strict = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
_url_parse_search = /(?:^|&)([^&=]*)=?([^&]*)/g,
_url_parse,
_url_unparse,
_url_join,
_url_update

var _decode_uri_component = function(s) { return decodeURIComponent(s.replace(/\+/g, '%20')) },
    _encode_uri_component = encodeURIComponent

_url_parse = function(str) {
  /* Based on parseUri 1.2.2: http://blog.stevenlevithan.com/archives/parseuri
     MIT License
  */
  var uri = {
        toString: _url_unparse,
        join: _url_join,
        update: _url_update
      },
      m   = _url_parse_strict.exec(str || ''),
      i   = 14

  while (i--) uri[_url_parse_key[i]] = m[i] || ''

  var search_key = uri[_url_parse_qname[0]] = {},
      search_list = uri[_url_parse_qname[1]] = {}
  uri[_url_parse_key[12]].replace(_url_parse_search, function ($0, key, val) {
    if (key) {
      key = _decode_uri_component(key)
      val = _decode_uri_component(val)
      search_key[key] = val
      search_list[key] = search_list[key] || []
      search_list[key].push(val)
    }
  })

  return uri
}


// Converts the URL parts back into the original URL.
_url_unparse = function(self) {
  self = self || this
  var protocol    = self[_url_parse_key[1]] || 'http',
      username    = self[_url_parse_key[4]],
      password    = self[_url_parse_key[5]],
      hostname    = self[_url_parse_key[6]],
      port        = self[_url_parse_key[7]],
      pathname    = self[_url_parse_key[9]],
      search      = self[_url_parse_key[12]],
      hash        = self[_url_parse_key[13]],
      search_key  = self[_url_parse_qname[0]],
      search_list = self[_url_parse_qname[1]],
      parts = hostname ? [protocol, '://'] : [],
      qparts = [],
      key, vals, i, l
  if (username) {
    parts.push(username)
    if (password) parts.push(':', password)
    parts.push('@')
  }
  parts.push(hostname)
  if (port) parts.push(':', port)
  parts.push(pathname || (hostname ? '/' : ''))
  if (search) {
    parts.push('?', search)
  } else {
    if (search_list) {
      for (key in search_list) {
        for (i=0, vals=search_list[key], l=vals.length; i<l; i++) {
          qparts.push(_encode_uri_component(key) + '=' + _encode_uri_component(vals[i]))
        }
        if (!l) qparts.push(key)
      }
    } else if (search_key) {
      for (key in search_key) {
        qparts.push(_encode_uri_component(key) + '=' + _encode_uri_component(search_key[key]))
      }
    }
    if (qparts.length) parts.push('?', qparts.join('&'))
  }
  if (hash) parts.push('#', hash)

  return parts.join('')
}


_url_join = function(urlstr, options) {
  options = options || {}
  var self = this,
      sources = self[_url_parse_key[9]].split('/'), // self.pathname.split
      ptr     = sources.length - 1,                 // Points to last element
      url     = _url_parse(urlstr),
      targets = url.pathname.split('/'),
      l       = targets.length,
      i,
      frag

  if (typeof options.query == 'undefined')
      options.query = true
  if (typeof options.hash == 'undefined')
      options.hash = true

  for (i=0; i<14; i++) {
    if (i == 9) continue                      // Ignore path
    if (i == 12 && !options.query) continue   // Ignore search parameters
    if (i == 13 && !options.hash) continue    // Ignore url fragment
    if (url[_url_parse_key[i]]) self[_url_parse_key[i]] = url[_url_parse_key[i]]
  }
  if (options.query && url[_url_parse_key[12]]) {  // Copy search parameters
    self[_url_parse_qname[0]] = url[_url_parse_qname[0]]
    self[_url_parse_qname[1]] = url[_url_parse_qname[1]]
  }
  for (i=0; i < l; i++) {
    frag = targets[i]
    if (frag == '.') {
      sources[ptr] = ''
    } else if (frag == '..') {
      sources[--ptr] = ''
    } else if (frag === '') {
      // Ignore blank urlstr
      if (l > 1) {
        // Leading slash clears the URL
        if (!i) {
          sources[0] = frag
          ptr = 1
        }
        // Trailing slash is appended
        if (i == l - 1) sources[ptr] = frag
      }
    } else {
      sources[ptr] = frag
      if (i < l - 1) ptr++
    }
  }

  // Set .pathname, .directory, .file.
  var path = self[_url_parse_key[9]] = sources.slice(0, ptr + 1).join('/'),
      parts = path.split(/\//),
      relative = [path]
  if (self[_url_parse_key[12]]) relative.push('?', self[_url_parse_key[12]])
  if (self[_url_parse_key[13]]) relative.push('#', self[_url_parse_key[13]])
  self[_url_parse_key[8]] = relative.join('')   // relative
  self[_url_parse_key[10]] = parts.slice(0, parts.length - 1).join('/') + '/'   // directory
  self[_url_parse_key[11]] = parts[parts.length - 1]  // file

  return self
}


_url_update = function(args, mode) {
  var self = this,
      search_key = self[_url_parse_qname[0]],
      search_list = self[_url_parse_qname[1]],
      qparts = [],
      modes = {},
      key, val, i, l, hash, search_list_key, result

  if (mode) {
    // Ensure that mode is a string
    mode = '' + mode
    // If the mode is like a=add&b=toggle, treat it like URL search params and
    // convert it into a dictionary
    if (mode.match(/[&=]/))
      modes = _url_parse('?' + mode).searchKey
    // If the mode is just a string like add, del, toggle, apply it to all keys
    else
      for (key in args)
        modes[key] = mode
  }

  for (key in args) {
    val = args[key]
    if (val === null) {
      search_list[key] = []
    } else {
      if (!Array.isArray(val)) val = [val]
      if (!modes[key])
        search_list[key] = val
      else {
        // Ensure that search_list[key] exists
        if (!(key in search_list)) search_list[key] = []

        // Prepare a hash for lookup
        for (hash={}, i=0, l=val.length; i<l; i++)
          hash[val[i].toString()] = 1

        // Ensure that mode is a string
        mode = '' + modes[key]

        if (mode.match(/add/i))
          search_list[key] = search_list[key].concat(val)

        // mode=del deletes all matching values
        else if (mode.match(/del/i)) {
          for (result=[], search_list_key=search_list[key], i=0, l=search_list_key.length; i<l; i++) {
            if (!hash[search_list_key[i]])
              result.push(search_list_key[i])
          }
          search_list[key] = result
        }

        // mode=toggle deletes matching values, adds the rest
        else if (mode.match(/toggle/i)) {
          for (result=[], search_list_key=search_list[key], i=0, l=search_list_key.length; i<l; i++) {
            if (hash[search_list_key[i]])
              hash[search_list_key[i]] = 2 // Mark it as present
            else
              result.push(search_list_key[i])
          }
          // Append the unmarked values
          for (val in hash)
            if (hash[val] == 1)
              result.push(val)
          search_list[key] = result
        }
      }
    }
    if (search_list[key].length === 0) {
      delete search_key[key]
      delete search_list[key]
    } else {
      search_key[key] = search_list[key][search_list[key].length - 1]
    }
  }
  for (key in search_list) {
    val = search_list[key]
    for (i=0, l=val.length; i<l; i++) {
        qparts.push(_encode_uri_component(key) + '=' + _encode_uri_component(val[i]))
    }
  }
  self.search = qparts.join('&')
  return self
}

export {
  _url_parse as parse,
  _url_unparse as unparse,
  _url_join as join,
  _url_update as update
}
