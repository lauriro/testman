

!function(root) {
	var tests = []
	, toString = Object.prototype.toString

	function type(obj) {
		return toString.call(obj).toLowerCase().slice(8, -1)
		//return toString.call(obj).toLowerCase().match(/\w+(?=])/)[0]
	}

	function describe(name) {
		var t = this
		if (!(t instanceof describe)) return new describe(name)

		t.name  = name
		t.it    = function(name){
			return t._it(name)
		}
		t.done  = function(){
			return t._done()
		}
		t.cases = []

		tests.push(t)
		return t
	}

	describe.prototype = {
		describe: function(name) {
			return new describe(name)
		},
		_it: function(name) {
			var t = this
			, assert = new it(name)

			assert.it = t.it
			assert.done = t.done
			t.cases.push( assert )
			return assert
		},
		_done: function() {
			var i, j, test, assert
			, count = 0
			, failed = 0

			console.log("TAP version 13")

			for (i = 0; test = tests[i++]; ) {
				console.log("# " + (test.name || "{anonymous test}") )
				for (j = 0; assert = test.cases[j++]; ) {
					failed += assert.result(count + j)
				}
				count += test.cases.length
			}
			console.log("1.." + count)
			console.log("# pass  " + (count - failed))
			failed && console.log("# fail  " + failed)
		}
	}

	function it(name, pending){
		var t = this
		if (!(t instanceof it)) return new it(name, pending)
		t.name = name
		t.hooks = []
		t.failed = []
		t.passed = []
		return t
	}

	it.prototype = {
		describe: describe,
		ok: function(value, msg) {
			this[ value ? "passed" : "failed" ].push(msg)
			return this
		},
		equal: function(a, b, msg) {
			return this.ok( a === b, msg )
		},
		type: function(thing, expected, msg) {
			return this.ok( type(thing) === expected, msg || "type should be " + expected )
		},
		result: function(num) {
			var fail = this.failed.length
			console.log( (fail ? "not ok " : "ok ") + num + 
						" - it " + this.name + 
						" [" + (this.passed.length) + "/" + (this.passed.length+fail) + "]")
			
			if (fail) {
				console.log("  ---\n    messages:\n      - " + this.failed.join("\n      - ") + "\n  ---")
			}

			return fail
		}
	}
	module.exports = describe.describe = describe

}(this)



