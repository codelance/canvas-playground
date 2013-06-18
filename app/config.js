require.config({
    deps: [
        'main', "underscore-string"
    ],
    paths: {
        'jquery': '../vendor/jquery/jquery',
        'underscore': '../vendor/underscore-amd/underscore',
        'underscore-string': '../vendor/underscore.string/lib/underscore.string',
        'backbone': '../vendor/backbone-amd/backbone',
        'layoutmanager': '../vendor/layoutmanager-amd/backbone.layoutmanager'
    },
    shim: {
        "underscore-string": {
            deps:['underscore']
        }
    }
});
