"use strict"

var expect = require('chai').expect,
	SimpleBlock = require('../../baseline/blocks/SimpleBlock'),
	TextRegion = require('../../baseline/regions/TextRegion')
	
describe('blocks.SimpleBlock', function ()
{
	it('has sensible defaults', function ()
	{
		var block = new SimpleBlock()
		expect(block.tag).to.equal('p')
		expect(block.text_region.text).to.equal('')
		expect(block.text_region.annotations.empty()).to.be.true
	})
	
	it('has a single text region', function ()
	{
		var block = new SimpleBlock()
		expect(block.regions()).to.eql([ block.text_region ])
	})
	
	it('renders correctly', function ()
	{
		var block = new SimpleBlock({ tag: 'h1', text_region: new TextRegion({ text: 'foo' }) }),
			result = block.render()
		
		expect(result.tagName).to.equal('H1')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].text).to.equal('foo')
	})
})