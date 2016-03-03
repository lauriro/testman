

require("../").

test( "Fail 1", function(assert) {
	assert.ok(false, "show stack 1")
	assert.ok(true)
	assert.equal(false, /a/i)
	assert.strictEqual(new Date, {a:"A"})
	assert.strictEqual(1, "1")
}).

test( "Fail 2", function(assert) {
	assert.options.noStack = true
	assert.ok(false, "no stack 1")
	assert.ok(true)
	assert.equal(null, [1, "2", 3, 4, 5])
}).

done()



