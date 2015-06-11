"use strict"

var expect = require("chai").expect,
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTreeNode'),
	AnnotationType = require('../../baseline/annotations/AnnotationType')
	
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
})