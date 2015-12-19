Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'pageNotFound',
  loadingTemplate: 'loading'
});

if(Meteor.userId()){
  Router.route('/', function(){
    this.render('bookList');
    this.redirect('/books');
    Session.set("findBy", "");
  });
} else {
  Router.route('/', function(){
    this.redirect('/about');
    this.render("about");
  });
}  

Router.map(function() {
  this.route('bookList', {path: '/books'});
;
  this.route('addBook', {path: '/add'});
  this.route('about', {path: '/about'});
  this.route('search', {path: '/search'});
  
  this.route('IO', {path: '/IO'});
  this.route('exportJSON', {path: '/export/json'});
  this.route('importJSON', {path: '/import/json'});
  this.route('exportCSV', {path: '/export/csv'});
  this.route('importCSV', {path: '/import/csv'});
});

Router.route("/login", function(){
  if (Meteor.userId()){
    Router.go("/");
  } else {
    this.render('login');  
  }
});

Router.route("viewUserProfile", {
  path: "/user/:usr",
  waitOn: function() {  
    var params = this.params; 
    var usr = params.usr; 
    Session.set("usr", usr);
    Meteor.call("fetchDisplayName", usr, function(err,res){
      if(err){
        throw err;
      } else if (res){
        console.log(res);
        Session.set("displayName", res);
      } else {
        console.log("meteor call didn’t return");
        return false;
      }
    });
     if (Session.get("newUsername")) {
      console.log("username change match");
      console.log("username changed!");
      var newUsername = Session.get("newUsername");
      Router.go("/user/"+newUsername);
      Session.set("displayName", Session.get("newUsername")); 
    }
  },
  action: function () {
    this.render('viewUserProfile');
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

Router.route('/b/:_id/delete', function () {
  var params = this.params;
  var id = params._id;
  deleteBook(id);
  Router.go("/");
  var n = {
      "title": "Book deleted!",
      "message": "Sucessfully deleted book: " + bookId,
      "type": "success",
    };  
  Session.set("bert-next-notification", n);
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