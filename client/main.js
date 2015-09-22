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

function deleteBook (bookId) {
  Books.remove({_id:bookId});
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
    var notification = Session.get("notification");
    Session.set("notification", "");
    return notification;
  }
})

Template.viewBook.helpers({
  book: function(){
    var bookId = Session.get("bookId");
    return Books.findOne({_id: bookId});
  }
});

Template.viewBook.events({
  "click #deleteBook": function(){
    var bookId = Session.get("bookId");
    deleteBook(bookId);
    Session.set("notification", "☑ Sucessfully deleted book: " +bookId);
    Router.go("/");
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
  "click #fetchFromISBN": function(event, template){
    event.preventDefault();
    var isbn = document.getElementById("isbnInput").value;
    var title = document.getElementById("titleInput").value;
    var author = document.getElementById("authorInput").value;
    
    console.log(isbn);
    console.log(title);
    console.log(author);
    
    
    Meteor.call("fetchBookMetadata", isbn, title, author, function(error, result){
      if(result){
        var metadata = JSON.parse(result.content).items[0];
        
        var isbnInput = document.getElementById('isbnInput');
        var titleInput = document.getElementById('titleInput');
        var authorInput = document.getElementById('authorInput');
        var publicationDateInput = document.getElementById('publicationDateInput');
        var publisherDescriptionInput = document.getElementById('publisherDescriptionInput');
        var tagsInput = document.getElementById('tagsInput');
        var ratingInput = document.getElementById('ratingInput');
        var imgUrlInput = document.getElementById('imgUrlInput');
        var pageCountInput = document.getElementById('pageCountInput')
        
        if(!isbn){
          if (metadata.volumeInfo.industryIdentifiers[1]){
            isbnInput.value = metadata.volumeInfo.industryIdentifiers[1].identifier;
          }else {
            isbnInput.value = metadata.volumeInfo.industryIdentifiers[0].identifier;
          }
        }      
        titleInput.value = metadata.volumeInfo.title;
        authorInput.value = metadata.volumeInfo.authors;
        publicationDateInput.value = metadata.volumeInfo.publishedDate;      
        publisherDescriptionInput.value = metadata.volumeInfo.description;
        tagsInput.value = metadata.volumeInfo.categories;
        ratingInput.value =  metadata.volumeInfo.averageRating;
        imgUrlInput.value = metadata.volumeInfo.imageLinks.thumbnail;
        pageCountInput.value = metadata.volumeInfo.pageCount;
        
      }
      if(error){
        Session.set("notification", "Error fetching metadata from ISBN: "+error);
      }
    });
    
  },
  "submit form": function(event, template){
    event.preventDefault();
    d = new Date();
    var dateAdded = d.yyyymmdd();
    Books.insert({
      "bookid": null,
      "isbn": event.target.isbn.value, 
      "title": event.target.title.value,
      "author": event.target.author.value,
      "dateRead": event.target.dateRead.value,
      
      "review": event.target.review.value, 
      "notes": event.target.notes.value, 
      "rating": event.target.rating.value,
      "tags": event.target.tags.value, 
      "format": event.target.format.value,
      "meta": {
        "userId": Meteor.userId(),
        "dateAdded": dateAdded,
        "imgUrl": event.target.imgUrl.value,
        "pubdate": event.target.pubdate.value,
        "publisherDescription": event.target.publisherDescription.value,
        "pageCount": event.target.pageCount.value,
        "imgUrl": event.target.imgUrl.value
      }
    });
    Session.set("notification", "☑ "+event.target.title.value+" sucessfully added to database");
    Router.go("/");
  }
})