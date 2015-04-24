// util for logging.js, available as logging.util
// https://github.com/hit9/logging.js

var util = require('util');

// Util to format a string.
//
//   format(1, 2, 3)  // '1 2 3'
//   format('%s %d', 'val', 123)  // 'val 123'
//   format('%(key)s', {key: 'val'})  // 'val'
//   format('%%s', 'val')  // '%%s'
//   format('%%(key)s', {key: 'val'})  // '%%(key)s'
//
var formatRegExp = /%%?(\(\w+\))?[sdj]/g;
exports.format = function(fmt) {
  var args = arguments;

  if (typeof fmt !== 'string')
    return util.format.apply(null, args);

  var _isKeyValFmt = false;
  var _isOriginFmt = false;

  var _idx = 0;

  return fmt.replace(formatRegExp, function(match, idx) {
    if (typeof idx === 'undefined' && !_isKeyValFmt) {
      _isOriginFmt = true;
      return util.format(match, args[_idx += 1]);
    }

    if (typeof idx === 'string' && !_isOriginFmt) {
      _isKeyValFmt = true;

      if (match.slice(0, 2) === '%%' || args.length === 1)
        return match;
      return util.format('%' + match.slice(-1),
                         args[1][idx.slice(1, -1)]);
    }

    throw new Error('bad format');
  });
};

// Format date object.
exports.formatDate = function(date, fmt) {
  fmt = fmt || '%s-%s-%s %s-%s-%s,%s';
  return exports.format(
    fmt,
    date.getFullYear(),
    ('00' + (date.getMonth() + 1)).slice(-2),
    ('00' + date.getDate()).slice(-2),
    ('00' + date.getHours()).slice(-2),
    ('00' + date.getMinutes()).slice(-2),
    ('00' + date.getSeconds()).slice(-2),
    ('000' + date.getMilliseconds()).slice(-3));
};
