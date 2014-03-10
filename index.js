


/*
* @version    0.1.4
* @date       2014-03-10
* @stability  2 - Unstable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
*/



!function(root) {
	var undef
	, tests = []
	, toString = Object.prototype.toString
	, bold  = '\u001b[1m'
	, red   = '\u001b[31m'
	, green = '\u001b[32m'
	, reset = '\u001b[0m'
	
	function This() {
		return this
	}

	/*

	var tick = root.process && root.process.nextTick || setTimeout
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


	function Async(fn) {
		var t = this
		t.pending = 0
		t.cb = function() {
			tick(function(){--t.pending==0&&fn()}, 0)
		}
	}

	Async.prototype.wait = function(next) {
		var t = this
		t.pending++
		return next ? 
			function() {
				next.apply(this, arguments)
				t.cb()
			} :
			t.cb
	}
	*/

	function Lazy() {
		var t = this
		, hooks = []
		, hooked = []

		for (var a = arguments, i = a.length; i--; ) !function(k) {
			hooked.push([k, t.hasOwnProperty(k) && t[k]])
			t[k] = function(){hooks.push([k, arguments]);return t}
		}(a[i])

		t.resume = function() {
			delete t.resume

			for (var v, i = hooked.length;i--;) {
				if (hooked[i][1]) t[hooked[i][0]] = hooked[i][1]
				else delete t[hooked[i][0]]
			}
			// i == -1 from previous loop
			for (;v=hooks[++i];) t = t[v[0]].apply(t, v[1])
			t = hooks = hooked = null
		}
		return t
	}

	function type(obj) {
		if (obj === null) return "null"
		if (obj === undef) return "undefined"
		/*
		* Standard clearly states that NaN is a number
		* but it is not useful for testing.
		*/
		if (obj !== obj) return "nan"

		return toString.call(obj).slice(8, -1).toLowerCase()
	}

	console.log("TAP version 13")
	var started;

	var just_one = parseInt(process.argv[2]) || false
	var just_two = parseInt(process.argv[3]) || false

	function describe(name) {
		var t = this
		if (!(t instanceof describe)) return new describe(name)

		if (!started) started = +new Date()

		t.name  = name || "{anonymous test}"
		t.it    = function(name, options){
			return t._it(name, options)
		}
		t.done  = function(){
			setTimeout(function(){
				t._done()
			}, 1)
		}
		t.cases = []

		console.log("# "+t.name)
		tests.push(t)

		if (just_one && tests.length != just_one) {
			console.log("# skip ", just_one, tests.length)
			t.it = t.ok = t.equal = t.type = t.run = This
		}
		return t
	}

	var assert_num = 1

	describe.prototype = {
		describe: function(name) {
			return new describe(name)
		},
		_it: function(name, options) {
			var t = this
			, assert = new it(name, options, assert_num)

			assert.it = function(){
				assert.end()
				return t.it.apply(t, arguments)
			}
			assert.done = function(){
				assert.end()
				return t.done.apply(t, arguments)
			}
			assert.num = assert_num++
			t.cases.push( assert )
			return assert
		},
		_done: function() {
			var i, j, test, assert
			, count = 0
			, failed = 0
			, failed_asserts = 0
			, ended = +new Date()

			for (i = 0; test = tests[i++]; ) {
				for (j = 0; assert = test.cases[j++]; ) {
					if (assert.failed.length) failed++
					failed_asserts += assert.failed.length
				}
				count += test.cases.length
			}
			console.log("1.." + count)
			console.log("#" + (failed ? "" : green + bold) + " pass  " + (count - failed) + reset)
			console.log("# executed in " + (ended - started) + " ms")
			failed && console.log("#" + red + bold + " fail  " + failed + reset)
			/*
			* FAILED tests 1, 3, 6
			* Failed 3/6 tests, 50.00% okay
			* PASS 1 test executed in 0.023s, 1 passed, 0 failed, 0 dubious, 0 skipped.
			*/
		}
	}

	function it(name, options, num){
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

	it.prototype = {
		describe: function(){
			this.end()
			return describe.apply(this, arguments)
		},
		end: function(){
			console.log(""+this)
		},
		wait: function() {
			Lazy.call(this, "it", "wait", "run", "ok", "equal", "anyOf", "describe", "done")
			return this.resume
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
			if (typeof a == "function") a = a.call(this)
			if (typeof b == "function") b = b.call(this)
			return this.ok( a === b, options || "Expected: "+b+" Got: "+a )
		},
		anyOf: function(a, b, options) {
			return this.ok( Array.isArray(b) && b.indexOf(a) != -1, options || "should be one of '" + b + "', got " + a )
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


/*
* http://sourceforge.net/projects/portableapps/files/
*/

