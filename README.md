Logging.js
----------

Stream based logging module for nodejs/iojs.

```js
var logging = require('logging.js');
var log = logging.get('name');
log.rule({stream: process.stdout, level: logging.INFO});
log.info('logging from a magic world.')
```

License
-------

MIT.
