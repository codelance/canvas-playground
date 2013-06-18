define([
    'app', 'backbone','views/Paint'
],
    function (app, Backbone, PaintView) {

        var Router = Backbone.Router.extend({
            routes:{
                "":"defaultRoute",
                "/":"defaultRoute",
                '*default':"defaultRoute"
            },
            defaultRoute:function () {
                var paint_view = new PaintView();
                app.renderView(paint_view);
            }
        });

        return Router;
    });