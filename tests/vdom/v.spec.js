"use strict"

var expect = require('chai').expect,
	v = require('../../baseline/vdom/v'),
	VirtualElement = require('../../baseline/vdom/VirtualElement')
	
describe('vdom.v', function ()
{
	it('creates a default VirtualElement if no arguments are provided', function ()
	{
		var velm = v()
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('P')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
	})
	
	it('creates a VirtualElement with no children or properties if only a tag is provided', function ()
	{
		var velm = v('foo')
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
	})
	
	it('creates a VirtualElement with properties if an object is provided', function ()
	{
		var velm = v('foo', { bar: 23, baz: 'qux' })
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({ bar: 23, baz: 'qux' })
		expect(velm.children).to.deep.equal([])
	})
	
	it('creates a VirtualElement with a text child if a string is provided', function ()
	{
		var velm = v('foo', 'some text')
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal(['some text'])
	})
	
	it('creates a VirtualElement with a VirtualElement child if a VirtualElement is provided', function ()
	{
		var child = new VirtualElement(),
			velm = v('foo', child)
			
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([child])
	})
	
	it('descends into arrays', function ()
	{
		var child = new VirtualElement(),
			velm = v('foo', [{stuff: 'things'}, 'some text', child, [ { things: 'stuff' } ]])
			
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({stuff: 'things', things: 'stuff'})
		expect(velm.children).to.deep.equal(['some text', child])
	})
	
	it('ignores null arguments', function ()
	{
		var velm = v('foo', null, [null, [null, null], null])
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
	})
})