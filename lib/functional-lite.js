


/*
 * @version    0.4.0
 * @date       2015-05-29
 * @stability  2 - Unstable
 * @author     Lauri Rooden <lauri@rooden.ee>
 * @license    MIT License
 */



!function(exports, Object) {
	var P = "prototype"
	, A = Array[P], F = Function[P], S = String[P]
	, hasOwn = Object.prototype.hasOwnProperty
	, slice = F.call.bind(A.slice)
	, fns = {}
	, fnRe = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|arguments|false|function|new|this|true|window|\.\w+|\w+:/g



	// Function extensions
	// -------------------


	F.construct = function(args, len) {
		// bind version have bad performance and memory consumption
		// return new(F.bind.apply(this, A.concat.apply([null], args)))
		len = args.length
		return len ?
		(fns[len] || (fns[len] = Fn("t a->new t(a[" + Object.keys(args).join("],a[") + "])")))(this, args) :
		new this
	}

	F.partial = function() {
		var self = this
		, a = slice(arguments)
		return function() {
			return self.apply(this, a.concat.apply(a, arguments))
		}
	}

	/*
	 * **argi** - index of argument, which will be split
	 * **re**   - optional RegExp for matching words
	 */

	F.byWords = function(argi, re) {
		var self = this
		return function() {
			var s = this
			, r = s
			, a = arguments
			;(a[argi |= 0]||"").replace(re || /\S+/g, function(w) {
				a[argi] = w
				r = self.apply(s, a)
			})
			return r
		}
	}

	F.byKeyVal = function() {
		var self = this
		return function(o) {
			var r
			, s = this
			, a = slice(arguments)
			if (typeof o == "object") for (r in o) {
				a[0] = r
				a[1] = o[r]
				r = self.apply(s, a)
			} else r = self.apply(s, a)
			return r
		}
	}

	// Run function once and return cached value or cached instance
	F.cache = function(instance, keyFn, cache) {
		var self = this
		, c = cache || {}
		, f = function() {
			var a = arguments
			, i = !!instance || this instanceof f
			, k = keyFn ? keyFn.apply(self, a) : i + ":" + a.length + ":" + slice(a)

			return k in c ? c[k] : (c[k] = i ? self.construct(a) : self.apply(this, a))
		}

		f.origin = self
		f.cached = c
		f.extend = function() {
			return self.extend.apply(self, arguments).cache(instance, keyFn, cache)
		}
		f[P] = self[P] // prototype for better access on extending 
		return f
	}

	F.extend = function() {
		var a
		, self = this
		, i = 0

		function f() {
			return self.apply(this, arguments)
		}

		for (f[P] = Object.create(self[P]); a = arguments[i++];) Object.merge(f[P], a)
		f[P].constructor = f
		return f
	}


	// Non-standard
	Object.each = function(obj, fn, scope, key) {
		if (obj) for (key in obj) hasOwn.call(obj, key) && fn.call(scope, obj[key], key, obj)
	}

	// Object.assign ( target, source ) in ECMAScript 6

	Object.merge = function(target, source) {
		for (var key, i = 1; source = arguments[i++];)
			for (key in source) if (hasOwn.call(source, key)) target[key] = source[key]
		return target
	}

	Object.values = function(obj) {
		return Object.keys(obj||{}).map(function(e) {
			return obj[e]
		})
	}

	/*
	if (!Array.from) Array.from = arrayFrom

	function arrayFrom(obj) {
		for (var arr = [], i = 0, len = obj.length; i < len; ) {
			arr[i] = obj[i++]
		}
		return arr
	}

	Array.prototype.flatten = function(){
		var arr = this, i = arr.length;
		while (i--) if (arr[i] instanceof Array)
			arr[i].unshift(i,1) && arr.splice.apply(arr,arr[i].flatten() )
		return arr
	}
	function argsToArray(){
		return Array.apply(null, arguments).flatten()
	}
	argsToArray([[1],3,[4,5]],2)

	Array.flatten = function(arr) {
	for(var i=arr.length;i--;)
	0 in arr[i] && A.splice.apply(arr, [i, 1].concat(Array.flatten(arr[i])))
	return arr
	}
	flat([1,2,[3,4,[5,6]],7])
	*/

	// Note: use for Object literals only,
	// as it returns false for custom objects,
	// like new Date or new YourObject.

	function isObject(obj) {
		return obj && obj.constructor === Object
	}

	function clone(source, temp, key) {
		if (isObject(source)) {
			temp = {}
			for (key in source) if (hasOwn.call(source, key))
				temp[key] = clone(source[key])
			source = temp
		}
		return source
	}
	Object.clone = clone

	Object.zip = function(keys, vals) {
		return keys.fold(function(_, key, i) {
			_[key] = vals[i]
			return _
		}, {})
	}

	// Non-standard
	// IE<9 bug: [1,2].splice(0).join("") == "" but should be "12"
	A.remove = arrayRemove
	function arrayRemove() {
		var arr = this
		, len = arr.length
		, o = slice(arguments)
		, lastId = -1

		for (;len--;) if (~o.indexOf(arr[len])) arr.splice(lastId = len, 1)
		return lastId
	}

	A.each = A.forEach
	A.fold = A.reduce
	A.foldr = A.reduceRight
	// uniq
	// first item preserved
	A.uniq = A.filter.partial(function(elem, i, arr) {
		return i == arr.indexOf(elem)
	})

	A.pushUniq = function(item) {
		return this.indexOf(item) == -1 ? this.push(item) : false
	}

	!function(n) {
		F[n] = S[n] = function() {
			var a = arguments, l = a[0]
			a[0] = this.fn()
			return A[n].apply(l, a)
		}
	}.byWords()("every filter each map fold foldr some")


	F.fn = function() {
		return this
	}

	S.fn = function(scope) {
		return Fn(this, scope)
	}

	Boolean.prototype.fn = function() {
		return this.valueOf() ? True : False
	}

	// THANKS: Oliver Steele http://www.osteele.com/sources/javascript/functional/
	function Fn(expr, scope) {
		for (var args = ["_"], body = expr, arr = expr.split("->"); arr.length > 1; ) {
			body = arr.pop()
			args = arr.pop().match(/\w+/g) || []
			if (arr.length) arr.push("(function(" + args + "){return(" + body + ")})")
		}
		// `replace` removes symbols that follow '.',
		//  precede ':', are 'this' or 'arguments'; and also the insides of
		//  strings (by a crude test).  `match` extracts the remaining
		//  symbols.
		return new Function(args, (scope && (expr = expr.replace(fnRe, "").match(/\b[a-z]\w*|\b_\w+/g)) ?
			(
				arrayRemove.apply(expr, args),
				expr[0] ? "var " + expr.uniq().join("='',") + "='';" : ""
			) + "with(" + scope + "||{})" : "")
			+ "return(" + body + ")"
		)
	}

	exports.Fn = Fn.cache()



	function wait(fn) {
		var pending = 1
		, lastArgs = []
		function resume() {
			var args = arguments
			if (args.length) lastArgs = args
			if (!--pending && fn) fn.apply(this, lastArgs)
		}
		resume.wait = function() {
			pending++
			return resume
		}
		return resume
	}
	exports.Fn.wait = wait



	function hold(ignore) {
		var k
		, obj = this
		, hooks = []
		, hooked = []
		, _wait = wait(resume)
		ignore = ignore || obj.syncMethods || []

		for (k in obj) if (typeof obj[k] == "function" && ignore.indexOf(k) == -1) !function(k) {
			hooked.push(k, hasOwn.call(obj, k) && obj[k])
			obj[k] = function() {
				hooks.push(k, arguments)
				return obj
			}
		}(k)

		obj.wait = _wait.wait
		return _wait

		function resume() {
			for (var v, scope = obj, i = hooked.length; i--; i--) {
				if (hooked[i]) obj[hooked[i-1]] = hooked[i]
				else delete obj[hooked[i-1]]
			}
			// i == -1 from previous loop
			for (; v = hooks[++i]; ) {
				scope = scope[v].apply(scope, hooks[++i]) || scope
			}
			hooks = hooked = null
		}
	}
	exports.Fn.hold = hold

	function True() {
		return true
	}

	function False() {
		return false
	}

}(this, Object)



