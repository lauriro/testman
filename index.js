


/*
* @version    0.3.0
* @date       2015-06-15
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
	, toString = Object.prototype.toString
	, bold  = '\u001b[1m'
	, red   = '\u001b[31m'
	, green = '\u001b[32m'
	, reset = '\u001b[0m'
	, proc = typeof process == "undefined" ? { argv: [] } : process
	, Fn = exports.Fn || require("./lib/functional-lite.js").Fn
	, color = proc.stdout && proc.stdout.isTTY && proc.argv.indexOf("--no-color") == -1


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

	function deepEqual(actual, expected) {
		if (actual === expected) return true

		var key, len
		, actualType = type(actual)

		if (actualType != type(expected)) return false

		if (actualType == "object") {
			var keysA = Object.keys(actual)
			, keysB = Object.keys(expected)
			len = keysA.length
			if (len != keysB.length || !deepEqual(keysA.sort(), keysB.sort())) return false
			for (; len--; ) {
				key = keysA[len]
				if (!deepEqual(actual[key], expected[key])) return false
			}
			return true
		}

		if (actualType == "array" || actualType == "arguments") {
			len = actual.length
			if (len != expected.length) return false
			for (; len--; ) {
				if (!deepEqual(actual[len], expected[len])) return false
			}
			return true
		}

		return "" + actual == "" + expected
	}

	function msg(actual, expected, message, operator) {
		return message || actual + operator + expected
	}


	function AssertionError(message, _stackStart) {
		this.name = "AssertionError"
		this.message = message
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, _stackStart || AssertionError)
		}
	}
	AssertionError.prototype = Object.create(Error.prototype)


	function describe(name) {
		return new TestSuite(name)
	}

	function TestSuite(name) {
		var testSuite = this

		if (!started) {
			started = +new Date()
			print("TAP version 13")
		}

		testSuite.name  = name || "{unnamed test suite}"
		testSuite.cases = []

		print("# " + testSuite.name)

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


			if (next) next(testCase)

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
		totalCases++
		testCase.name = totalCases + " - " + (name || "{unnamed test case}")
		testCase.options = options || {}
		testCase.failed = []
		testCase.passedAsserts = 0
		testCase.totalAsserts = 0

		testSuite.cases.push( testCase )

		if (testCase.options.skip) {
			testCase.ok = testCase.equal = testCase.type = testCase.run = This
		}

		;["describe", "it", "test", "done"].forEach(function(name) {
			testCase[name] = function() {
				testCase.end()
				return testSuite[name].apply(testSuite, arguments)
			}
		})

		clearTimeout(doneTick)
		doneTick = setTimeout(done, 50)

		function done() {
			if (testCase.ok == describe.it.ok) testSuite.done()
			else testCase.run(done)
		}

		return testCase
	}

	TestCase.prototype = describe.it = describe.assert = {
		wait: Fn.hold,
		ok: function(value, message) {
			var testCase = this
			, prefix = " #" + (testCase.passedAsserts + testCase.failed.length+1)
			totalAsserts++
			testCase.totalAsserts++
			try {
				if (typeof value == "function") value = value.call(testCase)
				if (!value) throw new AssertionError(message)
				passedAsserts++
				testCase.passedAsserts++
			} catch(e) {
				testCase.failed.push(message + prefix + "\n" + e.stack)
			}
			return testCase
		},
		equal: function(actual, expected, message) {
			return this.ok(actual == expected, msg(actual, expected, message, "=="))
		},
		notEqual: function(actual, expected, message) {
			return this.ok(actual != expected, msg(actual, expected, message, "!="))
		},
		strictEqual: function(actual, expected, message) {
			return this.ok(actual === expected, msg(actual, expected, message, "==="))
		},
		notStrictEqual: function(actual, expected, message) {
			return this.ok(actual !== expected, msg(actual, expected, message, "!=="))
		},
		deepEqual: function(actual, expected, message) {
			return this.ok(deepEqual(actual, expected), msg(actual, expected, message, "deepEqual"))
		},
		notDeepEqual: function(actual, expected, message) {
			return this.ok(!deepEqual(actual, expected), msg(actual, expected, message, "notDeepEqual"))
		},
		throws: function(fn, message) {
			var actual = false
			, expected = true
			try {
				fn()
			} catch(e) {
				actual = true
			}
			return this.ok(actual, msg(actual, expected, message, "throws"))
		},
		plan: function(num) {
			this.planned = num
			return this
		},
		end: function() {
			var testCase = this

			if (testCase.ended) return

			testCase.ended = new Date()

			if (testCase.options.skip) {
				return print("ok " + testCase.name + " # skip - " + testCase.options.skip)
			}

			if (testCase.planned != void 0) {
				testCase.equal(testCase.planned, testCase.totalAsserts, null, "planned")
			}

			testCase.name += " [" + testCase.passedAsserts + "/" + testCase.totalAsserts + "]"

			if (testCase.failed.length) {
				failedCases++
				print("not ok " + testCase.name + "\n---\n" + testCase.failed.join("\n") + "\n---")
			} else {
				print("ok " + testCase.name)
			}
		},
		run: function(fn) {
			fn.call(this)
			return this
		},
		anyOf: function(a, b) {
			return this.ok( Array.isArray(b) && b.indexOf(a) != -1, "should be one of '" + b + "', got " + a )
		},
		type: function(thing, expected) {
			var t = type(thing)
			return this.ok( t === expected, "type should be " + expected + ", got " + t )
		}
	}

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

