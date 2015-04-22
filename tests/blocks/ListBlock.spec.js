"use strict"

var expect = require('chai').expect,
	ListBlock = require('../../baseline/blocks/ListBlock'),
	TextRegion = require('../../baseline/regions/TextRegion')
	
describe('blocks.ListBlock', function ()
{
	it('has sensible defaults', function ()
	{
		var block = new ListBlock()
		expect(block.list_tag).to.equal('ul')
		expect(block.item_tag).to.equal('li')
		expect(block.text_regions).to.eql([])
	})
	
	it('has a list of text regions', function ()
	{
		var block = new ListBlock()
		expect(block.regions()).to.eql(block.text_regions)
	})
	
	it('renders correctly', function ()
	{
		var block = new ListBlock({
						list_tag: 'ux',
						item_tag: 'lx',
						text_regions: [
							new TextRegion({text:'foo'}), 
							new TextRegion({text:'bar'})
						]
					}),
			result = block.render()
		
		expect(result.tagName).to.equal('UX')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tagName).to.equal('LX')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tagName).to.equal('LX')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
	})
})