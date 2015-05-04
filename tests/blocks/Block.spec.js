"use strict"

var expect = require('chai').expect,
	Block = require('../../baseline/blocks/Block')

describe('blocks.Block', function ()
{
	it('has a regions property', function ()
	{
		var block = new Block()
		expect(block.regions).to.deep.equal([])
	})
	
	it('has a render method', function ()
	{
		var block = new Block()
		
		expect(block.render).to.be.defined
		expect(block.render()).to.be.null
	})
	
	it('has a method to get the position of a dom point', function ()
	{
		var block = new Block()
		expect(block.get_position_of_dom_point).to.be.defined
		expect(block.get_position_of_dom_point()).to.deep.equal({ region: 0, offset: 0 })
	})
	
	it('has a method to get the dom point for a selection.Point', function ()
	{
		var block = new Block()
		expect(block.get_dom_point).to.be.defined
		var dom_point = block.get_dom_point('foo')
		expect(dom_point.node).to.equal('foo')
		expect(dom_point.offset).to.equal(0)
	})
})