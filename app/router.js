define([
    'app', 'backbone','views/Paint'
],
    function (app, Backbone, PaintView) {

        var Router = Backbone.Router.extend({
            routes:{
                "":"defaultRoute",
                "/":"defaultRoute",
                '*path':"defaultRoute",
                '*notFound':"not_found"
            },
            defaultRoute:function () {
                var paint_view = new PaintView();
                app.renderView(paint_view);
            },
            not_found:function () {
                //do nothing
                console.error("Route \"" + Backbone.history.fragment + "\" not found");
            }
        });

        return Router;
    });