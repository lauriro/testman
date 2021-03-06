var undef
, testman = require("../")


testman
.describe ( "Empty description" )

// testSuite without name
.describe ()
// testCase without name
.test(null, function(assert) {
	assert.equal(assert.name, "{unnamed test case}")
	assert.equal(assert.suite.name, "{unnamed test suite}")
})

.describe ( "Description without asserts" )
.it ( "should work without asserts" )

.describe ( "test() syntax" )
.test( "test syntax with plan and assert.end()", function(assert) {
	assert.plan(1)
	assert.ok(true)
	assert.end()
} )
.it ( "test it" )
.test( "test syntax with plan and without assert.end()", function(assert) {
	assert.plan(1)
	assert.ok(true)
} )
.test( "test syntax without plan and with assert.end()", function(assert) {
	assert.ok(true)
	assert.end()
} )

.test( "test syntax without plan and assert.end()", function(assert) {
	assert.ok(true)
} )

.describe ( "Testman" )
.it ( "should pass an OK tests" )
.ok(true, "true is ok")
.ok(1, "one is ok")
.ok("s", "string is ok")
.ok(function() {
	return true
})
.notOk(false)
.notOk(null)
.notOk()
.notOk(function() {
	return false
})

.test ( "it should pass an equal tests", function(assert) {
	var undef
	, date1 = new Date(1234567890123)
	, date2 = new Date(1234567890123)
	, obj1 = {a:"A"}
	, obj2 = {a:"A"}

	obj1.circ = obj1
	obj2.circ = obj2

	assert.equal(null, null)
	assert.equal(undef, undef)
	assert.equal(null, undef)
	assert.equal(0, 0)
	assert.equal(1, 1)
	assert.equal("", "")
	assert.equal("a", "a")
	assert.equal(date1, date2)
	assert.equal({a: "A", b: "b"}, {a: "A", b: "b"})
	assert.equal([1, "2", 3], [1, "2", 3])
	assert.equal(obj1, obj2)
})

.test ( "it should pass an notEqual tests", function(assert) {
	var undef
	date1 = new Date(1234567890123)
	date2 = new Date(1234567890000)
	obj1 = {a:"A"}
	obj2 = {a:"B"}
	obj3 = {b:"A"}
	circ1 = {a:"A"}
	circ2 = {a:"A", circ: obj1}

	circ1.circ = circ1

	assert.notEqual("", null)
	assert.notEqual("", undef)
	assert.notEqual("", 0)
	assert.notEqual("", 1)
	assert.notEqual("", "a")
	assert.notEqual("", [])
	assert.notEqual("", date1)
	assert.notEqual("", obj1)

	assert.notEqual(0, null)
	assert.notEqual(0, undef)
	assert.notEqual(0, 1)
	assert.notEqual(0, "a")
	assert.notEqual(0, [])
	assert.notEqual(0, date1)
	assert.notEqual(0, obj1)

	assert.notEqual(obj1, null)
	assert.notEqual(obj1, undef)
	assert.notEqual(obj1, 1)
	assert.notEqual(obj1, "a")
	assert.notEqual(obj1, [])
	assert.notEqual(obj1, date1)
	assert.notEqual(obj1, obj2)
	assert.notEqual(obj1, obj3)
	assert.notEqual(obj2, obj3)

	assert.notEqual(date1, null)
	assert.notEqual(date1, undef)
	assert.notEqual(date1, 1)
	assert.notEqual(date1, "a")
	assert.notEqual(date1, [])
	assert.notEqual(date1, date2)

	assert.notEqual([1], [2])
	assert.notEqual([1], [1, 2])

	assert.notEqual(circ1, circ2)
})

.test ( "it should pass an strictEqual tests", function(assert) {
	var undef

	assert.strictEqual(null, null)
	assert.strictEqual(undef, undef)
	assert.strictEqual(0, 0)
	assert.strictEqual(1, 1)
	assert.strictEqual("", "")
	assert.strictEqual("a", "a")
})

.test ( "it should pass an notStrictEqual tests", function(assert) {
	var undef
	date1 = new Date(1234567890123)
	date2 = new Date(1234567890123)
	obj1 = {a:"A"}
	obj2 = {a:"A"}

	assert.notStrictEqual(null, undef)
	assert.notStrictEqual(date1, date2)
	assert.notStrictEqual([1, "2", 3], [1, "2", 3])
	assert.notStrictEqual(obj1, obj2)
})

.it ( "should pass an anyOf tests" )
.anyOf("a", ["a", "b"])
.anyOf("a", ["b", "a"])

.it ( "should pass a type tests" )
.type( 1,           "number", "typeof 1 should be a number")
.type( Number(1),   "number" )
.type( Number("1"), "number" )
.type( NaN,         "nan" )
.type( "1",         "string" )
.type( String("1"), "string" )
.type( String(1),   "string" )
.type( [],       "array" )
.type( {},       "object" )
.type( require,  "function" )
.type( /\w/,     "regexp" )
.type( undef,    "undefined" )
.type( null,     "null" )
.type( true,     "boolean" )
.type( false,    "boolean" )
.type( new Date, "date",   "typeof new Date() should be a date")
.it ( "should throw" )
.throws(function() {
	throw "E"
})
.it ( "should run functions" )
.run(function(){

})
.it ( "should skip tests", { skip: "manual" } )
.ok(false)

.it ( "should test V8 Optimization" )
.isOptimized(testman.describe)

.describe ( "Async Testman" )
.it ( "should wait" )
.run(function(){
	this._ts = +new Date()
	setTimeout(this.wait(), 62)
})
.ok(function(){
	var ts = +new Date()
	, diff = ts - this._ts
	console.log("# ts:"+ts+" diff:"+diff+" _ts:"+this._ts)
	return diff > 30
})

.describe ( "Testman with timers" )
.done()



