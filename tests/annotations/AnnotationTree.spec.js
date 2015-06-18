"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTreeNode'),
	AnnotationType = require('../../baseline/annotations/AnnotationType')
	
chai.use(sinon_chai)

describe("annotations.AnnotationTree", function ()
{
	it("has a method to tell if its empty or not", function ()
	{
		var tree1 = new AnnotationTree()
		expect(tree1.empty()).to.be.true
		
		var tree2 = new AnnotationTree(
		{
			root: new AnnotationTreeNode({ annotation: new Annotation({ offset: 0, length: 3 }) })
		})
		expect(tree2.empty()).to.be.false
	})
	
	it("has a method to remove a span", function ()
	{
		var foo = new AnnotationType({ tag: 'FOO', rank: 2 }),
			bar = new AnnotationType({ tag: 'BAR', rank: 1 }),
			tree1 = (new AnnotationTree()).concat(
			[
				new Annotation({ offset: 0, length: 3, type: foo }),
				new Annotation({ offset: 12, length: 8, type: foo }),
				new Annotation({ offset: 52, length: 5, type: foo }),
				new Annotation({ offset: 5, length: 20, type: bar })
			]),
			tree2 = tree1.remove(2, 14)
		
		var anns = tree2.to_array()
		expect(anns.length).to.equal(4)
		expect(anns[0].offset).to.equal(0)
		expect(anns[0].length).to.equal(2)
		expect(anns[0].type).to.equal(foo)
		expect(anns[1].offset).to.equal(2)
		expect(anns[1].length).to.equal(11)
		expect(anns[1].type).to.equal(bar)
		expect(anns[2].offset).to.equal(2)
		expect(anns[2].length).to.equal(6)
		expect(anns[2].type).to.equal(foo)
		expect(anns[3].offset).to.equal(40)
		expect(anns[3].length).to.equal(5)
		expect(anns[3].type).to.equal(foo)
	})
	
	it("has a method to clear a span", function ()
	{
		var foo = new AnnotationType({ tag: 'FOO' }),
			bar = new AnnotationType({ tag: 'BAR' }),
			tree1 = (new AnnotationTree()).concat(
			[
				new Annotation({ offset: 0, length: 3, type: bar }),
				new Annotation({ offset: 0, length: 3, type: foo }),
				new Annotation({ offset: 2, length: 8, type: bar })
			]),
			tree2 = tree1.clear(0, 3, new Annotation({ type: bar }))
		
		var anns = tree2.to_array()
		expect(anns.length).to.equal(2)
		expect(anns[0].offset).to.equal(0)
		expect(anns[0].length).to.equal(3)
		expect(anns[0].type).to.equal(foo)
		expect(anns[1].offset).to.equal(3)
		expect(anns[1].length).to.equal(7)
		expect(anns[1].type).to.equal(bar)
	})
	
	it("can check for a contiguous condition", sinon.test(function ()
	{
		var tree = new AnnotationTree(),
			check = function () {}
		
		this.stub(tree.root, "has_contiguous_condition").returns('foo')
		var result = tree.has_contiguous_condition(10, 20, check)
		
		expect(result).to.equal('foo')
		expect(tree.root.has_contiguous_condition).to.have.been.calledWith(10, 20, check)
	}))
})