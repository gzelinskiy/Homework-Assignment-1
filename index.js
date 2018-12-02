var http = require("http");
var url = require("url");
var StringDecoder = require('string_decoder').StringDecoder;

var httpServer = http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  var queryStringObject = parsedUrl.query;

  var method = req.method.toLowerCase();

  var headers = req.headers;

  var decoder = new StringDecoder("utf-8");
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    chosenHandler(data, function(statusCode, payload) {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
});

httpServer.listen(3000, function() {
  console.log("The server is listening on port 3000");
});

var handlers = {};

handlers.hello = function(data, callback) {
  callback(200, {message: "Hello World!"});
};

handlers.notFound = function(data, callback) {
  callback(404);
};

var router = {
  'hello': handlers.hello
};
