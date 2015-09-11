// Books.remove({})



function fetchFromAPI(url) {
  console.log("fetchFromAPI function called");
  console.log(url);
  // synchronous GET
  try {
    var result = Meteor.http.get(url, {timeout:30000});
    console.log(result);
    return result;
  } catch (e) {
    return e;
  }
  // if(result.statusCode==200) {
  //   var respJson = JSON.parse(result.content);
  //   console.log("response received.");
  //   return respJson;
  // } else {
  //   console.log("Response error: ", result.statusCode);
  //   var errorJson = JSON.parse(result.content);
  //   throw new Meteor.Error(result.statusCode, errorJson.error);
  // }
}


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
              "review": review,
              "notes": notes,
              "rating": rating,
              "dateRead": date,
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
        "review": review,
        "notes": notes,
        "rating": rating,
        "dateRead": date,
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
    },
    fetchBookMetadata: function(isbn, title, author){
      console.log("fetchBookMetadata method called");
      if(isbn){
        var url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+isbn;
      }if (title && author) {
        var url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title+"+inauthor:"+author;
      }else {
        var url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title;
      }
      this.unblock();
      var result = fetchFromAPI(url);
      return result;
    }
});