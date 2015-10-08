
fetchBooks = function(sort, fields) {
  Meteor.call("fetchBooks", sort, fields, function(err,res){
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

getPublicStats = function(userId){
  var bookCount = Books.find({"meta.userId": userId}).count();
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
      Session.set("notification","Oops! Book doesn’t seem to belong to you!"); 
    }
  });
}