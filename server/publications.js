Meteor.publish('userBooks', function() {  
  return Books.find({"meta.userId":this.userId});
});

Meteor.publish('userTemp', function() {  
  return Temp.find({"userId":this.userId});
});