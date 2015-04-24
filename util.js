// util for logging.js, available as logging.util
// https://github.com/hit9/logging.js

var util = require('util');

// Format string, e.g.
//
//   format('{0}', ['val'])  // 'val'
//   format('{key}', {key: 'val'}) // 'val'
//   format('{}', ['val']) // 'val'
//
var formatRegExp = /{([^}]*)}/g;
function format(fmt, args) {
  var automaticIdx = -1;
  return fmt.replace(formatRegExp, function(match, key) {
    if (key === '' && !util.isArray(args))
      throw new TypeError('array required for automatic field numbering.');

    if (key !== '' && automaticIdx !== -1)
      throw new Error('cannot use automatic field numbering '+
                      'and manual field specification togerther');
    if (key === '')
      key = automaticIdx += 1;

    return typeof args[key] != 'undefined'? args[key] : match;
  });
}

// Format a datetime, default fmt:
// '{y}-{m}-{d} {h}-{m}-{s},{ms}'
//
function formatDate(date, fmt) {
  fmt = fmt || '{y}-{m}-{d} {h}-{m}-{s},{ms}';
  return format(fmt, {
    y  : date.getFullYear(),
    m  : date.getMonth() + 1,
    d  : date.getDate(),
    h  : date.getHours(),
    m  : date.getMinutes(),
    s  : date.getSeconds(),
    ms :date.getMilliseconds(),
  });
}

// exports
exports.format     = format;
exports.formatDate = formatDate;
