
fetchBooks = function() {
  return Books.find({"meta.userId": Meteor.userId()}).fetch()
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
  var book = Books.find({_id:bookId}).fetch()[0];
  if(book.meta.userId == Meteor.userId()){
    Books.remove({_id:bookId});
  }else {
    console.log("Oops! Book doesn’t seem to belong to you!");
    Session.set("notification","Oops! Book doesn’t seem to belong to you!");  
  }
}