Handlebars.registerHelper('appUrl', function() {
   return new Handlebars.SafeString(Meteor.absoluteUrl()));
});

Handlebars.registerHelper('truncate', function(str, end, char) {
   return new Handlebars.SafeString(truncate(str, end, char));
});

Handlebars.registerHelper('slugify', function(str) {
   return new Handlebars.SafeString(slugify(str));
});

Handlebars.registerHelper('plural', function(num, nill, singular, plural) {
   if (num == 0 || num == undefined) {
     return  new Handlebars.SafeString(nill);
   } else if (num == 1) {
     return  new Handlebars.SafeString(singular);
   } else if (num > 1) {
     return  new Handlebars.SafeString(plural);
   }
});

Handlebars.registerHelper('ifItemExists', function(item) {
   if (item) {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper('isPublic', function(item) {
  var publicPages = ['login','about'];
  var as = Meteor.absoluteUrl();
  console.log(as);
  console.log(as+'/login');
  console.log(Router.current().url
);
  if(Router.current().url == '/login'  || 
     Router.current().url == '/about' ||
     Router.current().url == as+'login' ||
     Router.current().url == as+'about'){
    return true
  } else {
    return false;
  }
});

Handlebars.registerHelper('replaceLinebreaks', function(passedString, replacement) {
  var theString = passedString.replace(/\n/g,"<br>");
   return new Handlebars.SafeString(theString)
});