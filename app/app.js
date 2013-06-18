define(['underscore','backbone', 'layoutmanager'],
    function (_, Backbone) {

        var app = {
            // The root path to run the application.
            root:window.location.pathname
        };

        // Localize or create a new JavaScript Template object.
        var JST = window.JST = window.JST || {};

        // Configure LayoutManager with Backbone Boilerplate defaults.
        Backbone.Layout.configure({
            manage:true,
            prefix:"app/templates/",

            fetch:function (path) {
                path = path + '.html';
                if (JST[path]) {
                    return JST[path];
                }

                var done = this.async();

                $.get(app.root + path, function (contents) {
                    done(JST[path] = _.template(contents));
                }, "text");
            },
            render:function (template, context) {
                return template(context);
            }
        });

        // Mix Backbone.Events, modules, and layout management into the app object.
        return _.extend(app, {
            // Create a custom object with a nested Views object.
            module:function (additionalProps) {
                return _.extend({ Views:{} }, additionalProps);
            },

            // Helper for using layouts.
            useLayout:function (name, options) {

                // If a layout already exists, remove it from the DOM.
                if (this.layout) {
                    this.layout.removeView();
                    delete this.layout;
                }

                if (_.isObject(name)) {
                    options = name;
                }

                options = options || {};

                if (_.isString(name)) {
                    options.template = name;
                }

                // Create a new Layout.
                this.layout = new Backbone.Layout(_.extend({
                    el: "#main"
                }, options));

                return this.layout;
            },
            renderView:function (view, options) {

                options = options || {};
                if( this.layout ){
                    this.layout.removeView();
                } else {
                    // Create a new Layout.
                    this.layout = new Backbone.Layout(_.extend({
                        el: "#main"
                    }, options));
                }

                this.layout.setView(view).render();

                return this.layout;
            }
        }, Backbone.Events);

    });