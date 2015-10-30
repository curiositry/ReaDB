Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'pageNotFound'
});

if(Meteor.userId()){
  Router.route('/', function(){
    this.render('bookList');
    Session.set("findBy", "");
  });
} else {
  Router.route('/', function(){
    this.render("about")
  });
}  

Router.map(function() {
  this.route('addBook', {path: '/add'});
  this.route('about', {path: '/about'});
  this.route('search', {path: '/search'});
});

Router.route('/user/:_id', function () {
  var params = this.params; 
  var usr = params._id; 
  this.waitOn = function(){
    var usernameRegex = new RegExp(["^", usr, "$"].join(""), "i");
    if (Meteor.users.find({"_id":usr}).fetch()[0]){
      console.log("id match");
      Session.set("userId", usr);
      var username = Meteor.users.find({"_id":usr}).fetch()[0].username;
      Session.set("profileUsername", username);
      this.next();
    } else if (Meteor.users.find({"username":usernameRegex}).fetch()[0]._id){
      console.log("userame match");  
      var userId = Meteor.users.find({"username":usernameRegex}).fetch()[0]._id;
      var username = usr;
      Session.set("profileUserId", userId);
      Session.set("profileUsername", username);
      this.next();
    } else if (Session.get("newUsername")) {
      console.log("username change match");
      console.log("username changed!");
      var newUsername = Session.get("newUsername");
      Router.go("/user/"+newUsername);
    } else {
      console.log("epic fail")
      Router.go("/404");
      this.next();
    }
    Session.set("profileUsername", username);
  }
  this.render('viewUserProfile');
});

Router.route('/tags/:tag', function () {
  this.render('bookList');
  var params = this.params;
  var tag = params.tag; 
  var query = tag;
  Session.set("findBy",query);
});

Router.route('/book/:_id', function () {
  this.render('viewBook');
  var params = this.params; // { _id: "5" }
  var id = params._id; // "5"
  Session.set("bookId", id)
});

Router.route('/book/:_id/edit', function () {
  this.render('editBook');
  var params = this.params;
  var id = params._id;
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

Router.route('/import/json', function () {
  this.render('importJSON');
});

Router.route("/(.*)", function() {
    this.render('pageNotFound');
    this.next();
});