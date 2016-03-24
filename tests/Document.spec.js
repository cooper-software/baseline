"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	Document = require('../baseline/Document'),
	Block = require('../baseline/blocks/Block'),
	TextRegion = require('../baseline/regions/TextRegion'),
	Annotation = require('../baseline/annotations/Annotation')
	
chai.use(sinon_chai)

describe('Document', function ()
{
	it('can tell if a range continously matches a prototypical annotation', sinon.test(function ()
	{
		var doc = new Document(
			{
				blocks: [
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] })
				]
			}),
			proto_ann = new Annotation()
		
		this.stub(doc.blocks[0], "has_annotation").returns(true)
		this.stub(doc.blocks[1], "has_annotation").returns(true)
		this.stub(doc.blocks[2], "has_annotation").returns(false)
		this.stub(doc.blocks[3], "has_annotation").returns(true)
		
		var result = doc.has_annotation(
			{
				start: { block: 0, region: 0, offset: 0 },
				end: { block: 0, region: 0, offset: 0 }
			},
			proto_ann
		)
		
		expect(result).to.be.true
		
		expect(doc.blocks[0].has_annotation).to.have.been.called
		expect(doc.blocks[1].has_annotation).to.not.have.been.called
		expect(doc.blocks[2].has_annotation).to.not.have.been.called
		expect(doc.blocks[3].has_annotation).to.not.have.been.called
		expect(doc.blocks[0].has_annotation.args[0][0]).to.deep.equal({ block: 0, region: 0, offset: 0 })
		expect(doc.blocks[0].has_annotation.args[0][1]).to.deep.equal({ block: 0, region: 0, offset: 0 })
		expect(doc.blocks[0].has_annotation.args[0][2]).to.equal(proto_ann)
		
		doc.blocks[0].has_annotation.reset()
		doc.blocks[1].has_annotation.reset()
		doc.blocks[2].has_annotation.reset()
		doc.blocks[3].has_annotation.reset()
		
		result = doc.has_annotation(
			{
				start: { block: 0, region: 0, offset: 0 },
				end: { block: 3, region: 0, offset: 0 }
			},
			proto_ann
		)
		
		expect(result).to.be.false
		
		expect(doc.blocks[0].has_annotation).to.have.been.called
		expect(doc.blocks[1].has_annotation).to.have.been.called
		expect(doc.blocks[2].has_annotation).to.have.been.called
		expect(doc.blocks[3].has_annotation).to.not.have.been.called
		
		expect(doc.blocks[0].has_annotation.args[0][0]).to.deep.equal({ block: 0, region: 0, offset: 0 })
		expect(doc.blocks[0].has_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[0].has_annotation.args[0][2]).to.equal(proto_ann)
		expect(doc.blocks[1].has_annotation.args[0][0]).to.deep.equal({ region: 0, offset: 0 })
		expect(doc.blocks[1].has_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[1].has_annotation.args[0][2]).to.equal(proto_ann)
		expect(doc.blocks[2].has_annotation.args[0][0]).to.deep.equal({ region: 0, offset: 0 })
		expect(doc.blocks[2].has_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[2].has_annotation.args[0][2]).to.equal(proto_ann)
		
		doc.blocks[0].has_annotation.reset()
		doc.blocks[1].has_annotation.reset()
		doc.blocks[2].has_annotation.reset()
		doc.blocks[3].has_annotation.reset()
		
		result = doc.has_annotation(
			{
				start: { block: 0, region: 0, offset: 0 },
				end: { block: 1, region: 0, offset: 0 }
			},
			proto_ann
		)
		
		expect(result).to.be.true
		
		expect(doc.blocks[0].has_annotation).to.have.been.called
		expect(doc.blocks[1].has_annotation).to.have.been.called
		expect(doc.blocks[2].has_annotation).to.not.have.been.called
		expect(doc.blocks[3].has_annotation).to.not.have.been.called
		
		expect(doc.blocks[0].has_annotation.args[0][0]).to.deep.equal({ block: 0, region: 0, offset: 0 })
		expect(doc.blocks[0].has_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[0].has_annotation.args[0][2]).to.equal(proto_ann)
		expect(doc.blocks[1].has_annotation.args[0][0]).to.deep.equal({ region: 0, offset: 0 })
		expect(doc.blocks[1].has_annotation.args[0][1]).to.deep.equal({ block: 1, region: 0, offset: 0 })
		expect(doc.blocks[1].has_annotation.args[0][2]).to.equal(proto_ann)
	}))

	it('can add an annotation for a range', sinon.test(function ()
	{
		var doc = new Document(
			{
				blocks: [
					new Block({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'Foo bar baz' }) ] })
				]
			}),
			proto_ann = new Annotation()
		
		this.stub(doc.blocks[0], "add_annotation")
		this.stub(doc.blocks[1], "add_annotation")
		this.stub(doc.blocks[2], "add_annotation")
		this.stub(doc.blocks[3], "add_annotation")
		
		doc.add_annotation(
			{
				start: { block: 1, region: 0, offset: 0 },
				end: { block: 3, region: 0, offset: 12 }
			},
			proto_ann
		)
		
		expect(doc.blocks[0].add_annotation).to.not.have.been.called
		expect(doc.blocks[1].add_annotation).to.have.been.called
		expect(doc.blocks[2].add_annotation).to.have.been.called
		expect(doc.blocks[3].add_annotation).to.have.been.called
	}))

	it('can remove matching annotations for a range', sinon.test(function ()
	{
		var proto_ann = new Annotation(),
			doc = new Document(
			{
				blocks: [
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] }),
					new Block({ regions: [ new TextRegion({ text: 'foo bar baz' }) ] })
				]
			})
		
		this.stub(doc.blocks[0], "remove_annotation")
		this.stub(doc.blocks[1], "remove_annotation")
		this.stub(doc.blocks[2], "remove_annotation")
		this.stub(doc.blocks[3], "remove_annotation")
		
		doc.remove_annotation(
			{
				start: {
					block: 0,
					region: 0,
					offset: 0
				},
				end: {
					block: 2,
					region: 0,
					offset: 1
				}
			},
			proto_ann
		)
		
		expect(doc.blocks[0].remove_annotation).to.have.been.called
		expect(doc.blocks[1].remove_annotation).to.have.been.called
		expect(doc.blocks[2].remove_annotation).to.have.been.called
		expect(doc.blocks[3].remove_annotation).to.not.have.been.called
		
		expect(doc.blocks[0].remove_annotation.args[0][0]).to.deep.equal({ block: 0, region: 0, offset: 0 })
		expect(doc.blocks[0].remove_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[0].remove_annotation.args[0][2]).to.equal(proto_ann)
		expect(doc.blocks[1].remove_annotation.args[0][0]).to.deep.equal({ region: 0, offset: 0 })
		expect(doc.blocks[1].remove_annotation.args[0][1]).to.deep.equal({ region: 0, offset: 11 })
		expect(doc.blocks[1].remove_annotation.args[0][2]).to.equal(proto_ann)
		expect(doc.blocks[2].remove_annotation.args[0][0]).to.deep.equal({ region: 0, offset: 0 })
		expect(doc.blocks[2].remove_annotation.args[0][1]).to.deep.equal({ block: 2, region: 0, offset: 1 })
		expect(doc.blocks[2].remove_annotation.args[0][2]).to.equal(proto_ann)
	}))
})