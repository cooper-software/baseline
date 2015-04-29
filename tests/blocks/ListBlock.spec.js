"use strict"

var expect = require('chai').expect,
	h = require('virtual-dom/h'),
	Model = require('../../baseline/Model'),
	List = require('../../baseline/List'),
	Block = require('../../baseline/blocks/Block'),
	ListBlock = require('../../baseline/blocks/ListBlock'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Parser = require('../../baseline/Parser')


describe('blocks.ListBlock', function ()
{
	it('is a kind of Block', function ()
	{
		var block = new ListBlock()
		expect(Model.is_instance(block, Block))
	})
	
	it('has some default properties', function ()
	{
		var block = new ListBlock()
		expect(block.list_tag).to.equal('UL')
		expect(block.item_tag).to.equal('LI')
		expect(block.regions.length).to.equal(1)
		expect(block.regions[0].constructor).to.equal(TextRegion)
		expect(block.regions[0].text).to.equal('')
		expect(block.regions)
	})
	
	it('renders correctly when empty', function ()
	{
		var block = new ListBlock(),
			result = block.render()
		
		expect(result.tagName).to.equal('UL')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tagName).to.equal('LI')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].tagName).to.equal('BR')
	})
	
	it('renders correctly when not empty', function ()
	{
		var block = new ListBlock({ regions: List([
										new TextRegion({ text: 'foo' }), 
										new TextRegion({ text: 'bar' }) ]) }),
			result = block.render()
		
		expect(result.tagName).to.equal('UL')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tagName).to.equal('LI')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tagName).to.equal('LI')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
	})
	
	it('renders correctly with custom list and item tags', function ()
	{
		var block = new ListBlock({
				regions: List([
					new TextRegion({ text: 'foo' }), 
					new TextRegion({ text: 'bar' })
				]),
				list_tag: 'FOO',
				item_tag: 'BAR'
			}),
			result = block.render()
		
		expect(result.tagName).to.equal('FOO')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tagName).to.equal('BAR')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tagName).to.equal('BAR')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
	})
	
	it('will recognize an unordered list', function ()
	{
		var vnode = h('ul', [
				h('li', ['foo']),
				h('li', ['bar'])
			]),
			parser = new Parser()
		
		var block = ListBlock.recognize.call(parser, vnode)
		
		expect(block.constructor).to.equal(ListBlock)
		expect(block.list_tag).to.equal('UL')
		expect(block.item_tag).to.equal('LI')
		expect(block.regions.length).to.equal(2)
		expect(block.regions[0].text).to.equal('foo')
		expect(block.regions[1].text).to.equal('bar')
	})
	
	it('will recognize an ordered list', function ()
	{
		var vnode = h('ol', [
				h('li', ['foo']),
				h('li', ['bar'])
			]),
			parser = new Parser()
		
		var block = ListBlock.recognize.call(parser, vnode)
		
		expect(block.constructor).to.equal(ListBlock)
		expect(block.list_tag).to.equal('OL')
		expect(block.item_tag).to.equal('LI')
		expect(block.regions.length).to.equal(2)
		expect(block.regions[0].text).to.equal('foo')
		expect(block.regions[1].text).to.equal('bar')
	})
})