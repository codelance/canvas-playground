define([
    'app', 'underscore', 'backbone'
],
    function (app, _, Backbone) {

        var Paint = Backbone.View.extend({
            id: "Edit",
            className: "",
            template: 'PaintInterface',
            events: {
                "click #close": "export",
                "click #revert": "revert",
                /*manipulators*/
                "change #brushInput": "change_brush_size",
                "change #textType": "change_font",
                "change #textInput": "change_fontsize",
                /*actions*/
                "click #copyStyles": "save_template",
                "click #applyStyles": "apply_template",
                "click #flipHorz": "flipImgHorz",
                "click #flipVert": "flipImgVert",
                "click #grid":"show_grid",
                "click #colors li.color":"change_color",
                "click #toolbox li.tool":"select_tool",
                /*interaction*/
                "mousedown canvas#image":"user_mousedown",
                "mouseup canvas#image":"user_mouseup",
                "mousemove canvas#image":"user_mousemove"
            },
            CURRENT_TOOL:"",
            initialize: function (options) {
                this.options = options || {};
                this.shapes = new Array();
            },
            beforeRender: function () {
                //throw up blocking backdrop
                $('#main').prepend("<div id=\"Underlay\"></div>");
            },
            afterRender: function () {
                this.canvas = this.$('#image')[0];
                this.canvas_ctx = this.canvas.getContext('2d');

                var img = new Image();
                var self = this;
                img.onload = function () {
                    //draw frame on canvas
                    self.canvas_ctx.drawImage(this,0, 0);
                }

                var width = this.canvas.width;
                var height = this.canvas.height;
                img.src = "http://placehold.it/"+width+"x"+height+"/&text=Start%20Painting";

                this.canvas_ctx.strokeStyle = this.$('#currentColor').css('background-color');
                this.canvas_ctx.lineWidth = this.$('#brushInput').val();
            },
            export: function () {

            },
            revert: function () {

            },
            flipImgHorz: function () {
                //flip current canvas horizontally
                this.canvas_ctx.save();
                this.canvas_ctx.translate(this.canvas.width, 0);
                this.canvas_ctx.scale(-1, 1);
                this.canvas_ctx.drawImage(this.canvas, 0, 0);
                this.canvas_ctx.restore();
            },
            flipImgVert: function () {
                //flip current canvas vertically
                this.canvas_ctx.save();
                this.canvas_ctx.scale(1, -1);
                this.canvas_ctx.drawImage(this.canvas, 0, -this.canvas.height);
                this.canvas_ctx.restore();
            },
            show_grid:function(){

                this.canvas_ctx.save();
                this.canvas_ctx.lineWidth = this.$('#brushInput').val();
                this.canvas_ctx.strokeStyle = this.$('#currentColor').css('background-color');

                // horizontal grid lines
                for(var i = 0; i <= this.canvas.height; i = i + 50)
                {
                    this.canvas_ctx.beginPath();
                    this.canvas_ctx.moveTo(0, i);
                    this.canvas_ctx.lineTo(this.canvas.width, i);
                    this.canvas_ctx.closePath();
                    this.canvas_ctx.stroke();
                }

                // vertical grid lines
                for(var j = 0; j <= this.canvas.width; j = j + 50)
                {
                    this.canvas_ctx.beginPath();
                    this.canvas_ctx.moveTo(j, 0);
                    this.canvas_ctx.lineTo(j, this.canvas.height);
                    this.canvas_ctx.closePath();
                    this.canvas_ctx.stroke();
                }

                this.canvas_ctx.restore();
            },
            change_color:function(event){
                var color = this.$(event.currentTarget).css('background-color');
                this.$('#currentColor').css('background-color', color);
                this.$('#colors li.color').removeClass('active');
                this.$(event.currentTarget).addClass('active');
                this.canvas_ctx.strokeStyle = color;
            },
            change_brush_size:function(event){
                this.canvas_ctx.lineWidth = this.$(event.currentTarget).val();
            },
            change_font:function(event){
                if( this.$('#textinput').length != 0 ){
                    this.$('#textinput').css('font-family', this.$('#textType').val());
                }
            },
            change_fontsize:function(){
                if( this.$('#textinput').length != 0 ){
                    this.$('#textinput').css('font-size', this.$('#textInput').val());
                }
            },
            select_tool:function(event){
                var button = this.$(event.currentTarget);
                this.CURRENT_TOOL = button.attr('data-tool');
                this.$('#toolbox li.tool').removeClass('active');
                button.addClass('active');
            },
            user_mousedown:function(event){

                this.mousedown = true;
                this.mouse_down_x = event.offsetX;
                this.mouse_down_y = event.offsetY;

                //text tool
                if( this.CURRENT_TOOL == "TEXT" ){

                    this.$('#CanvasInput').remove();

                    var text_input = $("<div />",
                        {id:"CanvasInput", style:"position:absolute;top:"+this.mouse_down_y+"px;left:"+this.mouse_down_x+"px;z-index:30;"});
                    text_input.append($("<textarea />",{id:"textinput", rows:"5", cols:"20", type:"text",style:"resize:both;"}));

                    var saveText = $("<input />",{id:"SaveText",type:"submit",value:"Save Text"}).click(_.bind(this.user_mouseup, this));
                    text_input.append(saveText);

                    this.$("#Frame").append(text_input);

                    this.$('#textinput').css('font-family', this.$('#textType').val());
                    this.$('#textinput').css('font-size', this.$('#textInput').val());

                    this.$( "#textinput" ).resizable({
                        handles: "se"
                    });
                }
                //pencil tool
                else if( this.CURRENT_TOOL == "DRAW"){
                    this.canvas_ctx.beginPath();
                    this.canvas_ctx.moveTo(event.offsetX, event.offsetY);
                }
                //rect, line, & circle tool
                else if( this.CURRENT_TOOL == "RECT" ||
                    this.CURRENT_TOOL == "CIRCLE" || this.CURRENT_TOOL == "LINE"){
                    // create a temp canvas
                    this.temp_canvas = document.createElement("canvas");
                    this.temp_canvas.width = this.canvas.width;
                    this.temp_canvas.height = this.canvas.height;
                    var canvas_context = this.temp_canvas.getContext('2d');
                    canvas_context.drawImage(this.canvas,0,0);
                }
                // fill tool
                else if( this.CURRENT_TOOL == "FILL" ){

                }
            },
            user_mouseup:function(event){
                if( this.mousedown ){
                    if( this.CURRENT_TOOL == "TEXT" ){

                        this.canvas_ctx.save();

                        var text = this.$('#textinput').val();
                        var maxWidth = this.$('#textinput').width();

                        this.$('#CanvasInput').remove();

                        var words = text.split(' ');
                        var line = '';

                        var lineHeight = 25;
                        var x = this.mouse_down_x;
                        var y = this.mouse_down_y;

                        this.canvas_ctx.font = _.str.sprintf("%spt %s",this.$('#textInput').val(),this.$('#textType').val());
                        this.canvas_ctx.fillStyle = this.$('#currentColor').css('background-color');

                        for(var n = 0; n < words.length; n++) {
                            var testLine = line + words[n] + ' ';
                            var metrics = this.canvas_ctx.measureText(testLine);
                            var testWidth = metrics.width;
                            if(testWidth > maxWidth) {
                                this.canvas_ctx.fillText(line, x, y);
                                line = words[n] + ' ';
                                y += lineHeight;
                            }
                            else {
                                line = testLine;
                            }
                        }

                        this.canvas_ctx.fillText(line, x, y);
                        this.canvas_ctx.restore();
                    }
                    else {
                        this.user_mousemove(event, true);
                    }

                    if( this.temp_canvas) delete this.temp_canvas;
                    delete this.mouse_down_x; delete this.mouse_down_y;
                    this.mousedown = false;
                }
            },
            user_mousemove:function(event,final){
                if( this.mousedown ){

                    //clear canvas if exist
                    if( this.temp_canvas ){
                        this.canvas_ctx = this.canvas.getContext('2d');
                        this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.canvas_ctx.drawImage(this.temp_canvas, 0,0);
                    }

                    //circle tool
                    if( this.CURRENT_TOOL == "CIRCLE"){
                        var radius = parseInt(Math.sqrt(Math.pow(event.offsetX - this.mouse_down_x, 2) +
                            Math.pow(event.offsetY - this.mouse_down_y, 2) ));

                        this.canvas_ctx.beginPath();
                        this.canvas_ctx.arc(this.mouse_down_x, this.mouse_down_y, radius, 0, 2 * Math.PI, false);
                        this.canvas_ctx.closePath();
                        this.canvas_ctx.stroke();
                    }
                    //rect tool
                    else if( this.CURRENT_TOOL == "RECT" ){
                        var x = Math.min(event.offsetX,  this.mouse_down_x),
                            y = Math.min(event.offsetY,  this.mouse_down_y),
                            w = Math.abs(event.offsetX - this.mouse_down_x),
                            h = Math.abs(event.offsetY - this.mouse_down_y);

                        if (!w || !h) return;

                        this.canvas_ctx.strokeRect(x, y, w, h);
                    }
                    //pencil tool
                    else if( this.CURRENT_TOOL == "DRAW" ){
                        this.canvas_ctx.lineTo(event.offsetX, event.offsetY);
                        this.canvas_ctx.stroke();
                    }
                    //line tool
                    else if( this.CURRENT_TOOL == "LINE" ){
                        this.canvas_ctx.moveTo(this.mouse_down_x, this.mouse_down_y);
                        this.canvas_ctx.lineTo(event.offsetX,event.offsetY);
                        this.canvas_ctx.stroke();
                    }
                    //eraser tool
                    else if( this.CURRENT_TOOL == "ERASER" ){
                        var x = this.mouse_down_x  - 10;
                        var y = this.mouse_down_y - 10;

                        this.mouse_down_x = event.offsetX; this.mouse_down_y = event.offsetY;
                    }
                }
            },
            save_template:function(event){

            },
            apply_template:function(event){

            }
        });
        return Paint;
    });