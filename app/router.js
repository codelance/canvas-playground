define([
    'app', 'backbone','views/Paint'
],
    function (app, Backbone, PaintView) {

        var Router = Backbone.Router.extend({
            routes:{
                "/":"defaultRoute",
                "":"defaultRoute",
                '*notFound':"not_found"
            },
            defaultRoute:function () {
                var paint_view = new PaintView();
                app.renderView(paint_view);
            },
            not_found:function () {
                //do nothing
            }
        });

        return Router;
    });