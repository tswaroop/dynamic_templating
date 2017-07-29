/*
Usage: $(selector).template(data)

Renders the template in-place using data.
Requires underscore.js
*/

var _template_fn = 'G.template.fn',
    _template_node = 'G.template.node'

let template = function(data) {
  var $result
  // Pre-create the template rendering function
  this.each(function() {
    var $this = $(this),
        template
    if (!$this.data(_template_fn)) {
      template = _.template($this.html())
      $this.data(_template_fn, function(data) {
        var $target = $this.data(_template_node)
        if ($target)
          $target.remove()
        $target = $($.parseHTML(template(data))).insertAfter($this)
        $this.data(_template_node, $target)
        return $target
      })
    }
  })

  if (!data)
    $result = this.map(function() { return $(this).data(_template_fn) })
  else {
    $result = $()
    this.each(function() {
      $result = $result.add($(this).data(_template_fn)(data))
    })
  }
  return $result
};
export {template}