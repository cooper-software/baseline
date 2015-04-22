"use strict"

var expect = require("chai").expect,
	Model = require('../baseline/Model')
	
describe("Model", function ()
{
	it('has no properties by default except for update and equals', function ()
	{
		var Foo = Model(),
			foo = new Foo()
		
		expect(Object.keys(foo)).to.eql(['update', 'equals'])
	})
	
	it('has the properties passed to the constructor and they are read-only', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo()
			
		var bar_desc = Object.getOwnPropertyDescriptor(foo, 'bar')
		expect(bar_desc).to.be.defined
		expect(bar_desc.value).to.eql(23)
		expect(bar_desc.writable).to.be.false
	})
	
	it('can perform non-destructive updates', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo(),
			foo2 = foo.update({ bar: 77 })
		
		expect(foo).to.not.equal(foo2)
		expect(foo.bar).to.eql(23)
		expect(foo2.bar).to.eql(77)
	})
	
	it('is equal to itself', function ()
	{
		var Foo = Model(),
			foo = new Foo()
		
		expect(foo.equals(foo)).to.be.true
	})
	
	it('is not equal to a differently-typed object', function ()
	{
		var Foo = Model(),
			foo = new Foo(),
			bar = "bar"
			
		expect(foo.equals(bar)).to.not.be.true
	})
	
	it('is equal to a copy of itself', function ()
	{
		var Foo = Model(),
			foo = new Foo(),
			foo_copy = foo.update()
		
		expect(foo.equals(foo_copy)).to.be.true
	})
	
	it('is not equal to a copy of itself with different properties', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo(),
			foo_copy = foo.update({ bar: 77 })
		
		expect(foo.equals(foo_copy)).not.to.be.true
	})
	
	it('is not equal to a different model with the same properties', function ()
	{
		var Foo = Model({ bar: 23 }),
			Bar = Model({ bar: 23 }),
			foo = new Foo(),
			bar = new Bar()
		
		expect(foo.equals(bar)).not.to.be.true
	})
	
	it('it looks inside arrays when comparing equality', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo({ bar: [2,3] }),
			foo2 = new Foo({ bar: [2,3] }),
			foo3 = new Foo({ bar: [7,7] })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('it looks inside objects when comparing equality', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo({ bar: { 2: 3 } }),
			foo2 = new Foo({ bar: { 2: 3 } }),
			foo3 = new Foo({ bar: { 7: 7 } })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('uses nested models\' equals() method when comparing equality', function ()
	{
		var Foo = Model({ bar: 23 }),
			foo = new Foo({ bar: new Foo() }),
			foo2 = new Foo({ bar: new Foo() }),
			foo3 = new Foo({ bar: new Foo({ bar: 77 }) })
			
		expect(foo.equals(foo2)).to.be.true
		expect(foo.equals(foo3)).not.to.be.true
	})
	
	it('can only consider certain properties when comparing equality', function ()
	{
		var Foo = Model({ bar: 23, baz: 'skidoo' }),
			foo = new Foo(),
			foo2 = foo.update({ bar: 77 })
		
		expect(foo.equals(foo2)).not.to.be.true
		expect(foo.equals(foo2, ['baz'])).to.be.true
	})
	
	it('throws an error if attempting to initialize with an unknown property', function ()
	{
		var Foo = Model({ bar: 23 }),
			bad = function () { new Foo({ baz: 77 }) }
		
		expect(bad).to.throw('Unknown property "baz"')
	})
})