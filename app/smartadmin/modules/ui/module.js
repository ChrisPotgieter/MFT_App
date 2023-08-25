define(['angular',
    'angular-couch-potato'
    ], function(ng, couchPotato){

    var module = angular.module('app.ui', []);

    couchPotato.configureApp(module);


    module.run(function($couchPotato){
        module.lazy = $couchPotato
    });

    return module;
});