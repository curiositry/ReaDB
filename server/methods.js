
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
      console.log(id);
      if(Temp.findOne({"_id":id})){
        console.log("found by id");
        if(Temp.findOne({"_id":id}).userId == Meteor.userId()){
          console.log("user match — proceeding");
          Temp.update({"_id":id}, object);
          console.log("finished");
          return true;
        }
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
    fetchDisplayName: function(str){
      console.log(str);
      var usr = str;
      var usernameRegex = new RegExp(["^", usr, "$"].join(""), "i");
      if (Meteor.users.findOne({"_id":usr})){
        var usrObj = Meteor.users.findOne({"_id": usr});
        var userId = usrObj._id;
        console.log("id match");
        if (usrObj.hasOwnProperty("username")){
          return usrObj.username;
        } else if (usrObj.hasOwnProperty("emails") && usrObj.emails[0] && usrObj.emails[0].address){
          console.log(usrObj.emails[0].address);
          return usrObj.emails[0].address;
        } else {
          return usrObj._id;
        }  
      } else if (Meteor.users.findOne({"username": usernameRegex})){
        var usrObj = Meteor.users.findOne({"username": usernameRegex});
        if (usrObj.hasOwnProperty("_id")){  
          console.log("username match");  
          var userId = usrObj._id;
          return usrObj.username;
        }
      } else {
        return "User Not Found";
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
    },
    getUserStatistics: function(userId, query){
      console.log(userId);
      console.log(Meteor.userId);
      console.log(Meteor.userId());
      
      if (typeof query === undefined || query == null) {
        query = {};
      }
      if (userId == Meteor.userId() || !userId) {
        return getUserStatistics("private", Meteor.userId(), query);
      } else {
        return getUserStatistics("public", userId, query);
      }
    }
});