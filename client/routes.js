Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'pageNotFound',
  loadingTemplate: 'loading'
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
  this.route('login', {path: '/login'});
  
  this.route('IO', {path: '/IO'});
  this.route('exportJSON', {path: '/export/json'});
  this.route('importJSON', {path: '/import/json'});
  this.route('exportCSV', {path: '/export/csv'});
  this.route('importCSV', {path: '/import/csv'});
});

Router.route("viewUserProfile", {
  path: "/user/:_id",
  template: "viewUserProfile",
  waitOn: function() {  
    var params = this.params; 
    var usr = params._id; 
    Session.set("usr", usr);
    var usr = Session.get("usr");
    var usernameRegex = new RegExp(["^", usr, "$"].join(""), "i");
    if (Meteor.users.find({"_id":usr}).fetch()[0]){
      console.log("id match");
      Session.set("userId", usr);
      var username = Meteor.users.find({"_id":usr}).fetch()[0].username;
      Session.set("profileUsername", username);
      this.next();
    } else if (Meteor.users.findOne({"username":usernameRegex}).hasOwnProperty("_id")){
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
      console.log("epic fail");
      Router.go("/404");
      this.next();
    }
    Session.set("profileUsername", username);
  }
});

Router.route('/tags/:tag', function () {
  this.render('bookList');
  var params = this.params;
  var tag = params.tag; 
  var query = tag;
  Session.set("findBy",query);
});

Router.route('/b/:_id', function () {
  this.render('viewBook');
  var params = this.params;
  var id = params._id;
  Session.set("bookId", id)
});

Router.route('/b/:_id/edit', function () {
  this.render('editBook');
  var params = this.params;
  var id = params._id;
  Session.set("bookId", id)
});

Router.route('/b/:_id/editJSON', function () {
  this.render('editBookJSON');
  var params = this.params;
  var id = params._id;
  Session.set("bookId", id)
});

Router.route('/b/:author/:title/:_id', function () {
  this.render('viewBook');
  var params = this.params;
  var id = params._id;
  Session.set("bookId", id)
});

Router.route("/(.*)", function() {
    this.render('pageNotFound');
    this.next();
});