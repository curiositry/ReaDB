
Meteor.methods({
    upload : function(fileContent) {
      console.log("start insert");
      importCSV(fileContent);
      console.log("completed");
    },
    fetchBookMetadata: function(isbn, title, author){
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
      var totalBooksProcessed = 0;
      var totalBooksUpdated = 0;    
      for(var i = 0; i < library.length; i++){
        console.log("in for loop");
        totalBooksProcessed++;        
        var book = library[i];
        console.log(book.title);
        console.log(book.meta);
        if (!book.meta.pubdate){
          totalBooksUpdated++;
          updateUserSession({"session": {
            "userId": Meteor.userId(),
            "updateStatus": "updating book # "+totalBooksUpdated
          }});
          this.unblock();    
          var result = fetchBookMetadata(book.isbn, book.title, book.author);
          if(JSON.parse(JSON.stringify(result.content)).totalItems > 0){
            var metadata = JSON.parse(JSON.stringify(result.content)).items[0];
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
            }}); // end book update mongo query 
          } // end JSON parse if         
        } // end no meta if
      } // end for loop
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