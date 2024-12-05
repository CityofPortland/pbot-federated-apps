/// <reference path="../../../AMANDAWidgets/amanda-gis.d.ts" />
define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    "./scripts/amanda-gis-amd"
], function (declare, BaseWidget, amanda) {
    var clazz = declare([BaseWidget], {
        startup: function () {
            this.inherited(arguments);
            console.log("Inititalizing AmandaWidgets");
            if (amanda) {
                amanda.initialize(this.map, this.config);
            }
            else {
                console.log("Could not find Amanda. Make sure library has been loaded.");
            }
        },
    });
    return clazz;
});
