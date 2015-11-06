
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