// Return all CSS rules matching a selector.
// e.g. G.style(/^\.item$/i) returns last rule matching '.item'
// e.g. G.style('.item') returns last rule exactly matching '.item'

let style = function(selector) {
    var sty = styles(selector)
    return sty[sty.length - 1]
}

// e.g. G.styles(/^\.item$/i) returns all rules matching '.item'
// e.g. G.styles('.item') returns all rules exactly matching '.item'
let styles = function(selector) {
    var stylesheets = document.styleSheets,
        matches = [],
        string_selector = typeof selector == 'string'
    for (var i=0, stylesheet; stylesheet=stylesheets[i]; i++)
        for (var j=0, rule; rule=stylesheet.cssRules[j]; j++) {
            var text = rule.selectorText
            if (text && (string_selector ? text == selector : text.match(selector)))
                matches.push(rule)
        }
    return matches
}

export {style, styles}
