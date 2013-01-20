var common = require('./common')
var api    = require('./db-rest-api')


var connect = common.connect

function init() {
  var server = connect.createServer()
  server.use( connect.logger() )
  server.use( connect.bodyParser() )
  server.use( connect.query() )

  server.use( function( req, res, next ) {
    res.sendjson$ = function( obj ) {
      common.sendjson( res, obj )
    }

    res.send$ = function( code, text ) {
      res.writeHead( code, ''+text )
      res.end()
    }

    res.err$ = function(win) {
      return function( err, output ) {
        if( err ) {
          console.log(err)
          res.send$(500, err)
        }
        else {
          win && win(output)
        }
      }
    }

    next()
  })
  
  console.log("connecting to DB")
api.connect(
    {
      name:   'todo',
      server: '127.0.0.1',
      port:   27017,
    },
    function(err){
      if( err ) return console.log(err);
      
      server.listen(8180)
    }
)
console.log("connected to DB")

  var router = connect.router( function( app ) {
  	app.get('api/ping', api.ping)
    app.get('/api/rest/create/:text/:created/:location',    api.rest.create)
    app.get('/api/rest/todo/:id', api.rest.read)
    app.get('/api/rest/todo',     api.rest.list)
    app.get('/api/rest/update/:id/:text', api.rest.update)
    app.get('/api/rest/del/:id', api.rest.del)
  })
  server.use(router)

  server.use( connect.static( __dirname + '/../../site/public') )
}


init()