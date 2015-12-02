
fetchBooks = function(search, sort, fields) {
  Meteor.call("fetchBooks", search, sort, fields, function(err,res){
    if (err){    
      throw err;
    } else if (res) {
      Session.set("books",JSON.parse(JSON.stringify(res)));  
      return JSON.parse(JSON.stringify(res));
    } else {
      return false;
    }
  });
}

fetchUsername = function(userId){
  Meteor.call("fetchUsername", userId, function(err, res){
    if (err) {
      console.log(err);  
      Session.set("fetchedUsername", err);
      throw err;
    } else if (res) {
      Session.set("fetchedUsername", res);
      return res;
    } else {
      Session.set("fetchedUsername", "not found");
      return false;    
    }
  });
  return Session.get("fetchedUsername");
}

getUserStatistics = function(userId, query){
  Meteor.call("getUserStatistics", userId, query, function(err,res){
    if (err) {
      throw err;
    } else if (res) {
      Session.set("userStats", res);
      return res;
    } else {
      Bert.alert({
          title: 'Method call failed…',
          message: 'Failed to call Meteor method!',
          type: 'error',
        });
      return false;
    }
  })
}

processMethodResponse = function(err,res){
  if (err) {
    throw err;
  } else if (res) {
    return res;
  } else {
    Bert.alert({
        title: 'Method call failed…',
        message: 'Failed to call Meteor method!',
        type: 'error',
      });
    return false;
  }
}

PMR = function(err, res){
  return processMethodResponse(err, res);
}

importCSV = function(file){
  var lines = file.split(/\r\n|\n/);
}

toJSONString = function(data){
  var str = JSON.stringify(data);
  return str.substring(0, str.length - 0);
}

convertToCSV = function(objArray) {
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

readFile = function(f,onLoadCallback) {
  //When the file is loaded the callback is called with the contents as a string
  var reader = new FileReader();
  reader.onload = function (e){
    var contents=e.target.result
    onLoadCallback(contents);
  }
  reader.readAsText(f);
};

// function downloadFile(data, format, charset){
//   if (typeof(charset)==='undefined') charset = "utf-8";
//   window.open("data:text/"+format+";charset="+charset+"," + escape(data));
// }

applyBookMetadata = function(){
  
}

processBookMetadata = function(bookId) {
    var tempData = Temp.findOne({"bookId":bookId});
    // console.log(tempData.metadataResponse);
    var metadataResponse = tempData.metadataResponse;
    var book = tempData.book;
    if(Session.get("metadataResponseIndex")){
      var metadataIndex = Session.get("metadataResponseIndex");
    } else {
      var metadataIndex = 0;
    }
    var metadata = JSON.parse(metadataResponse).items[metadataIndex];
    console.log(metadata);  
    var isbn = book.isbn;   
    console.log(book.title);
    d = new Date();
    var dateModified = d.yyyymmdd();
    var dateReadSortable = new Date(book.dateRead).getTime() / 1000;      
    if(!book.isbn){
      if (metadata.volumeInfo.industryIdentifiers[1]){
        isbn = metadata.volumeInfo.industryIdentifiers[1].identifier;
      }else {
        isbn = metadata.volumeInfo.industryIdentifiers[0].identifier;
      }
    }
    var updatedFields =  {             
      "isbn": isbn, 
      "title": book.title,
      "author": book.author,     
      "meta": {
        "userId": Meteor.userId(),
        "dateAdded": book.meta.dateAdded,
        "dateModified": dateModified,
        "dateReadSort": dateReadSortable
      },
      "publisherMetadata": {
        "pubdate": metadata.volumeInfo.publishedDate,
        "publisherDescription": metadata.volumeInfo.description,
        "pageCount": metadata.volumeInfo.pageCount,
        "publisherTitle": metadata.volumeInfo.title,
        "publisherAuthors": metadata.volumeInfo.author,
      }
    };
    if (metadata.volumeInfo.hasOwnProperty("imageLinks")){
      updatedFields.publisherMetadata["imgUrl"] = metadata.volumeInfo.imageLinks.thumbnail;
    }
    console.log(updatedFields);
    Meteor.call("deleteTempItem", tempData._id);
    Meteor.call("updateBookMetadata", bookId, updatedFields, function(err, res){
      if(res){
        Bert.alert({
            title: book.title+' Metadata Updated!',
            message: 'Found metadata for '+ book.title +' using Google Books API',
            type: 'success',
          });
        return true;
      } if (err) {
        throw err;
      }
    });
}

updateBookMetadata = function(bookId) {
  Meteor.call("fetchBook", bookId, function(err,res){
    if (err) {
      throw err;
    } else if (res) {
      var book = res;
      var isbn =  book.isbn;
      var title = book.title;
      var author = book.author;
      Meteor.call("fetchBookMetadata", isbn, title, author, function(err,res){
        if(res){
          
          if(JSON.parse(res.content).totalItems > 0){
            var tempObject = {
              "userId": Meteor.userId(),
              "bookId": book._id,
              "book": book,
              "metadataResponse": res.content
            }
            var existingBookTempItem = Temp.findOne({"bookId":book._id});
            if (existingBookTempItem){
              Meteor.call("updateTempItem", existingBookTempItem._id, tempObject);
            } else {
              Meteor.call("insertTempItem", tempObject);
            }
            processBookMetadata(bookId);
          } else if (JSON.parse(res.content).stack) {
            console.log(JSON.parse(res.content).stack);
            Bert.alert({
              title: 'That’s all we can do for now',
              message: 'We’ve fetched metadata for as many books as the Google Books API allows. Wait an hour or so and then we can update the rest.',
              type: 'warning',
            });
            return false;
          } else {
            return false;
          }
        } if (err){
          throw error;
        } else {
          return false;
        }
      });
    }
  });
  
}

updateLibraryMetadata = function(){
  console.log("update lib meta called");
  fetchBooks();
  var library = Session.get("books");
  var totalBooksProcessed = 0;
  var totalBooksUpdated = 0;    
  for(var i = 0; i < library.length; i++){
    console.log("in for loop");
    totalBooksProcessed++;
    Session.set("updateStatus", "<i class='fa fa-spinner'></i> processing book "+totalBooksProcessed+" of "+library.length);   
    var book = library[i];
    if (!book.hasOwnProperty("publisherMetadata") || !book.publisherMetadata.hasOwnProperty("pubdate") ){
      console.log(book.title);
      console.log(book.meta);
      totalBooksUpdated = totalBooksUpdated + 1;
      // updateUserSession(toString(totalBooksUpdated));
      updateBookMetadata(book._id);
    } else {
      Bert.alert({
        title: book.title+' already has metadata'
      });
    }
  } // end for loop
}, // end function

deleteBook = function(bookId) {
  Meteor.call("deleteBook", bookId, function(err,res){
    if (err) throw err;
    if (res) return res;
    else {
      Bert.alert({
          title: 'Oops!',
          message: 'That book doesn’t seem to belong to you…',
          type: 'danger',
        });
    }
  });
}


trim11 = function(str) {
  str = str.replace(/^\s+/, '');
  for (var i = str.length - 1; i >= 0; i--) {
    if (/\S/.test(str.charAt(i))) {
      str = str.substring(0, i + 1);
      break;
    }
  }
  return str;
}

tagsToArray = function(tags){
  var tagArray = [];
  tagArray = tags.split(',');
  for(var i = 0; i < tagArray.length; i++){
    tagArray[i] = trim11(tagArray[i]);
  }
  return tagArray;
}
