"use strict"

var expect = require('chai').expect,
	h = require('../../baseline/vdom/h'),
	model = require('../../baseline/vdom/model'),
	VirtualText = model.VirtualText,
	VirtualElement = model.VirtualElement
	
describe('vdom.v', function ()
{
	it('creates a default VirtualElement if no arguments are provided', function ()
	{
		var velm = h()
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('P')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
		expect(velm.key).to.be.null
	})
	
	it('creates a VirtualElement with no children or properties if only a tag is provided', function ()
	{
		var velm = h('foo')
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
		expect(velm.key).to.be.null
	})
	
	it('creates a VirtualElement with properties if an object is provided', function ()
	{
		var velm = h('foo', { bar: 23, baz: 'qux' })
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({ bar: 23, baz: 'qux' })
		expect(velm.children).to.deep.equal([])
		expect(velm.key).to.be.null
	})
	
	it('creates a VirtualElement with a text child if a string is provided', function ()
	{
		var velm = h('foo', 'some text')
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children.length).to.equal(1)
		expect(velm.children[0]).to.deep.equal(new VirtualText({ text: 'some text' }))
	})
	
	it('creates a VirtualElement with a VirtualElement child if a VirtualElement is provided', function ()
	{
		var child = new VirtualElement(),
			velm = h('foo', child)
			
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([child])
	})
	
	it('descends into arrays', function ()
	{
		var child = new VirtualElement(),
			velm = h('foo', [{stuff: 'things'}, 'some text', child, [ { things: 'stuff' } ]])
			
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({stuff: 'things', things: 'stuff'})
		expect(velm.children).to.deep.equal([new VirtualText({text:'some text'}), child])
	})
	
	it('ignores null arguments', function ()
	{
		var velm = h('foo', null, [null, [null, null], null])
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
		expect(velm.key).to.be.null
	})
	
	it('creates a VirtualElement with a key if one is present in properties', function ()
	{
		var velm = h('foo', { key: 'bar' })
		expect(velm.constructor).to.equal(VirtualElement)
		expect(velm.tag).to.equal('FOO')
		expect(velm.properties).to.deep.equal({})
		expect(velm.children).to.deep.equal([])
		expect(velm.key).to.equal('bar')
	})
})