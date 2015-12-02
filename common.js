Books = new Mongo.Collection('books');

BooksIndex = new EasySearch.Index({
  collection: Books,
  fields: ['title'],
  engine: new EasySearch.MongoDB({
    sort: () => ['rating'],
    selector: function (searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation),
        categoryFilter = options.search.props.categoryFilter;

      if (_.isString(categoryFilter) && !_.isEmpty(categoryFilter)) {
        selector.category = categoryFilter;
      }
      selector["meta.userId"] = options.search.userId;
      
      // selector["$or"] = [{"title":"rework"}];
      // 
      console.log(options.search.userId);
      console.log(JSON.stringify(selector));

      return selector;
    }
  }),
  'query': function(searchString, options) {
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);
    var userId = options.searcg.userId;
    console.log(userId);
    query["title"] = "rework";
    console.log(query);
    return query;
  }
});

Temp = new Mongo.Collection('temp');

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]); // padding
};

numberWithCommas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}