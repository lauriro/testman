

!function(root) {
	var tests = []

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
			var err
			, count = 0
			, failed = 0

			for (var test, i = 0; test = tests[i++]; ) {
				count += test.cases.length
			}

			console.log("TAP version 13")
			console.log("1.." + count)

			for (var test, assert, j, i = 0; test = tests[i++]; ) {
				console.log("#\n# " + (test.name || "{anonymous test}") + "\n#")
				for (j = 0; assert = test.cases[j++]; ) {
					failed += assert.result(i + j - 1)
				}
			}
			console.log("# tests " + count)
			console.log("# pass  " + (count - failed))
			console.log("# fail  " + failed)
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
			this[ a === b ? "passed" : "failed" ].push(msg)
			return this
		},
		result: function(num) {
			var fail = !!this.failed.length
			console.log( (fail ? "not " : "") + "ok " + num + 
						" - it " + this.name + 
						" [" + (this.passed.length) + "/" + (this.passed.length+this.failed.length) + "]")
			
			if (this.failed.length) {
				console.log("  ---\n    messages:\n      - " + this.failed.join("\n      - ") + "\n  ---")
			}

			return this.failed.length
		}
	}
	module.exports = describe.describe = describe

}(this)



