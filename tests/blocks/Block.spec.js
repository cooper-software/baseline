"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	Block = require('../../baseline/blocks/Block'),
	TextRegion = require('../../baseline/regions/TextRegion'),
	Point = require('../../baseline/selection/Point'),
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType')

chai.use(sinon_chai)

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
		expect(block.get_position_of_dom_point()).to.deep.equal(new Point({ region: 0, offset: 0 }))
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
				new Point({ region: 2, offset: 8 })
			)
		
		expect(changed_block.regions.length).to.equal(1)
		expect(changed_block.regions[0].text).to.equal('This is the third region')
	})
	
	it('can be appended to another block', function ()
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
			result = block_b.append_to(block_a)
		
		expect(block_a.regions.length).to.equal(2)
		expect(block_a.regions[0].text).to.equal('Text region one')
		expect(block_a.regions[1].text).to.equal('Text region two')
		expect(block_b.regions.length).to.equal(2)
		expect(block_b.regions[0].text).to.equal(' is text region two')
		expect(block_b.regions[1].text).to.equal('This is the third region')
		expect(result.length).to.equal(2)
		var block_c = result[0],
			block_d = result[1]
		expect(block_c.regions.length).to.equal(2)
		expect(block_c.regions[0].text).to.equal('Text region one')
		expect(block_c.regions[1].text).to.equal('Text region two is text region two')
		expect(block_d.regions.length).to.equal(1)
		expect(block_d.regions[0].text).to.equal('This is the third region')
	})
	
	it('has a default method to insert a new block inside the current one', function ()
	{
		var block = new Block({ 
				regions: [
					new TextRegion({ text: 'Foo bar baz' }),
					new TextRegion({ text: 'Qux quack quint' })
				]
			}),
			result = block.insert(new Point({ block: 0, region: 1, offset: 4 }))
		
		expect(result.blocks.length).to.equal(2)
		expect(result.blocks[0].regions.length).to.equal(2)
		expect(result.blocks[0].regions[0].text).to.equal('Foo bar baz')
		expect(result.blocks[0].regions[1].text).to.equal('Qux ')
		expect(result.blocks[1].regions.length).to.equal(1)
		expect(result.blocks[1].regions[0].text).to.equal('quack quint')
		expect(result.point.block).to.equal(1)
		expect(result.point.region).to.equal(0)
		expect(result.point.offset).to.equal(0)
	})
	
	it('can tell if it has matching annotations continuously across a range', sinon.test(function ()
	{
		var block = new Block({
				regions: [
					new TextRegion({ text: 'Foo bar baz'}),
					new TextRegion({ text: 'Qux quack quint' }),
					new TextRegion({ text: 'Zux Zuack Zuint' }),
					new TextRegion({ text: 'Xuz Kcauz Tniuz' })
				]
			}),
			ann = new Annotation({ type: new AnnotationType() })
			
		this.stub(block.regions[0], "has_annotation").returns(true)
		this.stub(block.regions[1], "has_annotation").returns(true)
		this.stub(block.regions[2], "has_annotation").returns(false)
		this.stub(block.regions[3], "has_annotation").returns(true)
		
		var result = block.has_annotation(
			{ region: 0, offset: 0 },
			{ region: 0, offset: 0 },
			ann
		)
		
		expect(result).to.be.true
		expect(block.regions[0].has_annotation).to.have.been.called
		expect(block.regions[0].has_annotation.args[0][0]).to.equal(0)
		expect(block.regions[0].has_annotation.args[0][1]).to.equal(0)
		expect(block.regions[0].has_annotation.args[0][2]).to.equal(ann)
		
		result = block.has_annotation(
			{ region: 0, offset: 5 },
			{ region: 1, offset: 20 },
			ann
		)
		
		expect(result).to.be.true
		
		result = block.has_annotation(
			{ region: 1, offset: 0 },
			{ region: 3, offset: 20 },
			ann
		)
		
		expect(result).to.be.false
		
		result = block.has_annotation(
			{ region: 3, offset: 0 },
			{ region: 3, offset: 10 },
			ann
		)
		
		expect(result).to.be.true
	}))

	it('can add annotations to a range based on a prototype annotation', sinon.test(function ()
	{
		var block = new Block({
				regions: [
					new TextRegion({ text: 'Foo bar baz'}),
					new TextRegion({ text: 'Qux quack quint' }),
					new TextRegion({ text: 'Zux Zuack Zuint' }),
					new TextRegion({ text: 'Xuz Kcauz Tniuz' })
				]
			}),
			proto_ann = new Annotation({ type: new AnnotationType() })
		
		this.stub(block.regions[0], 'add_annotation').returns('foo')
		this.stub(block.regions[1], 'add_annotation').returns('bar')
		this.stub(block.regions[2], 'add_annotation').returns('baz')
		this.stub(block.regions[3], 'add_annotation').returns('qux')
		
		var new_block = block.add_annotation(
			{ region: 0, offset: 4 },
			{ region: 2, offset: 3 },
			proto_ann
		)
		
		expect(block.regions[0].add_annotation).to.have.been.called
		expect(block.regions[1].add_annotation).to.have.been.called
		expect(block.regions[2].add_annotation).to.have.been.called
		expect(block.regions[3].add_annotation).to.not.have.been.called
		
		expect(block.regions[0].add_annotation.args[0][0]).to.equal(4)
		expect(block.regions[0].add_annotation.args[0][1]).to.equal(11)
		expect(block.regions[0].add_annotation.args[0][2]).to.equal(proto_ann)
		expect(block.regions[1].add_annotation.args[0][0]).to.equal(0)
		expect(block.regions[1].add_annotation.args[0][1]).to.equal(15)
		expect(block.regions[1].add_annotation.args[0][2]).to.equal(proto_ann)
		expect(block.regions[2].add_annotation.args[0][0]).to.equal(0)
		expect(block.regions[2].add_annotation.args[0][1]).to.equal(3)
		expect(block.regions[2].add_annotation.args[0][2]).to.equal(proto_ann)
		
		expect(new_block.regions.length).to.equal(4)
		expect(new_block.regions[0]).to.equal('foo')
		expect(new_block.regions[1]).to.equal('bar')
		expect(new_block.regions[2]).to.equal('baz')
		expect(new_block.regions[3]).to.equal(block.regions[3])
	}))
	
	it('can remove annotations in a range that match a prototype annotation', sinon.test(function ()
	{
		var block = new Block({
				regions: [
					new TextRegion({ text: 'Foo bar baz'}),
					new TextRegion({ text: 'Qux quack quint' }),
					new TextRegion({ text: 'Zux Zuack Zuint' }),
					new TextRegion({ text: 'Xuz Kcauz Tniuz' })
				]
			}),
			proto_ann = new Annotation({ type: new AnnotationType() })
		
		this.stub(block.regions[0], 'remove_annotation').returns('foo')
		this.stub(block.regions[1], 'remove_annotation').returns('bar')
		this.stub(block.regions[2], 'remove_annotation').returns('baz')
		this.stub(block.regions[3], 'remove_annotation').returns('qux')
		
		var new_block = block.remove_annotation(
			{ region: 0, offset: 4 },
			{ region: 2, offset: 3 },
			proto_ann
		)
		
		expect(block.regions[0].remove_annotation).to.have.been.called
		expect(block.regions[1].remove_annotation).to.have.been.called
		expect(block.regions[2].remove_annotation).to.have.been.called
		expect(block.regions[3].remove_annotation).to.not.have.been.called
		
		expect(block.regions[0].remove_annotation.args[0][0]).to.equal(4)
		expect(block.regions[0].remove_annotation.args[0][1]).to.equal(11)
		expect(block.regions[0].remove_annotation.args[0][2]).to.equal(proto_ann)
		expect(block.regions[1].remove_annotation.args[0][0]).to.equal(0)
		expect(block.regions[1].remove_annotation.args[0][1]).to.equal(15)
		expect(block.regions[1].remove_annotation.args[0][2]).to.equal(proto_ann)
		expect(block.regions[2].remove_annotation.args[0][0]).to.equal(0)
		expect(block.regions[2].remove_annotation.args[0][1]).to.equal(3)
		expect(block.regions[2].remove_annotation.args[0][2]).to.equal(proto_ann)
		
		expect(new_block.regions.length).to.equal(4)
		expect(new_block.regions[0]).to.equal('foo')
		expect(new_block.regions[1]).to.equal('bar')
		expect(new_block.regions[2]).to.equal('baz')
		expect(new_block.regions[3]).to.equal(block.regions[3])
	}))
})