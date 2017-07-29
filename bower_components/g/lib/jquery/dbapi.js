(function(global, undefined) {      // eslint-disable-line no-unused-vars

var operators = /^(=|!=|~|!~|>=|<=|>|<)/,
    euc = global.encodeURIComponent,
    // Params that will contain multiple values internally
    composite_params = ['where', 'sort', 'value', 'fields', 'column'],
    // Params that contain a single optional value
    plain_plain = ['limit', 'offset', 'format', 'table', 'download']

function DB(url) {
    var self = this
    self.url = url
    self.clear()
}

DB.prototype.clear = function() {
    var self = this
    self.attrs = {}
    composite_params.forEach(function(column) { self.attrs[column] = {} })
    return this
}

// Sets dict[key] == value || base
// If value is null, deletes the key instead
// Defaults to base only if value is undefined, not just falsey
function set(dict, key, value, base) {
    if (value === null) {
        if (key in dict)
            delete dict[key]
    } else if (typeof base != 'undefined' && typeof value == 'undefined') {
        dict[key] = base
    } else {
        dict[key] = value
    }
}

// Used internally by .where(), .sort() and .value()
// Sets dict based on any of these input structures:
//      (null)
//      (col) -- with a default base value
//      (col, val)
//      ([col, col], val)
//      ({col:val, col: val})
// Re-uses set()
function set_attrs(dict, column, value, base) {
    var col
    // .where(null) clears everything
    if (column === null)
        for (col in dict)
            delete dict[col]

    // .where({col: val}) extends the dictionary
    else if ($.isPlainObject(column))
        for (col in column)
            set(dict, col, column[col], base)

    // .where([col, col], val) sets val for all columns
    else if ($.isArray(column))
        for (var i=0, l=column.length; i<l; i++)
            set(dict, column[i], value, base)

    // .where(col, val) just sets the value
    else set(dict, column, value, base)
}

// Used internally by .where() and .value()
// Sets (column, operator, value) into dict as dict[column] = operator + value
// Re-uses set_attrs()
function set_operator_attrs(dict, column, operator, value) {
    if ($.isPlainObject(column)) {
        for (var key in column) {
            value = column[key]
            if (value !== null)
                if (typeof value != 'string' || !value.match(operators))
                    column[key] = '=' + value
        }
        set_attrs(dict, column)
    }
    else {
        // .where(column, value) or .where([column, column], value)
        if (typeof value == 'undefined') {
            value = operator
            value = typeof value == 'string' && value.match(operators) ? value :
                    value === null ? null :
                    '=' + value
        } else {
            value = operator + value
        }
        set_attrs(dict, column, value)
    }
}

// Call $.ajax for the current state of db, with the specified method.
// If callback is provided, call it on .done()
function ajax(self, method, callback) {
    var params = self.params(),
        options = {type: method, url: self.url, data: params}
    if (method == 'DELETE' && params)
        options.url += '?' + params
    return $.ajax(options).done(callback)
}

$.extend(DB.prototype, {
    'where':    function(column, operator, value) { set_operator_attrs(this.attrs.where, column, operator, value); return this },
    'value':    function(column, value) { set_operator_attrs(this.attrs.value, column, value); return this },
    'column':   function(column, value) { set_operator_attrs(this.attrs.column, column, value); return this },
    'sort':     function(column, value) { set_attrs(this.attrs.sort, column, value, true); return this },
    'fields':   function(column, value) { set_attrs(this.attrs.fields, column, value, true); return this },
    'limit':    function(value) { set_attrs(this.attrs, 'limit', value); return this },
    'offset':   function(value) { set_attrs(this.attrs, 'offset', value); return this },
    'format':   function(value) { set_attrs(this.attrs, 'format', value); return this },
    'table':    function(value) { set_attrs(this.attrs, 'table', value); return this },
    'download': function(value) { set_attrs(this.attrs, 'download', value); return this },
    'get':      function(callback) { return ajax(this, 'GET', callback) },
    'put':      function(callback) { return ajax(this, 'PUT', callback) },
    'post':     function(callback) { return ajax(this, 'POST', callback) },
    'del':      function(callback) { return ajax(this, 'DELETE', callback) }
})

DB.prototype.params = function() {
    var args = [],
        self = this
    composite_params.forEach(function(arg) {
        // Convert {a: '>1', b: '=2'} to 'a>1,b=2'
        var value_is_binary = arg.match(/sort|fields/),
            result = $.map(self.attrs[arg], function(value, column) {
                var term = value_is_binary ? (value ? column : '-' + column): column + value
                if (term.match(/[",]/))
                    term = '"' + term.replace(/"/g, '""') + '"'
                return term
            }).join(',')
        if (result)
            args.push(arg + '=' + euc(result))
    })
    plain_plain.forEach(function(arg) {
        if (arg in self.attrs)
            args.push(arg + '=' + euc(self.attrs[arg]))
    })
    return args.join('&')
}

DB.prototype.toString = function() {
    var params = this.params()
    return params ? this.url + '?' + params : this.url
}

if ('jQuery' in global)
    global.jQuery.db = function(url) { return new DB(url) }
else
    global.db = function(url) { return new DB(url) }
})(this)
