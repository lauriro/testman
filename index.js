


/*
* @version    0.2.1
* @date       2015-06-05
* @stability  2 - Unstable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
*/



!function(exports) {
	var doneTick, started
	, assert_num = 1
	, tests = []
	, toString = Object.prototype.toString
	, bold  = '\u001b[1m'
	, red   = '\u001b[31m'
	, green = '\u001b[32m'
	, reset = '\u001b[0m'
	, proc = typeof process == "undefined" ? { argv: [] } : process
	, Fn = exports.Fn || require("./lib/functional-lite.js").Fn
	, assert = require("assert")
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
		return new TestSuite(name)
	}

	function TestSuite(name) {
		var testSuite = this

		if (!started) started = +new Date()

		testSuite.name  = name || "{Unnamed test suite}"
		testSuite.cases = []

		print("# " + testSuite.name)
		tests.push(testSuite)

		if (just_one && tests.length != just_one) {
			print("# skip " + just_one + " " + tests.length)
			testSuite.it = testSuite.ok = testSuite.equal = testSuite.notEqual = testSuite.throws = testSuite.type = testSuite.run = This
		}
		return testSuite
	}



	TestSuite.prototype = {
		_test: This,
		describe: describe,
		},
		it: function(name, options) {
			var testSuite = this
			, testCase = new TestCase(name, options, assert_num)

			clearTimeout(doneTick)

			doneTick = setTimeout(function() {
				testSuite.done()
			}, 50)

			testCase.testSuite = testSuite
			testCase.num = assert_num++

			testSuite.cases.push( testCase )
			return testCase
		},
		test: function(name, next, options) {
			var testCase = this.it(name, options)
			next(testCase)
			return testCase
		},
		done: function() {
			var i, j, test, assert
			, count = 0
			, failed = 0
			, passed_asserts = 0
			, failed_asserts = 0
			, ended = +new Date()

			if (this.done_) return
			this.done_ = ended

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
			if (proc.exit) proc.exit()
		}
	}

	function TestCase(name, options, num) {
		var testCase = this
		testCase.name = name || "{anonymous testCase}"
		testCase.options = options || {}
		testCase.hooks = []
		testCase.failed = []
		testCase.passed = []

		if (just_two && num != just_two) testCase.options.skip = "by argv"
		if (testCase.options.skip) {
			testCase.ok = testCase.equal = testCase.type = testCase.run = This
		}
		return testCase
	}

	TestCase.prototype = describe.it = describe.assert = {
		wait: Fn.hold,
		it: function(name, options) {
			this.end()
			return this.testSuite.it(name, options)
		},
		test: function(name, next) {
			this.end()
			return this.testSuite.test(name, next)
		},
		done: function() {
			this.end()
			return this.testSuite.done()
		},
		describe: function(name) {
			this.end()
			return new TestSuite(name)
		},
		end: function() {
			var testCase = this
			, fail = testCase.failed.length
			, fail_log = ""
			, name = testCase.num + " - it " + testCase.name

			if (testCase.ended) return

			testCase.ended = new Date()

			if (testCase.options.skip) {
				return print("ok " + name + " # skip - " + testCase.options.skip)
			}

			if (fail) {
				fail_log = "\n---\n" + this.failed.join("\n") + "\n---"
			}

			print((fail ? "not ok " : "ok ") + name +
				" [" + (this.passed.length) + "/" + (this.passed.length+fail) + "]" + fail_log
			)
		},
		run: function(fn) {
			fn.call(this)
			return this
		},
		anyOf: function(a, b, options) {
			return this.ok( Array.isArray(b) && b.indexOf(a) != -1, options || "should be one of '" + b + "', got " + a )
		},
		type: function(thing, expected, options) {
			var t = type(thing)
			return this.ok( t === expected, options || "type should be " + expected + ", got " + t )
		}
	}

	function makeTry(name) {
		TestCase.prototype[name] = function(actual, expected, message) {
			var testCase = this
			, prefix = " #" + (testCase.passed.length + testCase.failed.length+1)
			try {
				assert[name](actual, expected, message)
				testCase.passed.push(message + prefix)
			} catch(e) {
				testCase.failed.push(e.stack)
			}
			return testCase
		}
		exports[name] = assert[name]
		TestCase.prototype["_" + name] = This
	}

	;["fail", "ok", "equal", "notEqual", "deepEqual", "notDeepEqual", "strictEqual"
	, "notStrictEqual", "throws", "doesNotThrow", "ifError"].map(makeTry)

	exports.describe = describe.describe = describe

	var testPoint
	exports.test = function(name, next) {
		if (!testPoint) testPoint = new TestSuite()
		return testPoint = testPoint.test(name, next)
	}

}(this)


/*
* http://sourceforge.net/projects/portableapps/files/
*/

