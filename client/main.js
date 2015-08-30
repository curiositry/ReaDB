Router.route('/', function () {
  this.render('Home');
});

Router.route('/book/:_id', function () {
  this.render('viewBook');
  var params = this.params; // { _id: "5" }
  var id = params._id; // "5"
  Session.set("bookId", id)
});

Router.route('/export/json', function () {
  this.render('exportJSON');
});

Router.route('/export/csv', function () {
  this.render('exportCSV');
});

Router.route('/import/csv', function () {
  this.render('importCSV');
});

Router.route('add', function () {
  this.render('addBook');
  // var params = this.params; // { _id: "5" }
  // var id = params._id; // "5"
  // Session.set("bookId", id)
});

function importCSV(file){
  var lines = file.split(/\r\n|\n/);
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

function fetchBooks () {
  return Books.find({"meta.userId": Meteor.userId()}).fetch()
}

function toJSONString(data){
  var str = JSON.stringify(data);
  console.log(str);
  console.log(JSON.parse(str));
  return str.substring(0, str.length - 0);
}


Template.importCSV.events({
 "click #importCSV" : function(event, template) {
  event.stopPropagation();
  event.preventDefault();;
  var f = document.getElementById('fileInput').files[0];
  console.log("read file");
  readFile(f, function(content) {
    Meteor.call('upload',content);
    Router.go("/")

    Session.set("notification", "Sucessfully imported "+f.name+" as CSV");
  });
 }
});


Template.bookList.helpers({
  books: function(){
    result = Books.find({"meta.userId": Meteor.userId()},{sort: [["rating","asc"],["dateAdded","desc"]]});
    // var rating = result.rating;
    // var stars;
    // for(var i = 0; i < rating; i++){
    //   stars += "<i class='fa fa-star'></i>";
    // }
    // document.getElementById('stars'+result._id).innerHTML = stars;
    return result;
  }  
});

Template.header.helpers({
  notification: function(){
    return Session.get("notification");
  }
})

Template.viewBook.helpers({
  book: function(){
    var bookId = Session.get("bookId");
    return Books.findOne({_id: bookId});
  }
});

Template.exportJSON.helpers({
  "JSON": function(){
    return toJSONString(fetchBooks());
  }
});

Template.exportCSV.helpers({
  "CSV": function(){
    return convertToCSV(toJSONString(fetchBooks()));
  },
  "encodedCSV": function(){
    return encodeURIComponent(convertToCSV(toJSONString(fetchBooks())));
  }
});

Template.exportCSV.events({
  "click #download-csv":function(){
    console.log("click!!!");
    console.log(toJSONString(fetchBooks()));
    var JSON = toJSONString(fetchBooks());
    downloadFile(convertToCSV(JSON),"csv");
  }
});

Template.addBook.events({
  "submit form": function(event, template){
    event.preventDefault();
    Books.insert({
      "bookid": null,
      "isbn": event.target.isbn.value, 
      "title": event.target.title.value,
      "author": event.target.author.value,
      "img": "",
      "review": event.target.review.value, 
      "notes": event.target.notes.value, 
      "rating": event.target.rating.value,
      "tags": event.target.tags.value, 
      "meta": {
        "userId": Meteor.userId()
      }
    })
  }
})