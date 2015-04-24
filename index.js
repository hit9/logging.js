// Stream based logging library for nodejs/iojs.
// https://github.com/hit9/logging.js
// MIT. (c) Chao Wang <hit9@icloud.com>

var util       = require('./util');
// global registry. {name: logger}
var registry   = {};
// level. {name: level}
var levels     = {
  DEBUG   : 10,
  INFO    : 20,
  WARN    : 30,
  WARNING : 30,
  ERROR   : 40,
  CRITICAL: 50,
};
// levelNames. {level: name}
var levelNames = {
  10: 'DEBUG',
  20: 'INFO',
  30: 'WARN',
  40: 'ERROR',
  50: 'CRITICAL'
};

// get a logger
function getLogger(name) {
  if (!(name in registry))
      registry[name] = new Logger(name);
  return registry[name];
}

// LogRecord constructor.
//
//    name       logger name
//    level      record level (number)
//    levelName  record level (string)
//    fmt        record formatter string
//    args       record arguments
//    message    record message (fmt % args)
//    pid        process id
//    created    the datetime when this record created
//    asctime    human readable time string, e.g. '2003-07-08 16:49:45,896'
//
function LogRecord(args) {
  this.name       = args.name;
  this.fmt        = args.fmt;
  this.args       = args.args;
  this.level      = args.level;
  this.message    = util.format(this.fmt, this.args);
  this.levelName  = levelNames[this.level];
  this.pid        = process.pid;
  this.created    = new Date();
  this.asctime    = util.formatDate(this.created);
}

LogRecord.defaultFmt = '{asctime} {name}[{pid}]: {message}';

LogRecord.prototype.format = function(fmt) {
  if (typeof fmt === 'function')
    return fmt(this);

  if (typeof fmt === 'undefined')
    fmt = LogRecord.defaultFmt;

  if (typeof fmt === 'string')
    return util.format(fmt, this);

  throw TypeError('fmt should be a string or function');
};

// Logger constructor
function Logger(name) {
  if (typeof name !== 'string')
    throw new TypeError('string required')
  this.name  = name;
  this.level = levels.INFO;  // default
  this.rules = {};    // {name: handler}
}

Logger.prototype.setRule = function(name, stream, fmt) {
  return this.rules[name] = {stream: stream, fmt: fmt};
};

Logger.prototype.setLevel = function(level) {
  if (typeof level !== 'number')
    throw new TypeError('number required');

  if (isFinite(level))
    level = levelNames.DEBUG;

  return this.level = level;
};

Logger.prototype.debug = function(fmt, args) {
  return this._log(levels.DEBUG, fmt, args);
};

Logger.prototype.info = function(fmt, args) {
  return this._log(levels.INFO, fmt, args);
};

Logger.prototype.warn = function(fmt, args) {
  return this._log(levels.WARN, fmt, args);
};
Logger.prototype.warning = Logger.prototype.warn;

Logger.prototype.error = function(fmt, args) {
  return this._log(levels.ERROR, arguments);
};

Logger.prototype.critical = function(fmt, args) {
  return this._log(levels.CRITICAL, fmt, args);
};

Logger.prototype._log = function(level, fmt, args) {
  var record = new LogRecord({
    name : this.name,
    level: level,
    fmt  : fmt,
    args : args});

  for (var name in this.rules) {
    var rule = this.rules[name]
    if (level >= this.level) {
      rule.stream.write(record.format(rule.fmt));
      rule.stream.write('\n');
    }
  }
};

// exports
exports.DEBUG        = levels.DEBUG;
exports.INFO         = levels.INFO;
exports.WARN         = levels.WARN;
exports.WARNING      = levels.WARNING;
exports.ERROR        = levels.ERROR;
exports.CRITICAL     = levels.CRITICAL;
exports.getLogger    = getLogger;
exports.util         = util;
