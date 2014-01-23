var undef;


require("../").


describe ( "Empty description" ).

describe ( "Description without asserts" ).
	it ( "should work without asserts" ).

describe ( "Testman" ).
	it ( "should pass an OK tests" ).
		ok(true, "true is ok").
		ok(1, "one is ok").
		ok("s", "string is ok").
		ok(function(){
			return true
		}).
	it ( "should pass an equal tests" ).
		equal("a", "a", "a and a should be same").
		equal(1, 1, "1 and 1 should be same").
		equal(
			function(){return true},
			function(){return true},
			"function result should be same").

	it ( "should pass a type tests" ).
		type( 1,           "number", "typeof 1 should be a number").
		type( Number(1),   "number" ).
		type( Number("1"), "number" ).
		type( NaN,         "nan" ).
		type( "1",         "string" ).
		type( String("1"), "string" ).
		type( String(1),   "string" ).
		type( [],       "array" ).
		type( {},       "object" ).
		type( require,  "function" ).
		type( /\w/,     "regexp" ).
		type( undef,    "undefined" ).
		type( null,     "null" ).
		type( true,     "boolean" ).
		type( false,    "boolean" ).
		type( new Date, "date",   "typeof new Date() should be a date").
	it ( "should run functions" ).
		run(function(){
		
		}).
	it ( "should skip tests", { skip: "manual" } ).
		ok(false).

describe ( "Async Testman" ).
	it ( "should wait" ).
		run(function(){
			this._ts = +new Date()
			setTimeout(this.wait(), 50)
		}).
		ok(function(){
			return (+new Date() - this._ts) >= 50
		}).

describe ( "Testman with timers" ).
done()



