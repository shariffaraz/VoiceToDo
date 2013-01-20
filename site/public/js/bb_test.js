// JavaScript Document

Person = Backbone.Model.extend({
	data : [
			{text:'Google', href:'http://www.google.com'},
			{text:'Facebook', href:'http://www.facebook.com'}
			]
});

var person = new Person();

view = Backbone.View.extend({
	initialize : function(){
			this.template = $('template').children();
	},
	events : {
		"click button": "render"
	},
	el : $('#container'),
	model : person,
	render : function(){
		var data = this.model.get('data');
		
		for(var i=0; i=data.length; i++){
			var li = this.template.clone().find('a').attr('href', data[i].href).text(data[i].text).end();
			this.$el.find('ul').append(li);
		}
	}
});