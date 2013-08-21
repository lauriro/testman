


/*
* @version  0.0.5
* @author   Lauri Rooden - https://github.com/lauriro/testman
* @license  MIT License  - http://lauri.rooden.ee/mit-license.txt
*/





!function(root) {
	var tests = []
	, toString = Object.prototype.toString
	, bold  = '\u001b[1m'
	, red   = '\u001b[31m'
	, green = '\u001b[32m'
	, reset = '\u001b[0m'
	
	, codes = {
		bold: 1,
		underline: 4,
		reverse: 7,
		black: 30,
		red: 31,
		green: 32,
		yellow: 33,
		blue: 34,
		magenta: 35,
		cyan: 36,
		white: 37
	}

	function This() {
		return this
	}


	function type(obj) {
		var t = typeof obj

		if (obj === null) return "null"
		if (t == "undefined" || t == "string") return t
		/*
		* Standard clearly states that NaN is a number
		* but it is not useful for testing.
		*/
		if (t == "number") return isNaN(obj) ? "nan" : t

		return toString.call(obj).toLowerCase().slice(8, -1)
		//return toString.call(obj).toLowerCase().match(/\w+(?=])/)[0]
	}

	function describe(name) {
		var t = this
		if (!(t instanceof describe)) return new describe(name)

		t.name  = name || "{anonymous test}"
		t.it    = function(name, options){
			return t._it(name, options)
		}
		t.done  = function(){
			return t._done()
		}
		t.cases = []

		tests.push(t)
		return t
	}

	var assert_num = 1

	describe.prototype = {
		describe: function(name) {
			return new describe(name)
		},
		_it: function(name, options) {
			var t = this
			, assert = new it(name, options)

			assert.it = t.it
			assert.done = t.done
			assert.num = assert_num++
			t.cases.push( assert )
			return assert
		},
		_done: function() {
			var i, j, test, assert
			, count = 0
			, failed = 0

			console.log("TAP version 13")

			for (i = 0; test = tests[i++]; ) {
				console.log(""+test)
				for (j = 0; assert = test.cases[j++]; ) {
					console.log(""+assert)
					failed += assert.failed.length
				}
				count += test.cases.length
			}
			console.log("1.." + count)
			console.log("#" + (failed ? "" : green + bold) + " pass  " + (count - failed) + reset)
			failed && console.log("#" + red + bold + " fail  " + failed + reset)
			/*
			* FAILED tests 1, 3, 6
			* Failed 3/6 tests, 50.00% okay
			*/
		},
		toString: function() {
			return "# " + this.name
		}
	}

	function it(name, options){
		var t = this
		if (!(t instanceof it)) return new it(name, options)
		t.name = name || "{anonymous assert}"
		t.options = options || {}
		t.hooks = []
		t.failed = []
		t.passed = []

		if (t.options.skip) t.ok = t.equal = t.type = This
		return t
	}

	it.prototype = {
		describe: describe,
		ok: function(value, options) {
			var t = this
			options = options || {}

			if (typeof options == "string") options = { message: options }

			if (typeof value == "function") value = value.call(t)
			t[ value ? "passed" : "failed" ].push(options.message)
			return t
		},
		equal: function(a, b, options) {
			return this.ok( a === b, options )
		},
		type: function(thing, expected, options) {
			var t = type(thing)
			return this.ok( t === expected, options || "type should be " + expected + ", got " + t )
		},
		toString: function() {
			var t = this
			, fail = t.failed.length
			, fail_log = ""
			, name = t.num + " - it " + t.name

			if (t.options.skip) {
				return "ok " + name + " # skip - " + t.options.skip
			}

			if (fail) {
				fail_log = "\n  ---\n    messages:\n      - " + this.failed.join("\n      - ") + "\n  ---"
			}

			return (fail ? "not ok " : "ok ") + name + 
						" [" + (this.passed.length) + "/" + (this.passed.length+fail) + "]" + fail_log
			
		}
	}
	module.exports = describe.describe = describe

}(this)



