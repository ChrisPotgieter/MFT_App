define(['angular',
    'angular-couch-potato'

], function (ng, couchPotato) {

    "use strict";

    var module = ng.module('app.tables',[]);

    couchPotato.configureApp(module);

    module.run(function ($couchPotato) {
        module.lazy = $couchPotato;
    });
    return module;

});
