


/*
* @version    0.2.1
* @date       2015-06-05
* @stability  2 - Unstable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
*/



!function(exports) {
	var started
	, assert_num = 1
	, tests = []
	, toString = Object.prototype.toString
	, bold  = '\u001b[1m'
	, red   = '\u001b[31m'
	, green = '\u001b[32m'
	, reset = '\u001b[0m'
	, proc = typeof process == "undefined" ? { argv: [] } : process
	, Fn = exports.Fn || require("./lib/functional-lite.js").Fn
	, color = proc.stdout && proc.stdout.isTTY && proc.argv.indexOf("--no-color") == -1
	, just_one = parseInt(proc.argv[2]) || false
	, just_two = parseInt(proc.argv[3]) || false


	if (!color) {
		bold = red = green = reset = ""
	}

	function print(str) {
		console.log(str)
	}

	function This() {
		return this
	}

	function type(obj) {
		// Standard clearly states that NaN is a number
		// but it is not useful for testing.
		return (
			obj == null || obj != obj ? "" + obj : toString.call(obj).slice(8, -1)
		).toLowerCase()
	}

	print("TAP version 13")

	function describe(name) {
		var t = this
		if (!(t instanceof describe)) return new describe(name)

		if (!started) started = +new Date()

		t.name  = name || "{anonymous test}"
		t.cases = []

		print("# " + t.name)
		tests.push(t)

		if (just_one && tests.length != just_one) {
			print("# skip " + just_one + " " + tests.length)
			t.it = t.ok = t.equal = t.notEqual = t.throws = t.type = t.run = This
		}
		return t
	}


	describe.prototype = {
		describe: function(name) {
			return new describe(name)
		},
		it: function(name, options) {
			var t = this
			, assert = new it(name, options, assert_num)

			assert.group = t
			assert.num = assert_num++

			t.cases.push( assert )
			return assert
		},
		test: function(name, next, options) {
			var assert = this.it(name, options)
			next(assert)
			return assert
		},
		done: function() {
			var i, j, test, assert
			, count = 0
			, failed = 0
			, passed_asserts = 0
			, failed_asserts = 0
			, ended = +new Date()

			for (i = 0; test = tests[i++]; ) {
				for (j = 0; assert = test.cases[j++]; ) {
					if (assert.failed.length) failed++
					failed_asserts += assert.failed.length
					passed_asserts += assert.passed.length
				}
				count += test.cases.length
			}
			print("1.." + count)
			print("#" + (failed ? "" : green + bold) + " pass  " + (count - failed)
				+ "/" + count
				+ " [" + passed_asserts + "/" +(passed_asserts + failed_asserts)+ "]"
				+ " in " + (ended - started) + " ms"
				+ reset)

			failed && print("#" + red + bold + " fail  " + failed
				+ " [" +failed_asserts+ "]"
				+ reset)
			/*
			* FAILED tests 1, 3, 6
			* Failed 3/6 tests, 50.00% okay
			* PASS 1 test executed in 0.023s, 1 passed, 0 failed, 0 dubious, 0 skipped.
			*/
			if (typeof process != "undefined" && process.exit) process.exit()
		}
	}

	function it(name, options, num) {
		var t = this
		if (!(t instanceof it)) return new it(name, options)
		t.name = name || "{anonymous assert}"
		t.options = options || {}
		t.hooks = []
		t.failed = []
		t.passed = []

		if (just_two && num != just_two) t.options.skip = "by argv"
		if (t.options.skip) {
			t.ok = t.equal = t.type = t.run = This
		}
		return t
	}

	it.prototype = describe.asserts = {
		wait: Fn.hold,
		it: function(name, options) {
			this.end()
			return this.group.it(name, options)
		},
		test: function(name, next) {
			this.end()
			return this.group.test(name, next)
		},
		done: function() {
			this.end()
			return this.group.done()
		},
		describe: function() {
			this.end()
			return describe.apply(this, arguments)
		},
		end: function() {
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

			print((fail ? "not ok " : "ok ") + name +
				" [" + (this.passed.length) + "/" + (this.passed.length+fail) + "]" + fail_log
			)
		},
		run: function(fn) {
			fn.call(this)
			return this
		},
		ok: function(value, options) {
			var t = this
			options = options || {}

			if (typeof options == "string") options = { message: options }

			if (typeof value == "function") value = value.call(t)
			t[ value ? "passed" : "failed" ].push(options.message + " #" + (t.passed.length+t.failed.length+1))
			return t
		},
		equal: function(a, b, options) {
			return this.ok( a === b, options || "Expected: "+b+" Got: "+a )
		},
		notEqual: function(a, b, options) {
			return this.ok( a !== b, options || "Not expected: " + b)
		},
		deepEqual: function(actual, expected, opts) {
			actual = JSON.stringify(actual)
			expected = JSON.stringify(expected)
			return this.ok( actual === expected, opts || "Expected: "+expected+" Got: "+actual )
		},
		anyOf: function(a, b, options) {
			return this.ok( Array.isArray(b) && b.indexOf(a) != -1, options || "should be one of '" + b + "', got " + a )
		},
		throws: function(fn, options) {
			var result = false
			try {
				fn()
			} catch(e) {
				result = true
			}
			return this.ok(result, options || "should throw")
		},
		type: function(thing, expected, options) {
			var t = type(thing)
			return this.ok( t === expected, options || "type should be " + expected + ", got " + t )
		}
	}
	exports.describe = describe.describe = describe
	describe.it = it.prototype

}(this)


/*
* http://sourceforge.net/projects/portableapps/files/
*/

