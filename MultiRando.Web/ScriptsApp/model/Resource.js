/// <reference path="~/ScriptsApp/ep.ModelBase.js" />

(function (w, _) {

    var Model = w.ep.model;

    Model.Resource = Model.ModelBase.extend({
        modelName: 'Resource',
        idAttribute: "ResId",
        defaults: {
            "ResId": 0,
            "ResName": '',
            "TemplateKeys": '',
            "Comment": ''
        },
        factories: {
            'Values': function (m, d) { if (_.isArray(d)) m.Values = new Model.ResValueCollection(d); }
        }
    });
    Model.ResourceCollection = Model.CollectionBase.extend({ model: Model.Resource });



    Model.ResValue = Model.ModelBase.extend({
        modelName: 'ResValue',
        idAttribute: "PK",
        defaults: {
            'PK': '',
            "ResCultureId": 0,
            "Value": null,
            "LastChangeDate": new Date(1901, 01, 01)
        }
    });
    Model.ResValueCollection = Model.CollectionBase.extend({ model: Model.ResValue });



    Model.ResourceCulture = Model.ModelBase.extend({
        modelName: 'ResourceCulture',
        idAttribute: "ResCultureId",
        defaults: {
            "ResCultureId": 0,
            "IsDefault": false
        }
    });
    Model.ResourceCultureCollection = Model.CollectionBase.extend({
        model: Model.ResourceCulture,
        url: '/query/Neva.Resource.Messages.Queries.AllCultures/'
    });


}(window, _));