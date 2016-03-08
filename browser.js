
!function(describe) {

	describe.GLOBAL = {}

	describe.it.goTo = function(route) {
		location.href = "#" + route
		setTimeout(this.wait(), 60)
		return this
	}

	describe.it.resizeTo = function(width, height) {
		document.documentElement.style.width = width
		document.documentElement.style.height = height
		M.emit.call(window, "resize")
		return this
	}

	describe.it.waitTill = function(actual, options) {
		var result
		, count = 30
		, resume = this.wait()

		if (options.timeout) {
			count = 0 | (options.timeout / 50)
		}

		this.ok(function() {
			return !!result
		}, options || "Function returns something")
		test()

		return this

		function test() {
			result = actual()
			if (!result && count--) return setTimeout(test, 50)
			resume()
		}
	}
	describe.it.viewOpen = function(actual, options) {
		return this.waitTill(function() {
			return View(actual).open
		}, options || "View "+actual+" should be open")
	}
	describe.it.waitSelector = function(actual, options) {
		return this.waitTill(function() {
			return document.body.find.call(document.documentElement, actual)
		}, options || "Selector "+actual+" should be in dom")
	}
	describe.it.countSelectors = function(actual, expected, options) {
		this.waitSelector(actual, options)
		this.ok(function() {
			var nodes = document.body.findAll(actual)
			, count = nodes && nodes.length
			return count === expected
		}, options || "Number of matches for " + actual + " should be " + expected)
		return this
	}
	describe.it.haveText = function(actual, expected, options) {
		this.waitSelector(actual, options)
		this.waitTill(function() {
			var node = document.body.find(actual)
			, txt = node && node[node.tagName == "INPUT" ? "val" : "txt"]().trim()
			return txt === expected
		}, options || actual + " should have text: " + expected)
		return this
	}
	describe.it.fill = function(actual, expected, options) {
		this.waitSelector(actual, options)
		this.ok(function() {
			var node = document.body.find(actual)
			, val = node && node.val(expected)
			return val === expected
		}, options || actual + " should have value " + expected)
		return this
	}
	describe.it.click = function(actual, expected, options) {
		this.waitSelector(actual, options)
		this.ok(function() {
			var ev
			, node = document.body.find(actual)
			, attr = {
				pointerX: 0, pointerY: 0, button: 0,
				ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
				bubbles: true, cancelable: true
			}

			if (node) {
				if (node.dispatchEvent) {
					ev = document.createEvent("MouseEvents")
					ev.initMouseEvent("click", true, true, document.defaultView, attr.button,
						attr.pointerX, attr.pointerY, attr.pointerX, attr.pointerY,
						attr.ctrlKey, attr.altKey, attr.shiftKey, attr.metaKey,
						attr.button, node)
					node.dispatchEvent(ev)
				} else if (node.click) {
					node.click()
				} else if (node.fireEvent) {
					node.fireEvent("onclick")
				} else if (typeof node.onclick == "function") {
					node.onclick()
				}
			}
			return !!node
		}, options || actual + " should be clickable")
		return this
	}
	describe.it.collectCssUsage = function(options) {
		options = options || {}
		var selectors = describe.GLOBAL.selectorsUsage = {}
		, styleSheets = document.styleSheets
		, styleSheetsCount = styleSheets.length
		, ignoreFiles = options.ignoreFiles
		, ignoreSelectors = options.ignoreSelectors
		, cleanSelectorRe = /:(?:focus|active|hover|unknown|:[-\w]+)\b/g

		while (styleSheetsCount--) {
			parseStyleSheet(styleSheets[styleSheetsCount])
		}

		function parseStyleSheet(styleSheet) {
			var rule
			, rules = styleSheet.cssRules || styleSheet.rules
			, rulesCount = rules.length
			, fileName = styleSheet.href

			// In IE7 fileName already is relative
			if (/^\w+:\/\//.test(fileName)) {
				fileName = relative(location.href.replace(/\/[^\/]*$/, ""), styleSheet.href||"")
			}

			if (ignoreFiles && ignoreFiles.indexOf(fileName) > -1) return

			// IE 8
			if (styleSheet.imports) {
				for (var i = styleSheet.imports.length; i--; ) {
					parseStyleSheet(styleSheet.imports[i])
				}
			}

			while (rulesCount--) {
				rule = rules[rulesCount]
				if (rule.styleSheet) {
					parseStyleSheet(rule.styleSheet)
				} else if (rule.selectorText) {
					rule.selectorText.split(/\s*,\s*/).each(function(sel) {
						sel = sel.replace(cleanSelectorRe, "").toLowerCase()
						if (!sel || ignoreSelectors && ignoreSelectors.indexOf(sel) > -1) {
							return
						}
						selectors[sel] = selectors[sel] || {files: [], count: 0}
						if (selectors[sel].files.indexOf(fileName + ":" + rulesCount) == -1) {
							selectors[sel].files.unshift(fileName + ":" + rulesCount)
						}
					})
				} else {
					//console.log("bad rule", rule)
				}
			}
		}
		View.on("show", count)
		View.on("ping", count)
		function count() {
			var sel
			, arr = Object.keys(selectors)
			, len = arr.length

			while (sel = arr[--len]) {
				selectors[sel].count += document.body.findAll.call(document.documentElement, sel).length
			}
		}
		return this
	}

	describe.it.assertCssUsage = function(options) {
		options = options || {}
		var assert = this.test(options.message || "it should use all css rules")

		var sel
		, selectors = describe.GLOBAL.selectorsUsage
		, arr = Object.keys(selectors)
		, len = arr.length

		assert.plan(len)
		assert.options.noStack = true

		while (sel = arr[--len]) {
			assert.ok(selectors[sel].count, "Unused rule '" + sel + "' in " + selectors[sel].files)
		}
		return assert
	}

	describe.it.collectViewsUsage = function() {
		var viewsUsage = describe.GLOBAL.viewsUsage = {}

		View.on("show", function(route) {
			var view = View.views[route]

			do {
				viewsUsage[route] = viewsUsage[route] || 0
				viewsUsage[route]++
			} while (route = (view = view.parent || {}).route)
		})
		return this
	}

	describe.it.assertViewsUsage = function() {
		var assert = this.it("should use all views")
		var route
		, routes = Object.keys(View.views)
		, len = routes.length
		, viewsUsage = describe.GLOBAL.viewsUsage

		assert.plan(len)
		assert.options.noStack = true

		while (route = routes[--len]) {
			assert.ok(viewsUsage[route], "Unused view " + route)
		}
		return assert
	}

	function clear(path) {
		if (typeof path != "string") {
			throw new TypeError("Path must be a string. Received " + typeof path)
		}
		return path.replace(/\/+$/, "")
	}
	var normalizeRe = /^\.\/|(?:^\/\.\.|\/)(\/)|\/(?:[^\/]*\/\.)?\.(\/|$)/

	function normalize(path) {
		for (; path != (path = path.replace(normalizeRe, "$1$2")); );
		return path
	}

	function relative(from, to) {
		from = normalize(clear(from))
		to = normalize(clear(to))

		if (from === to) return ""

		from = from.split("/")
		to = to.split("/")

		for (var i = common = from.length; i--; ) {
			if (from[i] !== to[i]) common = i
			from[i] = ".."
		}

		return from.slice(common).concat(to.slice(common)).join("/")
	}

	function isVisible(node) {
		var style = window.getComputedStyle ? window.getComputedStyle(node, null) : node.currentStyle
	}

	describe.it.isVisible = function(actual, expected, options) {
		var node = actual
		, visible = node.offsetHeight != 0
	}

}(describe)

