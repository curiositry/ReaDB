Handlebars.registerHelper('truncate', function(passedString, endstring, endchar) {
  // Trim string
  var theString = passedString.substring( 0, endstring, endchar );
  // Don’t trim in the middle of a word…
  theString = theString.substr(0, Math.min(theString.length,         theString.lastIndexOf(" ")));
   if ( passedString.length > theString.length && endchar) {
     theString += endchar;
   }
   return new Handlebars.SafeString(theString);
});


Handlebars.registerHelper('replaceLinebreaks', function(passedString, replacement) {
  var theString = passedString.replace(/\n/g,"<br>");
   return new Handlebars.SafeString(theString)
});