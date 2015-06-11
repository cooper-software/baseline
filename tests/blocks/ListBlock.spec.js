"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Model = require('../../baseline/Model'),
	h = require('../../baseline/vdom').h,
	Block = require('../../baseline/blocks/Block'),
	ListBlock = require('../../baseline/blocks/ListBlock'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Parser = require('../../baseline/Parser'),
	DomPoint = require('../../baseline/selection/DomPoint'),
	Point = require('../../baseline/selection/Point'),
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	Annotation = require('../../baseline/annotations/Annotation')


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
		
		expect(result.tag).to.equal('UL')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tag).to.equal('LI')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].tag).to.equal('BR')
	})
	
	it('renders correctly when not empty', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'foo' }), 
					new TextRegion({ text: 'bar' })
				]
			}),
			result = block.render()
		
		expect(result.tag).to.equal('UL')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tag).to.equal('LI')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tag).to.equal('LI')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
	})
	
	it('renders correctly with custom list and item tags', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'foo' }), 
					new TextRegion({ text: 'bar' })
				],
				list_tag: 'FOO',
				item_tag: 'BAR'
			}),
			result = block.render()
		
		expect(result.tag).to.equal('FOO')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tag).to.equal('BAR')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tag).to.equal('BAR')
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
	
	it('will turn non-list items that have text into list items when parsing', function ()
	{
		var vnode = h('ul', [
				'foo',
				h('li', 'bar'),
				'\n\t ',
				h('li', 'baz')
			]),
			parser = new Parser()
		
		var block = ListBlock.recognize.call(parser, vnode)
		expect(block.regions.length).to.equal(3)
		expect(block.regions[0].text).to.equal('foo')
		expect(block.regions[1].text).to.equal('bar')
		expect(block.regions[2].text).to.equal('baz')
	})
	
	it('provides a position for a dom point that points at its list node', function ()
	{
		var block = new ListBlock(),
			node = document.createElement('ul')
		
		var pos = block.get_position_of_dom_point(node, new DomPoint({ node: node, offset: 123 }))
		expect(pos).to.deep.equal({ region: 0, offset: 0 })
	})
	
	it('can find the position of a dom point in a region without annotations', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'Foo' }),
					new TextRegion({ text: 'Bar' })
				]
			}),
			node = document.createElement('ul')
		
		node.innerHTML = '<li>Foo</li><li>Bar</li>'
		
		var pos = block.get_position_of_dom_point(node, new DomPoint({ node: node.childNodes[1], offset: 1 }))
		expect(pos).to.deep.equal({ region: 1, offset: 1 })
	})
	
	it('can find the position of a dom point in a region with annotations', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'Foo' }),
					new TextRegion({
						text: 'Bar',
						annotations: (new AnnotationTree()).concat([
							new Annotation({ offset: 1, length: 2 })
						])
					})
				]
			}),
			node = document.createElement('ul')
		
		node.innerHTML = '<li>Foo</li><li>B<span>ar</span></li>'
		
		var pos = block.get_position_of_dom_point(node, new DomPoint({ node: node.childNodes[1].childNodes[1], offset: 1 }))
		expect(pos).to.deep.equal({ region: 1, offset: 2 })
	})
	
	it('inserts a new region when the current region has text', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'Foo' }),
					new TextRegion({ text: 'Bar' }),
					new TextRegion({ text: 'Baz' })
				]
			}),
			result = block.insert(new Point({ block: 0, region: 1, offset: 2 }))
		
		expect(result.blocks.length).to.equal(1)
		var new_block = result.blocks[0]
		expect(new_block.regions.length).to.equal(4)
		expect(new_block.regions[0].text).to.equal('Foo')
		expect(new_block.regions[1].text).to.equal('Ba')
		expect(new_block.regions[2].text).to.equal('r')
		expect(new_block.regions[3].text).to.equal('Baz')
		expect(result.point.block).to.equal(0)
		expect(result.point.region).to.equal(2)
		expect(result.point.offset).to.equal(0)
	})
	
	it('inserts a new SimpleBlock when the current region does not have any text', function ()
	{
		var block = new ListBlock({
				regions: [
					new TextRegion({ text: 'Foo' }),
					new TextRegion({ text: 'Bar' }),
					new TextRegion({ text: '' })
				]
			}),
			result = block.insert(new Point({ block: 0, region: 2, offset: 0 }))
		
		expect(result.blocks.length).to.equal(2)
		expect(result.blocks[0].regions.length).to.equal(2)
		expect(result.blocks[0].regions[0].text).to.equal('Foo')
		expect(result.blocks[0].regions[1].text).to.equal('Bar')
		expect(result.blocks[1].tag).to.equal('P')
		expect(result.blocks[1].regions.length).to.equal(1)
		expect(result.blocks[1].regions[0].text).to.equal('')
		expect(result.point.block).to.equal(1)
		expect(result.point.region).to.equal(0)
		expect(result.point.offset).to.equal(0)
	})
})