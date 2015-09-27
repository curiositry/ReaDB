Router.route('/', function () {
  this.render('Home');
});

Router.route('/about', function () {
  this.render('about');
});

Router.route('/user/:_id', function () {
  var params = this.params; 
  var usr = params._id; 
  this.render("404");
  var usernameRegex = new RegExp(["^", usr, "$"].join(""), "i");
  if (Meteor.users.find({"_id":usr}).fetch()[0]){
    console.log("id match");
    Session.set("userId", usr);
    var username = Meteor.users.find({"_id":usr}).fetch()[0].username;
    Session.set("profileUsername", username);
    this.render('viewUserProfile');
    this.next();
  } else if (Meteor.users.find({"username":usernameRegex}).fetch()[0]){
    var userId = Meteor.users.find({"username":usernameRegex}).fetch()[0]._id;
    var username = usr;
    Session.set("profileUserId", userId);
    Session.set("profileUsername", username);
    this.render('viewUserProfile');
    this.next();
  } else if (Session.get("newUsername")) {
    console.log("username changed!");
    var newUsername = Session.get("newUsername");
    Router.go("/user/"+newUsername);
  }
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

Router.route('add', function () {
  this.render('addBook');
  // var params = this.params; // { _id: "5" }
  // var id = params._id; // "5"
  // Session.set("bookId", id)
});
