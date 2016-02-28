var undef;


require("../").


describe ( "Empty description" ).

describe ( "Description without asserts" ).
it ( "should work without asserts" ).

describe ( "test() syntax" ).
test( "test syntax 1", function(assert) {
	assert.ok(true)
	assert.end()
} ).
it ( "test it" ).
test( "test syntax 2", function(assert) {
	assert.plan(1)
	assert.ok(true)
	assert.end()
} ).
test( "test syntax 3", function(assert) {
	assert.ok(true)
	assert.end()
} ).

describe ( "Testman" ).
	it ( "should pass an OK tests" ).
		ok(true, "true is ok").
		ok(1, "one is ok").
		ok("s", "string is ok").
		ok(function(){
			return true
		}).
	test ( "it should pass an equal tests", function(assert) {
		var undef
		, date1 = new Date(1234567890123)
		, date2 = new Date(1234567890123)
		, obj1 = {a:"A"}
		, obj2 = {a:"A"}

		obj1.circ = obj1
		obj2.circ = obj2

		assert.equal("a", "a", "a and a should be same")
		assert.equal(1, 1, "1 and 1 should be same")
		assert.deepEqual(null, null)
		assert.deepEqual(undef, undef)
		assert.deepEqual(null, undef)
		assert.deepEqual(0, 0)
		assert.deepEqual(1, 1)
		assert.deepEqual("", "")
		assert.deepEqual("a", "a")
		assert.deepEqual(date1, date2)
		assert.deepEqual({a: "A", b: "b"}, {a: "A", b: "b"})
		assert.deepEqual([1, "2", 3], [1, "2", 3])
		assert.deepEqual(obj1, obj2)
	}).

	it ( "should pass an notEqual tests" ).
		notEqual("a", "b", "a and b should not be same").
		notEqual(1, 2, "1 and 2 should not be same").

	it ( "should pass an anyOf tests" ).
		anyOf("a", ["a", "b"]).
		anyOf("a", ["b", "a"]).

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
			setTimeout(this.wait(), 62)
		}).
		ok(function(){
			var ts = +new Date()
			, diff = ts - this._ts
			console.log("# ts:"+ts+" diff:"+diff+" _ts:"+this._ts)
			return diff > 30
		}).

describe ( "Testman with timers" ).
done()



