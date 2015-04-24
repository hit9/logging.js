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

```js
var logging = require('./index'),
  log = logging.get('mylogger');

log.addRule({name: 'stdout', stream: process.stdout});
log.info('logging from the magic world')

// => 2015-04-25 01-32-07,821 info myname[4900]: logging from the magic world
```

License
-------

MIT.
