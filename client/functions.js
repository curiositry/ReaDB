
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

getPublicStats = function(userId, query){
  if (typeof query === undefined || query == null) {
    query = {};
  }
  var bookCount = Books.find(query).count();
  var stats = {
    "bookCount": bookCount
  };
  return stats;
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