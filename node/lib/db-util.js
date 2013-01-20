var mongodb = require('mongodb')


exports.connect = function(options,callback) {
  options.name   = options.name   || 'todo'
  options.server = options.server || '127.0.0.1'
  options.port   = options.port   || 27017

  var server = new mongodb.Server(options.server, options.port, {auto_reconnect:true})
  var database = new mongodb.Db( options.name, server )
  database.open( function( err, client ) {
    if( err ) return callback(err);
    callback(null,client)
  })
}
