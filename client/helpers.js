Handlebars.registerHelper('truncate', function(str, end, char) {
   return new Handlebars.SafeString(truncate(str, end, char));
});

Handlebars.registerHelper('slugify', function(str) {
   return new Handlebars.SafeString(slugify(str));
});

Handlebars.registerHelper('replaceLinebreaks', function(passedString, replacement) {
  var theString = passedString.replace(/\n/g,"<br>");
   return new Handlebars.SafeString(theString)
});