
/// <reference path="ep.core.js" />
/// <reference path="ep.ModelBase.js" />
/// <reference path="ep.ViewModelBase.js" />
/// <reference path="ep.messaging.js" />


if (typeof (window.console) == "undefined")
    window.console = { log : function (){} }


ko.renderTemplateX = function (name, data, ctx) {
    // create temporary container for rendered html
    var temp = $("<div>");
    // apply "template" binding to div with specified data
    ko.applyBindingsToNode(temp[0], { template: { name: name, data: data } }, ctx);
    // save inner html of temporary div
    var html = temp.html();
    // cleanup temporary node and return the result
    temp.remove();
    return html;
};

$(function() {
    window.alertify.set('notifier', 'position', 'bottom-left');
});


ko.bindingHandlers.starRating = {
    init: function (element, valueAccessor) {
        $(element).addClass("rating");
        $("<span class='none' title='0'>").appendTo(element);
        for (var i = 0; i < 5; i++)
            $("<span class='star' title='"+ (i+1) +"'>").appendTo(element);

        // Handle mouse events on the stars
        $("span", element).each(function (index) {
            $(this).hover(
                function () { $(this).prevAll().add(this).addClass("hoverChosen") },
                function () { $(this).prevAll().add(this).removeClass("hoverChosen") }
            ).click(function () {
                var observable = valueAccessor();  // Get the associated observable
                observable(index);               // Write the new rating to it
            });
        });
    },
    update: function (element, valueAccessor) {
        // Give the first x stars the "chosen" class, where x <= rating
        var observable = valueAccessor();
        $("span", element).each(function (index) {
            $(this).toggleClass("chosen", index <= observable());
        });
    }
};