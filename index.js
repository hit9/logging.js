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
// default formartter
var _formatter = '%(asctime)s %(levelname)s %(name)s[%(pid)d]: %(message)s';

// LogRecord constructor.
//
//    name       logger name
//    level      record level (number)
//    levelName  record level (string)
//    levelname  record level (string, lowercase)
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
  this.levelname  = this.levelName.toLowerCase();
  this.pid        = process.pid;
  this.created    = new Date();
  this.asctime    = util.formatDate(this.created);
}

LogRecord.prototype.format = function(formatter) {
  if (typeof formatter === 'string')
    return util.format(formatter, this);
  if (typeof formatter === 'function')
    return formatter(this);
  throw new TypeError('formatter should be a string or function')
};



// Logger constructor
function Logger(name) {
  if (typeof name !== 'string')
    throw new TypeError('string required')
  this.name  = name;
  this.rules = {};
}

Logger.prototype.addRule = function(rule) {
  if (!('name' in rule))
    throw new Error('rule.name required');

  var stream = rule.stream;
  var formatter = rule.formatter || _formatter;
  var level = rule.level || levels.DEBUG;

  if (!(stream && stream.writable))
      throw new Error('invalid stream');

  return this.rules[rule.name] = {stream: stream,
    formatter: formatter, level: level};
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
    if (level >= rule.level) {
      rule.stream.write(record.format(rule.formatter));
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
exports.get          = function(name) {
  if (!(name in registry))
    registry[name] = new Logger(name);
  return registry[name];
};
