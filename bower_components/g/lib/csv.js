/*
  Converts an array of (arrays or objects) into CSV text

      G.csv(
        ['A','B','C'],
        [ 1,  2,  3 ],
        [ 4,  5,  6 ])

      G.csv([
        {A:1, B:2, C:3},
        {A:4, B:5, C:6}
      ])
 */

let csv = function(array, dialect) {
  dialect = dialect || {}
  var lineterminator = dialect.lineterminator || '\n',
      delimiter = dialect.delimiter || ',',
      row = 0,
      nrows = array.length,
      col,
      ncols,
      row_data,
      val,
      vals,
      output = [],
      colpos = {},
      colcount = 0,
      quotable = new RegExp('("|' + delimiter + '|\n)', 'g')

  if (!nrows) {
    // Ignore empty arrays
  }
  else if (Array.isArray(array[0])) {
    // Array of arrays
    for (; row < nrows; row++) {
      row_data = array[row]
      ncols = row_data.length
      for (col = 0; col < ncols; col++) {
        val = String(row_data[col]).replace(/"/g, '""')
        if (val.search(quotable) >= 0) val = '"' + val + '"'
        if (col > 0) val = delimiter + val
        output.push(val)
      }
      output.push(lineterminator)
    }
  }
  else {
    // Array of objects
    for (; row < nrows; row++) {
      row_data = array[row]
      vals = []
      for (col in row_data) {
        val = String(row_data[col]).replace(/"/g, '""')
        if (val.search(quotable) >= 0) val = '"' + val + '"'
        if (!(col in colpos)) colpos[col] = colcount++
        vals[colpos[col]] = val
      }
      output.push(vals.join(delimiter))
      output.push(lineterminator)
    }
    vals = []
    for (col in colpos) {
      val = String(col).replace(/"/g, '""')
      if (val.search(quotable) >= 0) val = '"' + val + '"'
      vals.push(val)
    }
    output.unshift(lineterminator)
    output.unshift(vals.join(delimiter))
  }

  return output.join('')
}

export {csv}