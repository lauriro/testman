


/*
* @version    0.5.0
* @date       2016-07-14
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
	, v8 = {
		statusTexts: [
			"Unknown",
			"Function is optimized",
			"Function is not optimized",
			"Function is always optimized",
			"Function is never optimized",
			"Function is maybe deoptimized",
			"Function is optimized by TurboFan"
		]
	}

	try {
		["GetOptimizationStatus", "OptimizeFunctionOnNextCall"].map(function(name) {
			v8[name] = Function("fn", "return %" + name+ "(fn)")
		})
		v8.isNative = true
	} catch(e) {}

	if (!color) {
		bold = red = green = reset = ""
	}

	describe.result = ""

	function print(str) {
		describe.result += str + "\n"
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

	function deepEqual(actual, expected, circArr) {
		if (actual === expected) return true

		// null == undefined
		if (actual == null && actual == expected) return true

		var key, keysA, keysB, len
		, actualType = type(actual)

		if (
			actualType != type(expected) ||
			actual.constructor !== expected.constructor ||
			(actualType == "date" && +actual !== +expected) ||
			typeof actual != "object"
		) {
			return false
		}

		if (!circArr) {
			circArr = []
		}


		key = circArr.indexOf(actual)
		if (key > -1) return circArr[key + 1] === expected
		circArr.push(actual, expected)

		keysA = Object.keys(actual)
		len = keysA.length
		if (actualType == "array" || actualType == "arguments") {
			if (actual.length !== expected.length) return false
		} else {
			keysB = Object.keys(expected)
			if (len != keysB.length || !deepEqual(keysA.sort(), keysB.sort(), circArr)) return false
		}
		for (; len--; ) {
			key = keysA[len]
			if (!deepEqual(actual[key], expected[key], circArr)) return false
		}
		return true
	}

	function AssertionError(message, _stackStart) {
		this.name = "AssertionError"
		this.message = message
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, _stackStart || AssertionError)
		} else {
			this.stack = this.toString() + "\n" + (new Error()).stack
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
		done: function(next) {
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

			if (typeof next == "function") next()
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
		, opts = testCase.options = options || {}
		testCase.num = ++totalCases
		testCase.name = name || "{unnamed test case}"
		testCase.suite = testSuite
		testCase.failed = []
		testCase.passedAsserts = 0
		testCase.totalAsserts = 0

		testSuite.cases.push( testCase )

		if (
			opts.skip ||
			(opts.skip = opts.v8Native && !v8.isNative && "No access to v8 natives") ) {
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

	function stringify(item, tmp) {
		if (item && typeof item == "object") {
			if (item.constructor == Object) {
				tmp = Object.keys(item).slice(0, 5).map(function(key) {
					return key + ":" + stringify(item[key])
				})
				return "{" + (item.length > 5 ? tmp + ",..." : tmp) + "}"
			}
			if (Array.isArray(item)) {
				tmp = item.slice(0, 5).map(stringify)
				return "[" + (item.length > 5 ? tmp + ",..." : tmp) + "]"
			}
			if (item instanceof Date) {
				return item.toJSON()
			}
			return toString.call(item).slice(8, -1) + "(" + item.toString() + ")"
		}
		return JSON.stringify(item)
	}

	TestCase.prototype = describe.it = describe.assert = {
		wait: Fn.hold,
		ok: function ok(value, message, _stackStart) {
			var testCase = this
			totalAsserts++
			testCase.totalAsserts++
			try {
				if (typeof value == "function") {
					value = value.call(testCase)
				}
				if (!value) {
					if (!message) {
						message = "Should be truthy: " + stringify(value)
					} else if (Array.isArray(message)) {
						message = stringify(message[0]) + " " + message[1] + " " + stringify(message[2])
					}
					message = message + " #" + (testCase.passedAsserts + testCase.failed.length + 1)
					throw new AssertionError(message, _stackStart || ok)
				}
				passedAsserts++
				testCase.passedAsserts++
			} catch(e) {
				testCase.failed.push(testCase.options.noStack ? e.message : e.stack)
			}
			return testCase
		},
		notOk: function notOk(value, message) {
			var testCase = this
			if (typeof value == "function") {
				value = value.call(testCase)
			}
			return this.ok(
				!value,
				message || "Should be falsy: " + stringify(value),
				notOk
			)
		},
		equal: function equal(actual, expected, message) {
			return this.ok(
				deepEqual(actual, expected),
				message || [actual, "==", expected],
				equal
			)
		},
		notEqual: function notEqual(actual, expected, message) {
			return this.ok(
				!deepEqual(actual, expected),
				message || [actual, "!=", expected],
				notEqual
			)
		},
		strictEqual: function strictEqual(actual, expected, message) {
			return this.ok(
				actual === expected,
				message || [actual, "===", expected],
				strictEqual
			)
		},
		notStrictEqual: function notStrictEqual(actual, expected, message) {
			return this.ok(
				actual !== expected,
				message || [actual, "!==", expected],
				notStrictEqual
			)
		},
		isOptimized: function isOptimized(fn, args, scope) {
			if (!v8.isNative) {
				this.options.skip = "No access to v8 natives"
				return this
			}
			fn.apply(scope, args)
			v8.OptimizeFunctionOnNextCall(fn)
			fn.apply(scope, args)
			var status = v8.GetOptimizationStatus(fn)
			, name = fn.name || "(fn)"
			return this.ok(
				status == 1,
				name + ": " + v8.statusTexts[status],
				isOptimized
			)
		},
		throws: function throws(fn, message) {
			var actual = false
			, expected = true
			try {
				fn()
			} catch(e) {
				actual = true
			}
			return this.ok(actual, message || "throws", throws)
		},
		plan: function(num) {
			this.planned = num
			return this
		},
		end: function() {
			var testCase = this
			, name = testCase.num + " - " + testCase.name

			if (testCase.ended) return

			testCase.ended = new Date()

			if (testCase.options.skip) {
				return print("ok " + name + " # skip - " + testCase.options.skip)
			}

			if (testCase.planned != void 0) {
				testCase.equal(testCase.planned, testCase.totalAsserts, null, "planned")
			}

			name += " [" + testCase.passedAsserts + "/" + testCase.totalAsserts + "]"

			if (testCase.failed.length) {
				failedCases++
				print("not ok " + name + "\n---\n" + testCase.failed.join("\n") + "\n---")
			} else {
				print("ok " + name)
			}
		},
		run: function(fn) {
			fn.call(this)
			return this
		},
		anyOf: function anyOf(a, b) {
			return this.ok(
				Array.isArray(b) && b.indexOf(a) != -1,
				"should be one of '" + b + "', got " + a,
				anyOf
			)
		},
		type: function assertType(thing, expected) {
			var t = type(thing)
			return this.ok(
				t === expected,
				"type should be " + expected + ", got " + t,
				assertType
			)
		}
	}

	TestCase.prototype.deepEqual = TestCase.prototype.equal
	TestCase.prototype.notDeepEqual = TestCase.prototype.notEqual

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

