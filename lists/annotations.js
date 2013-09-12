function(head, req) {
  var row, prependComma = false
  
  send('[')
  
  while(row = getRow()) {
    if (prependComma) send(',')
    
    prependComma = true

    var newrow = {}

    var rowdata = row.value
    for (var key in rowdata) {
      if (rowdata.hasOwnProperty(key) && (key.charAt(0) !== '_' || ['_id','_rev'].indexOf(key) > -1)) {
        newrow[key] = rowdata[key]
      }
    }
    send(JSON.stringify(newrow));
  }
  
  send(']\n')
}
