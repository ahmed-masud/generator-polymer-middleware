var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var appServer = express();

// TODO: change this to make it into a streaming view
// view engine setup

<? if(viewEngine == "html") { -?>
appServer.engine('html', require('ehp').renderFile);
<? } else if(viewEngine == "ejs") { -?>
appServer.engine('html', require('ejs'));
<? } else if(viewEngine == "jade") { -?>
appServer.engine('jade', require('jade'));
<? } else { ?>
appServer.engine('html', require('ejs'));
<? } ?>

appServer.set('views', path.join(__dirname, 'app'));
appServer.set('view engine', '<?= viewEngine ?>');


// uncomment after placing your favicon in ./app/
//appServer.use(favicon(path.join(__dirname, 'app', 'favicon.ico')));
appServer.use(logger('dev'));
appServer.use(bodyParser.json());
appServer.use(bodyParser.urlencoded({ extended: false }));
appServer.use(cookieParser());
appServer.use(express.static(path.join(__dirname, 'app')));

appServer.use('/', routes);


// catch 404 and forward to error handler
appServer.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
<?
  if( viewEngine == "html") {
    errorRenderer = "err.status.toString()";
  } else {
    errorRenderer = "'error'"
  }
?>
// error handlers
// development error handler
// will print stacktrace
if (appServer.get('env') === 'development') {
  appServer.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render(<?= errorRenderer ?>, {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
appServer.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render(<?= errorRenderer ?>, {
    message: err.message,
    error: {}
  });
});


appServer.listen(<?= serverPort ?>);
module.exports = appServer;
