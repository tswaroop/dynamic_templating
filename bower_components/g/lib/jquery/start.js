// jQuery plugins are added to this folder
// Include them only if jQuery exists

// Return all values that match the selector
// AMONG and UNDER the node
var findall = function (node, selector) {
      return node.filter(selector).add(node.find(selector))
  };

  // Return all values that DO NOT match the selector
  // AMONG and UNDER the node. Complement of findall
var notall = function (node, selector) {
      return node.not(selector).add(node.not(selector))
  };

  // Return the {width:..., height:...} of the node
var getSize = function(node) {
    // Ideally, this is just one line:
    //    return node.getBoundingClientRect()

    // But see http://stackoverflow.com/q/18153989/100904
    // and https://bugzilla.mozilla.org/show_bug.cgi?id=530985
    // If the contents exceed the bounds of an element,
    // getBoundingClientRect() failes in Firefox.

    // So set display:block, get $().width(), and unset display:block

    var $node = $(node),
        old_display = $node.css('display'),
        result = {}
    if (old_display != 'block')
      $node.css('display', 'block')
    result.width = $node.width()
    result.height = $node.height()
    if (old_display != 'block')
      $node.css('display', old_display)
    return result
  };

export {findall, notall, getSize}
