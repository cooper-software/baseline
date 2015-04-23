"use strict"

var expect = require("chai").expect,
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTreeNode')
	
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
})