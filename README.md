Logging.js
----------

Stream based logging module for nodejs/iojs.

Installation
------------

```js
npm install logging.js
```

Example
-------

Just get an logger from registry, add rules to it, then di logging:

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
log.info('%s=%d', 'val', 1) // 'val=1'
log.info('%(key1)s=%(key2)d', {key1: 'abc', key2: 123}) // 'abc=123'
```

File Stream Example
--------------------

We can add multiple rules (or say streams) to a logger, here is
an example for file stream:

```js
var fs = require('fs');
var log = logging.get('myapp');

log.addRule({name: 'file', stream: 
  fs.createWriteStream('myapp.log', {flags: 'a'})});

log.info('logging from the maginc world');
```

License
-------

MIT. (c) Chao Wang <hit9@icloud.com>
