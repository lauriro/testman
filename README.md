
[nodei-img]: https://nodei.co/npm/testman.png
[nodei-url]: https://nodei.co/npm/testman/
[travis-img]: https://secure.travis-ci.org/lauriro/testman.png
[travis-url]: https://travis-ci.org/lauriro/testman
[cover-img]: https://coveralls.io/repos/lauriro/testman/badge.png
[cover-url]: https://coveralls.io/r/lauriro/testman



Testman
=======

[![NPM][nodei-img]][nodei-url]
[![Build Status][travis-img]][travis-url] 
[![Coverage Status][cover-img]][cover-url]


Expiremental testing helper.

### Usage

```javascript
require("testman").


describe ( "My first module" ).
	it ( "should pass dummy-tests" ).
		equal("a", "a", "a and a should be same").
		ok(true, "true is ok").
		ok(1, "one is ok").
		ok("s", "string is ok").
done()
```

### Licence

Copyright (c) 2013 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt)


