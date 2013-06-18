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
                console.log("default route hit")
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