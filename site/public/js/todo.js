function pd(func) 
{
    return function(event) 
    {
        event.preventDefault()
        func && func(event)
    }
}

var speechItem = "";

function getHTTPRequest(theUrl) {
    console.log("getting database results");
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function isNumber(n) 
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}


_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g,
    escape : /\{\{-(.+?)\}\}/g,
    evaluate : /\{\{=(.+?)\}\}/g
};

var browser = 
{
    android : /Android/.test(navigator.userAgent)
}

browser.iphone = !browser.android

var app = {
    model : {},
    view : {},
    router : {}
}

var bb = {
    model : {},
    view : {},
    router : {}
}

bb.init = function() {

    var scrollContent = {
        scroll : function() {
            var self = this
            setTimeout(function() {
                if (self.scroller) {
                    self.scroller.refresh()
                } else {
                    self.scroller = new iScroll($("div[data-role='content']")[0])
                }
            }, 1)
        }
    }

    
    bb.model.State = Backbone.Model.extend(_.extend({
        defaults : {
            items : 'loading .....'
        },
    }))


    // Model Design 


    bb.model.Item = Backbone.Model.extend(_.extend({
        defaults : {
            id : '',
            text : '',
            created : new Date().getTime(),
            location : "",
            complete : false
        },

        initialize : function() {
            var self = this
            _.bindAll(self)
        }
    }))


    //Collection


    bb.model.Items = Backbone.Collection.extend(_.extend({
        model : bb.model.Item,
        url : '/api/rest/todo',

        initialize : function() {
            var self = this
            _.bindAll(self)
            self.count = 0

            self.on('change', function() {
                self.count = self.length
            })
        },
        
        start : function() {
            $("#updateItem").slideUp()
            app.view.head.render()
        },
        itemAddition : function() {
            console.log("inside item addition");
            var self = this
            var time = new Date()
            var mm = time.getMonth() 
            var dd = time.getDate()
            var yy = time.getFullYear()
            var date = mm + "-" + dd + "-" + yy

            var item = new bb.model.Item({
                id : self.count + 1,
                text : speechItem,
                created : date,
                location : "",
                complete : false
            })
          
            
            console.log("SpeechItem "+speechItem);
            getHTTPRequest("/api/rest/create/" + speechItem + "/" + date + "/" + "waterford" + "/" + "false")
            speechItem = "";
            self.add(item)
            self.count++
            item.save()
            
            app.model.items.fetch({
                success : function() {
                    app.model.state.set({
                        items : 'loaded'
                    })
                    app.view.list.render()
                    console.log("loaded ..")
                }
            })
        },
        print : function() {
            var self = this
            self.each(function(item) {
                logargs(item.toJSON())
            })
        }
    }))

    
    //view


    bb.view.Head = Backbone.View.extend(_.extend({
        events : {
            'click #add' : function() {
                var self = this
                recognizeSpeech();
            },
            'click #close' : function() {
                var self = this;
                self.items.start()
            }
        },

        initialize : function(items) {
            var self = this
            _.bindAll(self)
            self.items = items

            self.setElement("div[data-role='header']")

            self.elem = {
                add : self.$el.find('#add'),
                title : self.$el.find('h1')
            }

            self.tm = {
                title : _.template(self.elem.title.html())
            }

            self.elem.add.hide()

            app.model.state.on('change:items', self.render)
            self.items.on('add', self.render)
            self.items.on('remove', self.render)
        },
        render : function() {
            console.log("rendering head")
            var self = this
            //$("#close").hide()
            var loaded = 'loaded' == app.model.state.get('items')

            self.elem.title.html(self.tm.title({
                title : loaded ? self.items.length + ' Items' : 'Loading...'
            }))

            if (loaded) {
                self.elem.add.show()
            }
        }
    }))

    //view Listing

    bb.view.List = Backbone.View.extend(_.extend({

        events : {
            'tap #delete' : function(e) {
                var self = this;
                self.itemDelete(e.target.name)
                $("#options" + e.target.name).hide()
            },
            
            'swiperight' : function(e) {
                var self = this;
                self.itemComplete(e.target.id)
                
            },

            'tap #edit' : function(e) {
                var self = this
                self.itemUpdate(e.target.name)
                $("#options" + e.target.name).hide()
            },

            'tap' : function(e) {
                var self = e.target;
                $("#options" + e.target.id).show()
                var id = e.target.id

            },

            'tap #toggle' : function(e) {
                $("#options" + e.target.name).hide()
            }
        },

        initialize : function(items) {
            var self = this
            _.bindAll(self)

            self.setElement('#list')

            self.tm = {
                item : _.template(self.$el.html())
            }

            self.items = items
            self.items.on('add', self.itemAppend)

        },

        render : function() {
            var self = this

            self.$el.empty()

            self.items.each(function(item) {
                
                self.itemAppend(item)
            })
        },

        itemAppend : function(item) {
            var self = this
            var html = self.tm.item(item.toJSON())
            self.$el.append(html)
            if(item.get("complete")=="true")
                    {
                        console.log("inside complete check");
                        $("#"+item.get("id")).css('text-decoration', 'line-through')
                    }
            self.scroll()
        },

        itemDelete : function(id) {
            var self = this
            getHTTPRequest("/api/rest/del/" + id)

            app.model.items.fetch({
                success : function() {
                    app.model.state.set({
                        items : 'loaded'
                    })
                    app.view.list.render()
                    app.view.head.render()
                    console.log("loaded")
                }
            })
        },
        
        itemComplete : function(id){
            console.log("Inside swipe item id: "+id);
            var self = this
            var item = self.items.get(id);
            item.set("complete", true);
            $("#"+id).css('text-decoration','line-through')
            getHTTPRequest("/api/rest/complete/" + id + "/" + "true")
            //self.render()
        },

        itemUpdate : function(id) {
            var self = this
            var item = self.items.get(id)
            $("#uitemName").val(item.get("text"))
            $("#updateItem").slideDown()
            $("#close").show()
            $("#add").hide()
            $("#uitem").click(function() {
                item.set("text", $("#uitemName").val())
                getHTTPRequest("/api/rest/update/" + id + "/" + $("#uitemName").val())
                self.render()
                $("#updateItem").slideUp()
                //$("#close").hide()
                $("#add").show()
                app.view.head.render()
            })
        }
    }, scrollContent))

    //view the item
    bb.view.Item = Backbone.View.extend(_.extend({

        initialize : function() {
            var self = this
            _.bindAll(self)
            self.render()
        },

        render : function() {
            var self = this
            var html = self.tm.item(self.model.toJSON())
            self.$el.append(html)
        }
    }, {
        tm : {
            item : _.template($('#list').html())
        }
    }))

}

app.init_browser = function() {
    if (browser.android) {
        $("#header").css({
            bottom : 0
        })
    }
}

app.init = function() {
    console.log('start init')

    bb.init()

    app.init_browser()

    app.model.state = new bb.model.State()
    app.model.items = new bb.model.Items()

    app.view.head = new bb.view.Head(app.model.items)

    app.view.head.render()
    app.view.list = new bb.view.List(app.model.items)
    app.view.list.render()

    app.model.items.fetch({
        success : function() {
            app.model.state.set({
                items : 'loaded'
            })
            app.view.list.render()
            console.log("loaded")
        }
    })

    console.log('end init')
}
$(app.init)


//Speech recognition code

function onLoad(){
         
         document.addEventListener("deviceready", onDeviceReady, true);
    }
     
    function onDeviceReady()
    {
        console.log("Device is now ready");
        window.plugins.speechrecognizer.init(speechInitOk, speechInitFail);
    }

    function speechInitOk() {
        console.log("Ready to listen");
    }
    
    function speechInitFail(m) {
        alert(m);
    }

    function recognizeSpeech() {
        var requestCode = 1234;
        var maxMatches = 1;
        var promptString = "Please say a command";  // optional
        var language = "en-US";                     // optional
        window.plugins.speechrecognizer.startRecognize(speechOk, speechFail, requestCode, maxMatches, promptString, language);
    }

    function speechOk(result) {
        var respObj, requestCode, matches;
        if (result) {
            respObj = JSON.parse(result);
            if (respObj) {
                var matches = respObj.speechMatches.speechMatch;

                for (x in matches) {
                    speechItem = matches[x];
                    console.log(speechItem);
                    app.model.items.itemAddition();
                }
            }
        }
    }

    function speechFail(message) {
        console.log("speechFail: " + message);
    }