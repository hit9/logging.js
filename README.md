Logging.js
----------

Stream based logging module for nodejs/iojs.

```js
var logging = require('./index'),
  log = logging.get('myname');

log.addRule({name: 'stdout', stream: process.stdout});
log.info('logging from the magic world')
```

License
-------

MIT.
