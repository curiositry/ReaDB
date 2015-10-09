Template.importCSV.events({
 "click #importCSV" : function(event, template) {
  event.stopPropagation();
  event.preventDefault();;
  var f = document.getElementById('fileInput').files[0];
  console.log("read file");
  readFile(f, function(content) {
    Meteor.call('uploadCSV',content);
    Router.go("/")

    Session.set("notification", "Sucessfully imported "+f.name+" as CSV");
  });
 }
});

Template.importJSON.events({
 "click #importJSON" : function(event, template) {
  event.stopPropagation();
  event.preventDefault();;
  var f = document.getElementById('fileInput').files[0];
  console.log("read file");
  readFile(f, function(content) {
    Meteor.call('uploadJSON',content);
    Router.go("/")

    Session.set("notification", "Sucessfully imported "+f.name+" as CSV");
  });
 }
});


Template.bookList.helpers({
  books: function(){
    fetchBooks(null,null)
    return Session.get("books");
  },
  stats: function(){
    return getPublicStats(Meteor.userId());
  }
});

Template.header.helpers({
  notification: function(){
    var notification = Session.get("notification");
    Session.set("notification", "");
    return notification;
  }
});

Template.navigation.helpers({
  user: function() {
    var username = Meteor.users.find({_id:Meteor.userId()}).fetch()[0].username;
    if (username) return username;
    else return Meteor.userId();
  }
})

Template.login.events({
  'click .login-btn': function(e){
    e.stopPropagation();
    Accounts._loginButtonsSession.set('dropdownVisible', true);
},
'click .signup-btn': function(e){
  console.log("click");
  e.stopPropagation();
  Accounts._loginButtonsSession.set('dropdownVisible', true);
  Accounts._loginButtonsSession.resetMessages();
  Accounts._loginButtonsSession.set('inSignupFlow', true);
  Accounts._loginButtonsSession.set('inForgotPasswordFlow', false);
  Tracker.flush()
  var redraw = document.getElementById('login-dropdown-list');
  redraw.style.display = 'none';
  redraw.offsetHeight; // it seems that this line does nothing but is necessary for the redraw to work
  redraw.style.display = 'block';
}
});

Template.viewBook.helpers({
  book: function(){
    var bookId = Session.get("bookId");
    return Books.findOne({_id: bookId});
  }
});

Template.editBook.helpers({
  bookJSON: function(){
    var bookId = Session.get("bookId");
    return JSON.stringify(Books.findOne({_id: bookId}), null, 2);
  },
  bookId: function(){
    return Session.get("bookId")
  }
});

Template.editBook.events({
  "submit form": function(){
    var bookId = Session.get("bookId");
    var updatedBookJSON = document.getElementById("bookJSON").value;
    Meteor.call("updateBook", bookId, JSON.parse(updatedBookJSON), function(err, res){
      if (err) throw err;
      if (res) return res;
    });
  }
});

Template.viewUserProfile.events({
  "click #deleteBooks": function(event, template){
    Session.set("notification", "Deleted all your books!");
    Meteor.call("deleteCurrentUsersBooks");
  },
  "click #updateLibraryMetadata": function(){
    Meteor.call("updateLibraryMetadata");
    var el = document.getElementById("updateLibraryMetadata");
    Meteor.call("updateUserSession", "<i class='fa fa-spinner'></i> Working…");
    el.innerHTML = Temp.find({}).fetch()[0].updateStatus;
  },
  "click #updateUsername": function(){
    var newUsername = document.getElementById("newUsername").value;
    var oldUsername = Meteor.users.find({_id:Meteor.userId()}).fetch()[0].username;
    Session.set("newUsername",newUsername);
    Session.set("oldUsername",oldUsername);
    Session.set("notification", "Username sucessfully changed from "+oldUsername+" to "+newUsername);
    Meteor.call("updateUsername", newUsername, function(err, res){
      if(res){    
        Router.go("/");
      } if (err) {
        throw err;
      }
    });
  }
});

Template.viewUserProfile.helpers({
  stats: function(){
    return getPublicStats(Session.get("profileUserId"))
  },
  username: function(){
    return Session.get("profileUsername");
  }
});

Template.viewBook.events({
  "click #deleteBook": function(){
    var bookId = Session.get("bookId");
    deleteBook(bookId);
    Session.set("notification", "☑ Sucessfully deleted book: " +bookId);
    Router.go("/");
  },
  "click #updateBookMetadata": function(){
    console.log("click!");
    var bookId = Session.get("bookId");
    var book = Books.find({_id:bookId}).fetch()[0];
    var isbn =  book.isbn;
    var title = book.title;
    var author = book.author;
    Meteor.call("fetchBookMetadata", isbn, title, author, function(error, result){
      console.log("call")
      if(result){
        console.log(result.content);
        if(JSON.parse(result.content).totalItems > 0){
          console.log("in if");
          var metadata = JSON.parse(result.content).items[0];
          console.log(metadata);  
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
          var updatedFields =  {             
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
          };
          Meteor.call("updateBookMetadata", bookId, updatedFields, function(err, res){
            if(res){
              Session.set("notification", "☑ Sucessfully updated "+ book.title +" metadata!");   
              return true;
            } if (err) {
              throw err;
            }
          });
          
        }
      } if (error){
        throw error;
      }
    });
    
  }
});

Template.exportJSON.helpers({
  "JSON": function(){
    var fields = {fields: {"_id":0}};
    fetchBooks(undefined, fields);
    return encodeURIComponent(toJSONString(Session.get("books")));
  }
});

Template.exportCSV.helpers({
  CSV: function(){
    return Meteor.call('processCSV');
  },
  encodedCSV: function(){
    Meteor.call('processCSV', function(err,res){
      if(err){
        return err;
      } else {
        Session.set("CSV", res);
      }
    });
    return encodeURIComponent(Session.get("CSV"));
  }
});

Template.exportCSV.events({
  "click #download-csv":function(){
    console.log("click!!!");
    console.log(toJSONString(fetchBooks()));
    var JSON = toJSONString(fetchBooks());
    downloadFile(encodeURIComponent(Meteor.call("processCSV")),"csv");
  }
});

Template.addBook.events({
  "click #fetchFromISBN": function(event, template){
    event.preventDefault();
    event.stopPropagation();
    
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
    var newBook = {
      "isbn": event.target.isbn.value, 
      "title": event.target.title.value,
      "author": event.target.author.value,
      "rating": event.target.rating.value,
      "dateRead": event.target.dateRead.value,
      "format": event.target.format.value,
      "tags": event.target.tags.value, 
      "review": event.target.review.value, 
      "notes": event.target.notes.value, 
      "meta": {
        "userId": Meteor.userId(),
        "dateAdded": dateAdded,
        "imgUrl": event.target.imgUrl.value,
        "pubdate": event.target.pubdate.value,
        "publisherDescription": event.target.publisherDescription.value,
        "pageCount": event.target.pageCount.value,
        "imgUrl": event.target.imgUrl.value
      }
    };
    Meteor.call("insertBook", newBook, function(err, res){
      if (err) {
        throw err;
      } if (res) {
        Session.set("notification", "☑ "+event.target.title.value+" sucessfully added to database");
        Router.go("/");
        return;
      } else {
        console.log("insert book method call failed");
        return false;
      }
    });
  }
});