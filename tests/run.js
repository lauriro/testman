

require("../").


describe ( "Testman" ).
	it ( "should pass dummy-tests" ).
		equal("a", "a", "a and a should be same").
		ok(true, "true is ok").
		ok(1, "one is ok").
		ok("s", "string is ok").
describe ( "Another component" ).
done()



