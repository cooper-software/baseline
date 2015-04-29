"use strict"

var expect = require('chai').expect,
	Block = require('../../baseline/blocks/Block')

describe('blocks.Block', function ()
{
	it('has some default properties', function ()
	{
		var block = new Block()
		expect(block.regions).to.deep.equal([])
		expect(block.oncommand).to.be.an.instanceof(Function)
		expect(block.onselect).to.be.an.instanceof(Function)
		expect(block.ondeselect).to.be.an.instanceof(Function)
	})
	
	it('has a render function', function ()
	{
		var block = new Block(),
			result = block.render()
			
		expect(result).to.be.null
	})
})