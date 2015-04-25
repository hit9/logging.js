// Stream based logging module for nodejs/iojs.
// MIT. (c) Chao Wang <hit9@icloud.com>

var util = require('./util');

// Global registry. {name: logger}
var registry = {};

// Levels, {name: level}.
var levels = {
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
//   getLogger('foo') => Logger(name='foo')  // father
//   getLogger('foo.bar') => Logger(name='foo.bar')  // child
//
function getLogger(name) {
  if (!(name in registry)) {
    // create a logger
    var logger = new Logger(name);

    // try to find a father logger to propagate from
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
  this.levelName  = levelNames[this.level];
  this.levelname  = this.levelName.toLowerCase();
  this.pid        = process.pid;
  this.created    = new Date();
  this.asctime    = util.formatDate(this.created);
  this.message    = util.format.apply(null, [this.fmt]
                                      .concat(this.args));
}

// Format a record with a formartter.
LogRecord.prototype.format = function(formatter) {
  if (typeof formatter === 'string')
    return util.format(formatter, this) + '\n';

  if (typeof formatter === 'function')
    return formatter(this) + '\n';

  throw new TypeError('formatter should be a string or function')
};


// Logger constructor
//
//   name         logger name (string)
//   propagate    if this logger can be a `father` (default: true)
//   rules        logger rules (object {name: rule})
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

// Propagate from a father logger.
Logger.prototype.propagateFrom = function(father) {
  for (var name in father.rules) {
    this.addRule(father.rules[name]);
  }
  return this;
};

// Add a rule to this logger.
//
//   rule.name       rule name (required)
//   rule.level      level to emit stream writing. (default: INFO)
//   rule.stream     a writable stream to logging to (required).
//   rule.formatter  a string formatter or a function.
//
Logger.prototype.addRule = function(rule) {
  if (!('name' in rule))
    throw new Error('rule.name required');

  if (!(rule.stream && rule.stream.writable))
      throw new Error('invalid stream');

  return this.rules[rule.name] = {
    name: rule.name,
    level: rule.level || levels.INFO,
    stream: rule.stream,
    formatter: rule.formatter || _formatter
  };
};

Logger.prototype.removeRule = function(name) {
  return delete this.rules[name];
};

Logger.prototype.debug = function() {
  return this.log(levels.DEBUG, arguments);
};

Logger.prototype.info = function() {
  return this.log(levels.INFO, arguments);
};

Logger.prototype.warn = function() {
  return this.log(levels.WARN, arguments);
};
Logger.prototype.warning = Logger.prototype.warn;

Logger.prototype.error = function() {
  return this.log(levels.ERROR, arguments);
};

Logger.prototype.critical = function() {
  return this.log(levels.CRITICAL, arguments);
};

// Logging formatter with args on `level`.
//
//   logger.log('say %(word)', {word: 'hi'})
//
Logger.prototype.log = function(level, args) {
  var record = new LogRecord({
    name: this.name,
    level: level,
    fmt: args[0],
    args: [].slice.apply(args, [1])
  });

  for (var name in this.rules) {
    var rule = this.rules[name]

    if (level >= rule.level)
      rule.stream.write(record.format(rule.formatter));
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
