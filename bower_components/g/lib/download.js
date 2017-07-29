/*
  Downloads and saves binary content as a local file.

      G.download({
        file: 'test.csv',
        mime: 'text/csv; charset=utf-8',
        source: 'a,b,c\r\n1,2,3\r\n4,5,6'
      })

  For compatibility with the HTML5 W3C FileSaver API, instead of this,
  use https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

  SVG download mimics [SVG crowbar](https://github.com/NYTimes/svg-crowbar)
  but does not rely on D3

  See [Drawing DOM objects into a canvas](https://developer.mozilla.org/en/docs/HTML/Canvas/Drawing_DOM_objects_into_a_canvas)
  to understand how PNG download works.
 */
import {csv} from './csv.js'
function getStyle(sheet, output) {
  var i = -1, rule, nrules
  if (!sheet.cssRules) return
  nrules = sheet.cssRules.length
  while (++i < nrules) {
    rule = sheet.cssRules[i]
    // Import statement
    if (rule.type == 3)
      getStyle(rule.styleSheet, output)
    // Descendent selectors crash Adobe Illustrator
    else if (rule.selectorText && rule.selectorText.indexOf('>') == -1)
      output.push(rule.cssText);
  }
}

function download_blob(blob, options) {
  var nav = navigator,
      url, $a

  // IE >= 10 natively support downloading a blob
  if (nav.msSaveOrOpenBlob && nav.msSaveOrOpenBlob.bind(nav))
    return nav.msSaveOrOpenBlob(blob, options.file)

  url =  URL.createObjectURL(blob)

  $a = $('<a></a>')
      .attr('download', options.file)
      .attr('href', url)
      .css('display', 'none')
      .appendTo('body')
      .dispatch('click')

  setTimeout(function() {
    $a.remove()
    URL.revokeObjectURL(url)
  }, 10)
}

// Ensure that the SVG element has xmlns specified
// This is required to create valid blobs, without with img.onload for png is not triggered
function svgize(node) {
  var _xmlns = 'http://www.w3.org/2000/xmlns/'
  if (!node.hasAttributeNS(_xmlns, 'xmlns'))
    node.setAttributeNS(_xmlns, 'xmlns', 'http://www.w3.org/2000/svg')

  if (!node.hasAttributeNS(_xmlns, 'xmlns:xlink'))
    node.setAttributeNS(_xmlns, 'xmlns:xlink', 'http://www.w3.org/1999/xlink')

  return node
}

// XML 1.0 only allows certain characters. Ignore the rest
// http://stackoverflow.com/a/28152666/100904
function xml_escape(s) {
  return s.replace(/[^\x09\x0a\x0d\u0020-\ud7ff\ue000-\ufffd\u10000-\u10ffff]/g, '')
}

let download = function(options) {
  var mime = options.mime,
      source = options.source,
      i = -1,
      sheets, nsheets, style,
      img, blob, node, url, bounds, canvas, ctx, old_width

  if (options.svg) {
    mime = mime || 'application/svg;charset=utf-8'
    node = svgize($(options.svg).get(0))

    if (!source) {
      source = xml_escape((new XMLSerializer()).serializeToString(node))

      if (!options.nostyle) {
        sheets = document.styleSheets || []
        style = []
        nsheets = sheets.length
        i = -1; while (++i < nsheets)
          if (sheets[i]) getStyle(sheets[i], style)
        if (style.length)
          source = source.replace(/>/, '><defs><style><![CDATA[' + style.join('\n') + ']]></style></defs>')
      }

      source = '<?xml version="1.0" standalone="no"?>' + source
    }
    download_blob(new Blob([source], {type : mime}), options)
  }

  else if (options.png) {
    mime = mime || 'image/png'
    node = svgize($(options.png).get(0))

    // Set the attribute in pixels. 100% width doesn't work
    old_width = node.getAttribute('width')
    node.setAttribute('width', node.getBoundingClientRect().width)

    img = new Image()
    source = xml_escape((new XMLSerializer()).serializeToString(node))
    blob = new Blob([source], {type : 'image/svg+xml;charset=utf-8'})
    url = URL.createObjectURL(blob)
    img.onload = function() {
      bounds = node.getBoundingClientRect()
      canvas = $('<canvas></canvas>')
        .attr('width', options.width || bounds.width)
        .attr('height', options.height || bounds.height)
        .appendTo('body')
        .css('display', 'none')
        .get(0)
      ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      // Relies on canvas-to-blob.js polyfill
      canvas.toBlob(function(blob) {
        download_blob(blob, options)
        setTimeout(function() {
          $(canvas).remove()
          URL.revokeObjectURL(url)
        }, 10)
      }, mime)
    }
    img.src = url

    // Restore old width attribute
    if (old_width)
      node.setAttribute('width', old_width)
    else
      node.removeAttribute('width')
  }

  else if (options.csv) {
    mime = mime || 'text/csv;charset-utf-8'
    source = csv(options.csv)
    download_blob(new Blob([source], {type : mime}), options)
  }

  else {
    mime = mime || 'text/html;charset-utf-8'
    download_blob(new Blob([options.source], {type : mime}), options)
  }
}

export {download}
