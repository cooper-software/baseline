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
	
	it('can insert a text region', function ()
	{
		var region = new TextRegion({ text: 'foo'}),
			block = (new ListBlock()).insert(0, region)
		
		expect(block.regions().length).to.equal(1)
		expect(block.regions()[0]).to.equal(region)
		
		var block2 = new ListBlock({ text_regions: [new TextRegion({text:'foo'}), new TextRegion({text:'bar'})] }),
			block3 = block2.insert(1, new TextRegion({text:'baz'}))
		
		expect(block3.regions().length).to.equal(3)
		expect(block3.regions()[0].text).to.equal('foo')
		expect(block3.regions()[1].text).to.equal('baz')
		expect(block3.regions()[2].text).to.equal('bar')
	})
	
	it('can replace a text region', function ()
	{
		var block = new ListBlock({ text_regions: [new TextRegion({text:'foo'}), new TextRegion({text:'bar'})] }),
			block2 = block.replace(1, new TextRegion({text:'baz'}))
		
		expect(block2.regions().length).to.equal(2)
		expect(block2.regions()[0].text).to.equal('foo')
		expect(block2.regions()[1].text).to.equal('baz')
	})
	
	it('can remove a text region', function ()
	{
		var block = (new ListBlock({ text_regions: [
						new TextRegion({text:'foo'}), 
						new TextRegion({text:'bar'}),
						new TextRegion({text:'baz'})
					]})).remove(1)
		
		expect(block.regions().length).to.equal(2)
		expect(block.regions()[0].text).to.equal('foo')
		expect(block.regions()[1].text).to.equal('baz')
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