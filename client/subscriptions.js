Tracker.autorun(function () {
    Meteor.subscribe("userBooks");
    Meteor.subscribe("userTemp");
});