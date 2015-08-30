// Books.remove({})

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]); // padding
};


importCSV = function(file) {
  console.log("enter function import_file_orders")
  var lines = file.split(/\r\n|\n/);
  var l = lines.length - 1;
  for (var i=0; i < l; i++) {
    var line = lines[i];
    var line_parts = line.split(';');
    
    var isbn = line_parts[0];
    var title = line_parts[1];
    var author = line_parts[2];
    var rating = line_parts[3];
    var heavyness = line_parts[4];
    var date = line_parts[5];
    var format = line_parts[6];
    var tags = line_parts[7]
    var review = line_parts[8];
    var notes = line_parts[9];
    d = new Date();
    var dateAdded = d.yyyymmdd();
    
    if(title.substring(0,1) == '-'){
      console.log("in update if " + currentBookId);
      currentBook.children.push({
              "title": title,
              "author": author,
              "img": "",
              "review": review,
              "notes": notes,
              "rating": rating,
              "date": date,
              "tags": tags,
              "format": format
            });     
    }else{
      if(i>0){
        var result = Books.insert(currentBook);
      }
      var currentBook = {
        "isbn": isbn,
        "title": title,
        "author": author,
        "img": "",
        "review": review,
        "notes": notes,
        "rating": rating,
        "date": date,
        "tags": tags,
        "format": format,
        "meta": {
          "userId": Meteor.userId(),
          "dateAdded": dateAdded
        },
        "children": []
      };   
      var currentBookId = result;
    }
    console.log(result + " — Imported " + title);
  };
  Books.insert(currentBook);
}

Meteor.methods({
    upload : function(fileContent) {
        console.log("start insert");
        importCSV(fileContent);
        console.log("completed");
    }
});