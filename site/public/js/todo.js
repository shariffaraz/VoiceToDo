function pd(func) {
	return function(event) {
		event.preventDefault()
		func && func(event)
	}
}


function httpGet(theUrl) {
	var xmlHttp = null;

	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

//document.ontouchmove = pd()

_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g,
	escape : /\{\{-(.+?)\}\}/g,
	evaluate : /\{\{=(.+?)\}\}/g
};

var browser = {
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
					self.scroller = new iScroll($("section[id='todoapp']")[0])
				}
			}, 1)
		}
	}


	// Items Model
	bb.model.Item = Backbone.Model.extend(_.extend({
		defaults : {
			id : '',
			text : '',
			completed: false
		},

		initialize : function() {
			var self = this
			_.bindAll(self)
		}
	}))

	//Items Collection
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
		
		additem : function() {
			var self = this
			
			var item = new bb.model.Item({
				id : self.count + 1,
				text : $("new-todo").val(),
				completed : false
			})
			httpGet("/api/rest/create/" + $("#new-todo").val() + "/" + completed)
			$("#itemName").val("")
			
			self.add(item)
			self.count++
			item.save()
			
			app.model.items.fetch({
				success : function() {
					app.model.state.set({
						items : 'loaded'
					})
					app.view.list.render()
					console.log("loaded")
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

	
	//footer view
	bb.view.Footer = Backbone.View.extend(_.extend({
		events : {
			
		},

		initialize : function(items) {
			var self = this
			_.bindAll(self)
			self.items = items

			self.setElement("div[id='info']")

			self.elem = {
				title : self.$el.find('h1')
			}

			self.tm = {
				title : _.template(self.elem.title.html())
			}

			//self.elem.add.hide()

			app.model.state.on('change:items', self.render)
			self.items.on('add', self.render)
			self.items.on('remove', self.render)
		},
		
		render : function() {
			console.log("rendering head")
			var self = this
			var loaded = 'loaded' == app.model.state.get('items')

			self.elem.title.html(self.tm.title({
				title : loaded ? self.items.length + ' Items' : 'Loading...'
			}))

			if (loaded) {
			}
		}
	}))

	//List view
	bb.view.List = Backbone.View.extend(_.extend({
												 
		initialize : function(items) {
			var self = this
			//_.bindAll(self)

			self.setElement('#list')

			self.tm = {
				//item : _.template(self.$el.html())
			}

			self.items = items
			self.items.on('add', self.appenditem)

		},

		render : function() {
			var self = this

			self.$el.empty()

			self.items.each(function(item) {
				self.appenditem(item)
			})
		},

		appenditem : function(item) {
			var self = this
			var html = self.tm.item(item.toJSON())
			//alert(html)
			self.$el.append(html)
			self.scroll()
		},

		removeitem : function(id) {
			//alert(id)
			var self = this
			httpGet("/api/rest/del/" + id)

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

		changeitem : function(id) {
			var self = this
			var item = self.items.get(id)
			$("#uitemName").val(item.get("text"))

			$("#uitem").click(function() {
				item.set("text", $("#uitemName").val())
				httpGet("/api/rest/update/" + id + "/" + $("#uitemName").val())
				self.render()
				$("#updateItem").slideUp()

				app.view.head.render()
			})
		}
	}, scrollContent))

	//item view
	bb.view.Item = Backbone.View.extend(_.extend({

		initialize : function() {
			var self = this
			//_.bindAll(self)
			self.render()
		},

		render : function() {
			var self = this
			var html = self.tm.item(self.model.toJSON())
			self.$el.append(html)
		}
	}, {
		tm : {
			//item : _.template($('#list').html())
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

	//app.router.item = new bb.router.Item()
	app.model.state = new bb.model.State()
	app.model.items = new bb.model.Items()
	//app.model.credentials = new bb.model.Credentials()

	//app.router.items = new bb.router.Item()
	app.view.head = new bb.view.Footer(app.model.items)

	app.view.head.render()
	app.view.list = new bb.view.List(app.model.items)
	app.view.addItem = new bb.view.AddItem(app.model.items)
	app.view.list.render()

	app.model.items.fetch({
		success : function() {
			app.model.state.set({
				items : 'loaded'
			})
			//if(localStorage.getItem("loggedin") == null)
			app.view.list.render()
			console.log("loaded")
		}
	})

	console.log('end init')
}
$(app.init)