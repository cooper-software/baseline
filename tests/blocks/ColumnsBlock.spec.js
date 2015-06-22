"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Model = require('../../baseline/Model'),
	h = require('../../baseline/vdom').h,
	Block = require('../../baseline/blocks/Block'),
	TextRegion = require('../../baseline/regions/TextRegion'),
	ColumnsBlock = require('../../baseline/blocks/ColumnsBlock'),
	Parser = require('../../baseline/Parser'),
	DomPoint = require('../../baseline/selection/DomPoint'),
	Point = require('../../baseline/selection/Point')
	
describe('blocks.ColumnsBlock', function ()
{
	it('is a kind of Block', function ()
	{
		var block = new ColumnsBlock()
		expect(Model.is_instance(block, Block))
	})
	
	it('has some default properties', function ()
	{
		var block = new ColumnsBlock()
		expect(block.columns).to.equal(2)
		expect(block.regions.length).to.equal(2)
	})
	
	it('renders correctly when empty', function ()
	{
		var block = new ColumnsBlock(),
			result = block.render()
		
		expect(result.tag).to.equal('DIV')
		expect(result.properties.className).to.equal('row')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tag).to.equal('DIV')
		expect(result.children[0].properties.className).to.equal('column span-1-2')
		expect(result.children[0].children.length).to.equal(0)
		expect(result.children[1].tag).to.equal('DIV')
		expect(result.children[1].properties.className).to.equal('column span-1-2')
		expect(result.children[1].children.length).to.equal(0)
	})
	
	it('renders correctly when not empty', function ()
	{
		var block = new ColumnsBlock({
				regions: [
					new TextRegion({ text: 'foo' }), 
					new TextRegion({ text: 'bar' })
				]
			}),
			result = block.render()
		
		expect(result.tag).to.equal('DIV')
		expect(result.properties.className).to.equal('row')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tag).to.equal('DIV')
		expect(result.children[0].properties.className).to.equal('column span-1-2')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tag).to.equal('DIV')
		expect(result.children[1].properties.className).to.equal('column span-1-2')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
	})
	
	it('can change number of columns', function ()
	{
		var block = new ColumnsBlock({
				regions: [
					new TextRegion({ text: 'foo' }), 
					new TextRegion({ text: 'bar' })
				]
			}),
			new_block = block.set_columns(3),
			result = new_block.render()
		
		expect(result.tag).to.equal('DIV')
		expect(result.properties.className).to.equal('row')
		expect(result.children.length).to.equal(3)
		expect(result.children[0].tag).to.equal('DIV')
		expect(result.children[0].properties.className).to.equal('column span-1-3')
		expect(result.children[0].children.length).to.equal(1)
		expect(result.children[0].children[0].text).to.equal('foo')
		expect(result.children[1].tag).to.equal('DIV')
		expect(result.children[1].properties.className).to.equal('column span-1-3')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('bar')
		expect(result.children[2].tag).to.equal('DIV')
		expect(result.children[2].properties.className).to.equal('column span-1-3')
		expect(result.children[2].children.length).to.equal(0)
	})
	
	it('will recognize columns', function ()
	{
		var vnode = h('div', { className: 'foo row bar' },
			[
				h('p', ['foo']),
				h('p', ['bar']),
				h('div', { className: 'column span-1-27' }, ['baz'])
			]),
			parser = new Parser()
		
		var block = ColumnsBlock.recognize.call(parser, vnode)
		
		expect(block.constructor).to.equal(ColumnsBlock)
		expect(block.columns).to.equal(3)
		expect(block.regions.length).to.equal(3)
		expect(block.regions[0].text).to.equal('foo')
		expect(block.regions[1].text).to.equal('bar')
		expect(block.regions[2].text).to.equal('baz')
	})
	
	it('provides a position for a dom point that points at its list node', function ()
	{
		var block = new ColumnsBlock(),
			node = document.createElement('div')
		
		var pos = block.get_position_of_dom_point(node, new DomPoint({ node: node, offset: 123 }))
		expect(pos).to.deep.equal({ region: 0, offset: 0 })
	})
	
	it('moves to the next region when inserting at any region before the last one', function ()
	{
		var block = new ColumnsBlock({
				regions: [
					new TextRegion({ text: 'Foo' }),
					new TextRegion({ text: 'Bar' }),
					new TextRegion({ text: 'Baz' })
				]
			}),
			result = block.insert(new Point({ block: 0, region: 0, offset: 0 }))
		
		expect(result.blocks.length).to.equal(1)
		var new_block = result.blocks[0]
		expect(new_block.regions.length).to.equal(3)
		expect(new_block.regions[0]).to.equal(block.regions[0])
		expect(new_block.regions[1]).to.equal(block.regions[1])
		expect(new_block.regions[2]).to.equal(block.regions[2])
		expect(result.point.block).to.equal(0)
		expect(result.point.region).to.equal(1)
		expect(result.point.offset).to.equal(0)
		
		result = block.insert(new Point({ block: 0, region: 1, offset: 0 }))
		expect(result.blocks.length).to.equal(1)
		new_block = result.blocks[0]
		expect(new_block.regions.length).to.equal(3)
		expect(new_block.regions[0]).to.equal(block.regions[0])
		expect(new_block.regions[1]).to.equal(block.regions[1])
		expect(new_block.regions[2]).to.equal(block.regions[2])
		expect(result.point.block).to.equal(0)
		expect(result.point.region).to.equal(2)
		expect(result.point.offset).to.equal(0)
	})
	
	it('inserts a new SimpleBlock when inside the last region', function ()
	{
		var block = new ColumnsBlock({
				regions: [
					new TextRegion(),
					new TextRegion(),
					new TextRegion()
				]
			}),
			result = block.insert(new Point({ block: 0, region: 2, offset: 0 }))
		
		expect(result.blocks.length).to.equal(2)
		expect(result.blocks[0].regions.length).to.equal(3)
		expect(result.blocks[0].regions[0]).to.equal(block.regions[0])
		expect(result.blocks[0].regions[1]).to.equal(block.regions[1])
		expect(result.blocks[1].tag).to.equal('P')
		expect(result.blocks[1].regions.length).to.equal(1)
		expect(result.blocks[1].regions[0].text).to.equal('')
		expect(result.point.block).to.equal(1)
		expect(result.point.region).to.equal(0)
		expect(result.point.offset).to.equal(0)
	})
	
	it('moves to the previous region when deleting at a region boundary', function ()
	{
		var block = new ColumnsBlock({
				regions: [
					new TextRegion(),
					new TextRegion(),
					new TextRegion()
				]
			}),
			result = block.delete_at_boundary(new Point({ block: 0, region: 1, offset: 0 }))
		
		expect(result.blocks.length).to.equal(1)
		expect(result.blocks[0]).to.equal(block)
		expect(result.point.block).to.equal(0)
		expect(result.point.region).to.equal(0)
		expect(result.point.offset).to.equal(0)
	})
	
	it('does nothing when appending to another block', function ()
	{
		var block_a = new ColumnsBlock({
				regions: [
					new TextRegion(),
					new TextRegion(),
					new TextRegion()
				]
			}),
			block_b = new Block({ regions: [ new TextRegion() ] }),
			result = block_a.append_to(block_b)
		
		expect(result[0]).to.equal(block_b)
		expect(result[1]).to.equal(block_a)
	})
})