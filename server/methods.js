
Meteor.methods({
    fetchBooks: function(search, sort, fields){
      return fetchBooks(search, sort, fields, Meteor.userId());
    },
    fetchBook: function(bookId){
      return Books.findOne({"_id": bookId});
    },
    insertBook: function(bookObject){
      console.log("in insert method");
      console.log(bookObject.meta.userId)
      
      if(bookObject.meta.userId == Meteor.userId()){
        Books.insert(bookObject);
        return true;
      } else {
        return false;
      }
    },
    deleteBook: function(bookId){
      var book = Books.find({_id:bookId}).fetch()[0];
      if(book.meta.userId == Meteor.userId()){
        Books.remove({_id:bookId});
        return true;
      } else {
        console.log("Oops! Book doesn’t seem to belong to you!");
        return false;
      }
    },
    insertTempItem: function(tempItem){
      if(tempItem.userId == Meteor.userId()){
        Temp.insert(tempItem);
      }
    },
    deleteTempItem: function(id){
      if(Temp.findOne({"_id":id}).userId == Meteor.userId()){
        Temp.remove({"_id":id});
      }
    },
    updateTempItem: function(id, object){
      if(Temp.findOne({"_id":id}).userId == Meteor.userId()){
        Temp.update({"_id":id}, object);
      }
    },
    updateBook: function(bookId, updatedBookObject){
      var book = Books.find({_id:bookId}).fetch()[0];
      if(book.meta.userId == Meteor.userId()){
        Books.update({_id:bookId}, updatedBookObject);
        return true;
      } else {
        console.log("Oops! Book doesn’t seem to belong to you!");
        return false;
      }
    },
    updateBookMetadata: function(bookId, updatedFields){
      var book = Books.find({_id:bookId}).fetch()[0];
      if(book.meta.userId == Meteor.userId()){
        Books.update({_id: bookId},{$set: updatedFields});
        return true;
      } else {
        console.log("Oops! Book doesn’t seem to belong to you!");
        return false;
      }
    },
    uploadCSV : function(fileContent) {
      console.log("start CSV insert");
      importCSV(fileContent);
      console.log("completed");
    },
    uploadJSON : function(fileContent) {
      console.log("start JSON insert");
      importJSON(fileContent);
      console.log("completed");
    },
    fetchBookMetadata: function(isbn, title, author){
      this.unblock();
      return fetchBookMetadata(isbn, title, author);
    },
    fetchUsername: function(userId){
      var username = Meteor.users.find({"_id":userId}).fetch()[0].username;
      console.log(username)
      if (username) {;
        return username;
      } else {
        return userId;
      }
    },
    processCSV: function(){
      console.log("process method called");
      return processCSV();
    },
    updateLibraryMetadata: function(){
      // this.unblock();
      console.log("update lib meta called");
      var library = Books.find({"meta.userId":Meteor.userId()}).fetch(); 
      var totalBooksProcessed = 0;
      var totalBooksUpdated = 0;    
      for(var i = 0; i < library.length; i++){
        console.log("in for loop");
        totalBooksProcessed++;        
        var book = library[i];
        if (!book.hasOwnProperty("publisherMetadata") || !book.publisherMetadata.hasOwnProperty("pubdate") ){
          console.log(book.title);
          console.log(book.meta);
          totalBooksUpdated = totalBooksUpdated + 1;
          updateUserSession(toString(totalBooksUpdated));
          this.unblock();    
          var result = fetchBookMetadata(book.isbn, book.title, book.author);
          if(JSON.parse(result.content).totalItems){
            console.log("found book in api call");
            var metadata = JSON.parse(result.content).items[0];
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
            console.log(metadata.volumeInfo.imageLinks.thumbnail);  
            Books.update({_id: book._id},{$set: {             
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
                "imgUrl":  metadata.volumeInfo.imageLinks.thumbnail,
                "pubdate": metadata.volumeInfo.publishedDate,
                "publisherDescription": metadata.volumeInfo.description,
                "pageCount": metadata.volumeInfo.pageCount,
                "publisherTitle": metadata.volumeInfo.title,
                "publisherAuthors": metadata.volumeInfo.author,
              }
            }}); // end book update mongo query 
          } // end JSON parse if         
        } // end no meta if
      } // end for loop
      updateUserSession("Update Library Metadata (working…)");
    }, // end method
    updateUsername: function(newUsername){
      console.log(Accounts.setUsername(Meteor.userId(), newUsername));
      Accounts.setUsername(Meteor.userId(), newUsername);
    },
    deleteCurrentUsersBooks: function(){
      Books.remove({"meta.userId":Meteor.userId()});
    },
    updateUserSession: function(sessionObject){
      console.log("Method called");
      updateUserSession(sessionObject);
    }
});