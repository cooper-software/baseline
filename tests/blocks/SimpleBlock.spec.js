"use strict"

var expect = require('chai').expect,
	Model = require('../../baseline/Model'),
	Block = require('../../baseline/blocks/Block'),
	SimpleBlock = require('../../baseline/blocks/SimpleBlock'),
	TextRegion = require('../../baseline/blocks/TextRegion')

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
		
		expect(result.tagName).to.equal('P')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tagName).to.equal('BR')
	})
	
	it('renders correctly when not empty', function ()
	{
		var block = new SimpleBlock({ tag: 'FOO', regions: [ new TextRegion({ text: 'blah blah' }) ] }),
			result = block.render()
		
		expect(result.tagName).to.equal('FOO')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].text).to.equal('blah blah')
	})
})