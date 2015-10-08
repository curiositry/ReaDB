Meteor.publish('userBooks', function() {  
  return Books.find({"meta.userId":this.userId});
});