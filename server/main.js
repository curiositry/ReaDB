// Books.remove({})

function fetchFromAPI(url) {
  console.log("fetchFromAPI function called");
  console.log(url);
  // synchronous GET
  try {
    var result = Meteor.http.get(url, {timeout:30000});
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

function fetchBookMetadata(isbn, title, author){
  console.log("fetchBookMetadata function called");
  var url;
  if(isbn){
    url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+isbn;
  }if (title && author) {
    url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title+"+inauthor:"+author;
  }else {
    url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title;
  }
  var result = fetchFromAPI(url);
  return result;
}

function toJSONString(data){
  var str = JSON.stringify(data);
  return str.substring(0, str.length - 0);
}

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ';'
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

function processCSV (){  
  console.log("process function called");
  var data = Books.find(
      {"meta.userId": Meteor.userId()},
      {fields: {_id:0,bookid:0}}
    ).fetch();
  var JSON = toJSONString(data);
  var CSV = convertToCSV(JSON);
  return CSV;
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
        "rating": rating,
        "dateRead": date,
        "format": format,
        "tags": tags,      
        "review": review,
        "notes": notes,
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
      console.log("e");
      this.unblock();
      return fetchBookMetadata(isbn, title, author);
    },
    processCSV: function(){
      console.log("process method called");
      return processCSV();
    },
    updateLibraryMetadata: function(){
      // this.unblock();
      console.log("update lib meta called");
      var library = Books.find({}).fetch(); 
      for(var i = 0; i < library.length; i++){
        console.log("in for loop");
        var book = library[i];
        console.log(book.title);
        console.log(book.meta);
        if (!book.meta.pubdate){   
          this.unblock();    
          var result = fetchBookMetadata(book.isbn, book.title, book.author);
          if(JSON.parse(result.content).totalItems > 0){
            var metadata = JSON.parse(result.content).items[0];
            var isbn = book.isbn;   
            console.log(book.title);
            d = new Date();
            var dateModified = d.yyyymmdd();
              

            if(!book.isbn){
              if (metadata.volumeInfo.industryIdentifiers[1]){
                isbn = metadata.volumeInfo.industryIdentifiers[1].identifier;
              }else {
                isbn = metadata.volumeInfo.industryIdentifiers[0].identifier;
              }
            }
               
            Books.update({_id: book._id},{$set: {             
              "isbn": isbn, 
              "title": book.title,
              "author": book.author,        
              "meta": {
                "userId": Meteor.userId(),
                "dateAdded": book.meta.dateAdded,
                "dateModified": dateModified,
                "imgUrl":  metadata.volumeInfo.imageLinks.thumbnail,
                "pubdate": metadata.volumeInfo.publishedDate,
                "publisherDescription": metadata.volumeInfo.description,
                "pageCount": metadata.volumeInfo.pageCount,
                "publisherTitle": metadata.volumeInfo.title,
                "publisherAuthors": metadata.volumeInfo.author,
              }
            }}); 
          }
             
        }
      }
    }
});