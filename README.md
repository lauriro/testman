
[1]: https://secure.travis-ci.org/lauriro/testman.png
[2]: https://travis-ci.org/lauriro/testman
[3]: https://coveralls.io/repos/lauriro/testman/badge.png
[4]: https://coveralls.io/r/lauriro/testman
[npm package]: https://npmjs.org/package/testman
[GitHub repo]: https://github.com/litejs/testman


    @version    0.2.1
    @date       2015-06-05
    @stability  2 - Unstable


Testman &ndash; [![Build][1]][2] [![Coverage][3]][4]
=======

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
        anyOf("a", ["a", "A"]).
done()
```



External links
--------------

-   [GitHub repo][]
-   [npm package][]


Licence
-------

Copyright (c) 2013 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt)


