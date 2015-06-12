


/*
* @version    0.2.1
* @date       2015-06-05
* @stability  2 - Unstable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
*/



!function(exports) {
	var doneTick, started
	, totalCases = 0
	, failedCases = 0
	, totalAsserts = 0
	, passedAsserts = 0
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
		it: function(name, options) {
			return this.test("it " + name, null, options)
		},
		test: function(name, next, options) {
			var testSuite = this
			, testCase = new TestCase(name, options, testSuite)

			clearTimeout(doneTick)

			if (next) next(testCase)

			doneTick = setTimeout(function() {
				testSuite.done()
			}, 50)

			return testCase
		},
		done: function() {
			if (this.done_) return
			this.done_ = +new Date()

			print("1.." + totalCases)
			print("#" + (failedCases ? "" : green + bold) + " pass  " + (totalCases - failedCases)
				+ "/" + totalCases
				+ " [" + passedAsserts + "/" + totalAsserts + "]"
				+ " in " + (this.done_ - started) + " ms"
				+ reset)

			failedCases && print("#" + red + bold + " fail  " + failedCases
				+ " [" + (totalAsserts - passedAsserts) + "]"
				+ reset)
			/*
			* FAILED tests 1, 3, 6
			* Failed 3/6 tests, 50.00% okay
			* PASS 1 test executed in 0.023s, 1 passed, 0 failed, 0 dubious, 0 skipped.
			*/
			if (proc.exit) proc.exit()
		}
	}

	function TestCase(name, options, testSuite) {
		var testCase = this
		testCase.name = name || "{anonymous testCase}"
		testCase.options = options || {}
		testCase.failed = []
		testCase.passed = []
		testCase.num = assert_num++

		testSuite.cases.push( testCase )

		if (just_two && testCase.num != just_two) testCase.options.skip = "by argv"
		if (testCase.options.skip) {
			testCase.ok = testCase.equal = testCase.type = testCase.run = This
		}

		;["describe", "it", "test", "done"].forEach(function(name) {
			testCase[name] = function() {
				testCase.end()
				return testSuite[name].apply(testSuite, arguments)
			}
		})
		totalCases++

		return testCase
	}

	TestCase.prototype = describe.it = describe.assert = {
		wait: Fn.hold,
		end: function() {
			var testCase = this
			, fail = testCase.failed.length
			, fail_log = ""
			, name = testCase.num + " - " + testCase.name

			if (testCase.ended) return

			testCase.ended = new Date()

			if (testCase.options.skip) {
				return print("ok " + name + " # skip - " + testCase.options.skip)
			}

			if (fail) {
				failedCases++
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
			totalAsserts++
			try {
				assert[name](actual, expected, message)
				testCase.passed.push(message + prefix)
				passedAsserts++
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
		if (!testPoint) testPoint = describe()
		return testPoint = testPoint.test(name, next)
	}

}(this)


/*
* http://sourceforge.net/projects/portableapps/files/
*/

