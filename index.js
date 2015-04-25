// Stream based logging module for nodejs/iojs.
// MIT. (c) Chao Wang <hit9@icloud.com>

var util       = require('./util');

// Global registry. {name: logger}
var registry   = {};

// Levels, {name: level}.
var levels     = {
  DEBUG   : 10,
  INFO    : 20,
  WARN    : 30,
  WARNING : 30,
  ERROR   : 40,
  CRITICAL: 50,
};

// LevelNames, {level: name}.
var levelNames = {
  10: 'DEBUG',
  20: 'INFO',
  30: 'WARN',
  40: 'ERROR',
  50: 'CRITICAL'
};

// Get logger from global registry.
//
//   getLogger('foo') => Logger(name='foo')
//   getLogger('foo.bar') => Logger(name='foo.bar')
//
function getLogger(name) {
  if (!(name in registry)) {
    // create a logger
    var logger = new Logger(name);

    // find a father logger to propagate from
    var father;

    for (var _name in registry)
      if (name.indexOf(_name) === 0)
        if (!father || (father.propagate
                        && father.name.length < _name.length))
          father = registry[_name];

    if (father)
      logger.propagateFrom(father);

    registry[name] = logger;
  }
  return registry[name];
}

// Default formartter
var _formatter =
  '%(asctime)s %(levelname)s %(name)s[%(pid)d]: %(message)s';

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

  this.name      = name;
  this.propagate = true;
  this.rules     = {};
}

Logger.prototype.setPropagate = function(propagate) {
  this.propagate = !!propagate;
};

Logger.prototype.propagateFrom = function(father) {
  for (var name in father.rules) {
    this.addRule(father.rules[name]);
  }
  return this;
};

Logger.prototype.addRule = function(rule) {
  if (!('name' in rule))
    throw new Error('rule.name required');

  if (!(rule.stream && rule.stream.writable))
      throw new Error('invalid stream');

  return this.rules[rule.name] = {
    name     : rule.name,
    level    : rule.level || levels.INFO,
    stream   : rule.stream,
    formatter: rule.formatter || _formatter
  };
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
exports.get          = getLogger;
