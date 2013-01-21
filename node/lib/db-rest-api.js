// API implementation

var common = require('./common')

var uuid    = common.uuid
var mongodb = common.mongodb


var todocoll = null

var util = {}

console.log("inside rest api")

util.validate = function( input ) {
  return input.text
}

util.fixid = function( doc ) {
  if( doc._id ) {
    doc.id = doc._id.toString()
    delete doc._id
  }
  else if( doc.id ) {
    doc._id = new mongodb.ObjectID(doc.id)
    delete doc.id
  }
  return doc
}


exports.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.sendjson$( output )
}


exports.echo = function( req, res ) {
  var output = req.query

  if( 'POST' == req.method ) {
    output = req.body
  }

  res.sendjson$( output )
}


exports.rest = {

  create: function( req, res ) {
    var text = req.params.text
    var created = req.params.created
    var location = req.params.location
    var complete = req.params.complete

    /*if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }*/

    var todo = {
      text: text,
      created: created,
      location: location,
      complete: complete
    }

    todocoll.insert(todo, res.err$(res,function( docs ){
      var output = util.fixid( docs[0] )
      res.sendjson$( output )
    }))
  },


  read: function( req, res ) {
    var input = req.params

    console.log(req.params)

    var query = util.fixid( {id:input.id} )
    todocoll.findOne( query, res.err$( function( doc ) {
      if( doc ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        res.send$(404,'not found')
      }
    }))
  },


  list: function( req, res ) {
    var input = req.query
    var output = []

    var query   = {}
    var options = {}//sort:[['id','(ascending)'],['created','(ascending)'],['text','(ascending)']]}
    
    //alert("I am in rest-api")
    //console.log("I am in rest")

    todocoll.find( query, options, res.err$( function( cursor ) {
      cursor.toArray( res.err$( function( docs ) {
        output = docs
        output.forEach(function(item){
          util.fixid(item)
        })
        res.sendjson$( output )
        console.log("outputting elements")
      }))
    }))
  },


  update: function( req, res ) {
    var id    = req.params.id
    var text = req.params.text
    console.log("input is: "+text)
    /*if( !util.validate(text) ) {
      return res.send$(400, 'invalid')
    }*/

    var query = util.fixid( {id:id} )
    todocoll.update( query, {$set:{text:text}}, res.err$( function( count ) {
      if( 0 < count ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        console.log('404')
        res.send$(404,'not found')
      }
    }))
  },

  complete: function( req, res ) {
    var id    = req.params.id
    var complete = req.params.complete
    console.log("input is: "+complete)
    /*if( !util.validate(text) ) {
      return res.send$(400, 'invalid')
    }*/

    var query = util.fixid( {id:id} )
    todocoll.update( query, {$set:{complete:complete}}, res.err$( function( count ) {
      if( 0 < count ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        console.log('404')
        res.send$(404,'not found')
      }
    }))
  },


  del: function( req, res ) {
    var input = req.params
	//alert("faraz")
    var query = util.fixid( {id:input.id} )
    todocoll.remove( query, res.err$( function() {
      var output = {}
      res.sendjson$( output )
    }))
  }

}



exports.connect = function(options,callback) {
  var client = new mongodb.Db( options.name, new mongodb.Server(options.server, options.port, {}))
  client.open( function( err, client ) {
    if( err ) return callback(err);

    client.collection( 'todo', function( err, collection ) {
      if( err ) return callback(err);
		console.log("connected to rest api")
      todocoll = collection
      callback()
    })
  })
}
