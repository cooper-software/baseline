"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	Model = require('../../baseline/Model'),
	Block = require('../../baseline/blocks/Block'),
	SimpleBlock = require('../../baseline/blocks/SimpleBlock'),
	TextRegion = require('../../baseline/regions/TextRegion')
	
chai.use(sinon_chai)


describe('blocks.SimpleBlock', function ()
{
	it('is a kind of Block', function ()
	{
		var block = new SimpleBlock()
		expect(Model.is_instance(block, Block))
	})
	
	it('has some default properties', function ()
	{
		var block = new SimpleBlock()
		expect(block.tag).to.equal('P')
		expect(block.regions.length).to.equal(1)
		expect(block.regions[0].constructor).to.equal(TextRegion)
		expect(block.regions[0].text).to.equal('')
		expect(block.regions[0].annotations.empty()).to.be.true
	})
	
	it('renders correctly when empty', function ()
	{
		var block = new SimpleBlock({}),
			result = block.render()
		
		expect(result.tag).to.equal('P')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tag).to.equal('BR')
	})
	
	it('renders correctly when not empty', function ()
	{
		var block = new SimpleBlock({ tag: 'FOO', regions: [ new TextRegion({ text: 'blah blah' }) ] }),
			result = block.render()
		
		expect(result.tag).to.equal('FOO')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].text).to.equal('blah blah')
	})
	
	it('uses its region to find the correct dom position', function ()
	{
		var block = new SimpleBlock({ regions: [{ get_offset_of_dom_point: function () { return 23 } }] }),
			block_node = { childNodes: [ { nodeType: 3, nodeValue: 'foo' } ] },
			dom_point = { node: block_node.childNodes[0], offset: 1 }
		
		sinon.spy(block.regions[0], "get_offset_of_dom_point")
		var pos = block.get_position_of_dom_point(block_node, dom_point)
		
		expect(block.regions[0].get_offset_of_dom_point).to.have.been.calledWith(block_node, dom_point)
		expect(pos).to.deep.equal({ region: 0, offset: 23 })
	})
	
	it('renders text alignment as a style in its regions', function ()
	{
		var block_a = new SimpleBlock({ regions: [ new TextRegion({ alignment: 'left' }) ] })
		var block_b = new SimpleBlock({ regions: [ new TextRegion({ alignment: 'right' }) ] })
		var block_c = new SimpleBlock({ regions: [ new TextRegion({ alignment: 'center' }) ] })
		var vtree_a = block_a.render()
		var vtree_b = block_b.render()
		var vtree_c = block_c.render()
		expect(vtree_a.properties.style).to.deep.equal({})
		expect(vtree_b.properties.style.textAlign).to.equal('right')
		expect(vtree_c.properties.style.textAlign).to.equal('center')
	})
})