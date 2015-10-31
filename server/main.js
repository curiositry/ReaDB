Meteor.startup(function() {
    var loginAttemptVerifier = function(parameters) {
      if (parameters.user && parameters.user.emails && (parameters.user.emails.length > 0)) {
        // return true if verified email, false otherwise.
        var found = _.find(
                           parameters.user.emails, 
                           function(thisEmail) { return thisEmail.verified }
                          );

        if (!found) {
          Accounts.sendVerificationEmail(parameters.user._id, parameters.user.emails[0].address);
          throw new Meteor.Error(500, 'We sent you an email.');
        }
        return found && parameters.allowed;
      } else {
        console.log("user has no registered emails.");
        return false;
      }
    }
    Accounts.validateLoginAttempt(loginAttemptVerifier);
    
    return Mandrill.config({
        username: Meteor.settings.private.MANDRILL_API_USER,
        key: Meteor.settings.private.MANDRILL_API_KEY
    });
});

fetchBooks = function(search, sort, fields, user) {
  console.log("fetch books function called");
  
  var query = {};
  
  if(typeof search === undefined || search === null){
    query[0] = {"meta.userId":user};   
  } else {
    console.log("search found:"+search);
    query[0] = search;  
  }

  if (typeof sort === undefined || sort === null) {
    query[1] = {sort: { "meta.dateReadSort": -1} };
  } else {  
    query[1] = sort;
  }
  
  if (typeof(fields) === undefined || fields === null) {
    query[2] = {fields:{}};
  } else if (fields) {
    query[2] = fields;
  } else {
    query[2] = {fields:{fields:0}};
  }
  
  console.log("QUERY" + JSON.stringify(query[0]) + JSON.stringify(query[1]) + query[2]);
  
  var books = Books.find(query[0] , query[1] , query[2]).fetch();
  if (books) {
    return books;
  } else {
    return false;
  }
}

deleteUsersBooks = function(userId){
  Books.remove({"meta.userId":userId});
  return "Deleted all your books!";
}

updateUserSession = function(sessionObject){
  console.log("function called");
  Temp.remove({});
  Temp.insert({"updateStatus": sessionObject});
}

fetchFromAPI = function(url) {
  console.log("fetchFromAPI function called");
  console.log(url);
  // synchronous GET
  try {
    var result = Meteor.http.get(url, {timeout:30000});
    return result;
  } catch (e) {
    return e;
    Temp.remove({});
    Temp.insert({"updateStatus": e});
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

fetchBookMetadata = function(isbn, title, author){
  console.log("fetchBookMetadata function called");
  var url;
  if(isbn){
    url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+isbn;
  }if (title && author) {
    url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title+"+inauthor:"+author;
  }else {
    url = "https://www.googleapis.com/books/v1/volumes?q=title:"+title;
  }
  var result = fetchFromAPI(encodeURI(url));
  return result;
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

 processCSV = function(){  
  console.log("process function called");
  var data = Books.find(
      {"meta.userId": Meteor.userId()},
      {fields: {_id:0, publisherMetadata:0}}
    ).fetch();
  var rawJSON = JSON.parse(toJSONString(data));
  for (key in rawJSON){
    if (rawJSON.hasOwnProperty(key)) {
     rawJSON[key].review = rawJSON[key].review.replace(/\n/g,"");  
     console.log(rawJSON[key].review);
   }
  }
  var orderedJSON = JSON.parse(JSON.stringify( rawJSON, ["isbn","title","author","rating","dateRead","format","tags","review"], 4));
  var CSV = convertToCSV(orderedJSON);
  return CSV;
}

importJSON = function(file) {
  console.log("enter function importJSON")
  var data = JSON.parse(file);
  data.forEach(function (item, index, array) {
      item.meta.userId = Meteor.userId();
      Books.insert(item);
  });
  return;
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
    // var heavyness = line_parts[4];
    var date = line_parts[4];
    var format = line_parts[5];
    var tags = line_parts[6]
    var review = line_parts[7];
    var notes = line_parts[8];
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
