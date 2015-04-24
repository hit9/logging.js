Logging.js
----------

Stream based logging module for nodejs/iojs.

Installation
------------

```js
npm install logging.js
```

Examples
--------

```js
var logging = require('./index'),
  log = logging.get('mylogger');

log.addRule({name: 'stdout', stream: process.stdout});
log.info('logging from the magic world')

// => 2015-04-25 01-32-07,821 info myname[4900]: logging from the magic world
```

Logging Levels
--------------

There are 5 levels available as:

```js
logging.DEBUG
logging.INFO
logging.WARN  // alias `logging.WARNING`
logging.ERROR
logging.CRITICAL
```

API Refs
--------

### logging.get(name)

Get a logger from global registry, if the logger dose not exist, create one and return it.

```js
var log = logging.get('mylogger');
```

### log.addRule(rule)

A logging rule is an object like:

```js
{
  name: 'stdout',          // a rule has a name, required
  stream: process.stdout,  // a writable stream, required
  level: logging.INFO,     // logging level, default: logging.INFO
  formatter: '...',        // formatter, string or function (optional)
}
```

### log methods

```js
log.debug(fmt, ...)
log.info(fmt, ...)
log.warn(fmt, ...)  // alias log.warning(fmt, ...)
log.error(fmt, ...)
log.critical(fmt, ...)
```

Formatter
----------

A formatter can be a string or function like `function(fmt) {..}`.

For string case, an example:

```js
'%(asctime)s %(levelname)s %(name)s[%(pid)s]: %(message)s'
```

And all available named keys can be found in the source around `function LogRecord`.

Logging Formatting
-------------------

Logging enables 2 handy string formatting types:

```js
log.info('%s=%d', 'val', 1)       // 'val=1'
log.info('%(key)s=%(val)d', {key: 'val'})   // 'key=val'
```

License
-------

MIT. (c) Chao Wang <hit9@icloud.com>
