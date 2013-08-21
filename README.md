
[1]: https://secure.travis-ci.org/lauriro/testman.png
[2]: https://travis-ci.org/lauriro/testman
[3]: https://coveralls.io/repos/lauriro/testman/badge.png
[4]: https://coveralls.io/r/lauriro/testman
[5]: https://nodei.co/npm/testman.png
[6]: https://nodei.co/npm/testman/
[7]: https://ci.testling.com/lauriro/testman.png
[8]: https://ci.testling.com/lauriro/testman




Testman &ndash; [![Build][1]][2] [![Coverage][3]][4]
=======

[![NPM][5]][6]

Expiremental testing helper 
that produces [TAP, the Test Anything Protocol](http://testanything.org/).

### Usage

```javascript
require("testman").

describe ( "My first module" ).
	it ( "should pass dummy-tests" ).
		equal ("a", "a", "a and a should be same").
		ok (true, "true is ok").
		type (1, "number").
done()
```

### Browser Support

[![browser support][7]][8]

### Licence

Copyright (c) 2013 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt)


