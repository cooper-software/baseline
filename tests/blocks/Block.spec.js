"use strict"

var expect = require('chai').expect,
	Block = require('../../baseline/blocks/Block'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Point = require('../../baseline/selection/Point')

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
	
	it('can delete a range within a region', function ()
	{
		var block = new Block({
				regions: [ new TextRegion({ text: 'This is some text' }) ]
			}),
			changed_block = block.delete(
				new Point({ region: 0, offset: 1 }),
				new Point({ region: 0, offset: 5 })
			)
		
		expect(block.regions.length).to.equal(1)
		expect(block.regions[0].text).to.equal('This is some text')
		expect(changed_block.regions.length).to.equal(1)
		expect(changed_block.regions[0].text).to.equal('Tis some text')
		
	})
	
	it('can delete a range that spans multiple regions', function ()
	{
		var block = new Block({
				regions: [
					new TextRegion({ text: 'This is the first region' }),
					new TextRegion({ text: 'This is the second region' }),
					new TextRegion({ text: 'This is the third region' })
				]
			}),
			changed_block = block.delete(
				new Point({ region: 0, offset: 8 }),
				new Point({ region: 2, offset: 5 })
			)
			
	})
	
	it('can append another block to its end', function ()
	{
		var block_a = new Block({
				regions: [
					new TextRegion({ text: 'Text region one' }),
					new TextRegion({ text: 'Text region two' })
				]
			}),
			block_b = new Block({
				regions: [
					new TextRegion({ text: ' is text region two' }),
					new TextRegion({ text: 'This is the third region' })
				]
			}),
			block_c = block_a.append(block_b)
		
		expect(block_a.regions.length).to.equal(2)
		expect(block_a.regions[0].text).to.equal('Text region one')
		expect(block_a.regions[1].text).to.equal('Text region two')
		expect(block_b.regions.length).to.equal(2)
		expect(block_b.regions[0].text).to.equal(' is text region two')
		expect(block_b.regions[1].text).to.equal('This is the third region')
		expect(block_c.regions.length).to.equal(2)
		expect(block_c.regions[0].text).to.equal('Text region one')
		expect(block_c.regions[1].text).to.equal('Text region two is text region two')
	})
	
	it('has a default method to insert a new block inside the current one', function ()
	{
		var block = new Block({ 
				regions: [
					new TextRegion({ text: 'Foo bar baz' }),
					new TextRegion({ text: 'Qux quack quint' })
				]
			}),
			new_blocks = block.insert({ region: 1, offset: 4 })
		
		expect(new_blocks.length).to.equal(2)
		expect(new_blocks[0].regions.length).to.equal(2)
		expect(new_blocks[0].regions[0].text).to.equal('Foo bar baz')
		expect(new_blocks[0].regions[1].text).to.equal('Qux ')
		expect(new_blocks[1].regions.length).to.equal(1)
		expect(new_blocks[1].regions[0].text).to.equal('quack quint')
	})
})