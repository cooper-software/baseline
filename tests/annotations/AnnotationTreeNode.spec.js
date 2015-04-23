"use strict"

var expect = require("chai").expect,
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTreeNode'),
	
	type_a = new AnnotationType({ tag: 'a', precedence: 0 }),
	type_b = new AnnotationType({ tag: 'b', precedence: 1 }),
	type_c = new AnnotationType({ tag: 'c', precedence: 2 })

describe("annotations.AnnotationTreeNode", function ()
{
	it("has an annotation and a list of children", function ()
	{
		var ann = new Annotation(),
			node = new AnnotationTreeNode({ annotation: ann })
		
		expect(node.annotation).to.eql(ann)
		expect(node.children).to.eql([])
	})
	
	it("adds a node directly to its children when inserting", function ()
	{
		var node = new AnnotationTreeNode(),
			ann = new Annotation({ offset: 0, length: 5, type: type_a }),
			node_with_child = node.insert(new AnnotationTreeNode({ annotation: ann }))
		
		expect(node.children.length).to.equal(0)
		expect(node_with_child.children.length).to.equal(1)
		expect(node_with_child.children[0].annotation).to.eql(ann)
		expect(node_with_child.children[0].children.length).to.equal(0)
	})
	
	it("maintains offset order when inserting non-overlapping nodes", function ()
	{
		var ann1 = new Annotation({ offset: 5, length: 3, type: type_a }),
			ann2 = new Annotation({ offset: 1, length: 2, type: type_a }),
			node1 = new AnnotationTreeNode({ annotation: ann1 }),
			node2 = new AnnotationTreeNode({ annotation: ann2 }),
			root1 = (new AnnotationTreeNode()).concat([node1, node2]),
			root2 = (new AnnotationTreeNode()).concat([node2, node1])
		
		expect(root1.children.length).to.equal(2)
		expect(root1.children[0].annotation).to.eql(ann2)
		expect(root1.children[1].annotation).to.eql(ann1)
		expect(root2.children.length).to.equal(2)
		expect(root2.children[0].annotation).to.eql(ann2)
		expect(root2.children[1].annotation).to.eql(ann1)
	})
	
	it("merges overlapping nodes that have the same type, attributes and styles", function ()
	{
		var ann1 = new Annotation({ offset: 6, length: 5, type: type_a }),
			ann2 = new Annotation({ offset: 8, length: 12, type: type_a }),
			ann3 = new Annotation({ offset: 0, length: 7, type: type_a }),
			ann4 = new Annotation({ offset: 10, length: 2, type: type_a }),
			node1 = (new AnnotationTreeNode()).concat([
						new AnnotationTreeNode({ annotation: ann1 }),
						new AnnotationTreeNode({ annotation: ann2 })
					]),
			node2 = node1.insert(new AnnotationTreeNode({ annotation: ann3 })),
			node3 = node2.insert(new AnnotationTreeNode({ annotation: ann4 }))
		
		expect(node1.children.length).to.equal(1)
		expect(node1.children[0].annotation.offset).to.equal(6)
		expect(node1.children[0].annotation.length).to.equal(14)
		
		expect(node2.children.length).to.equal(1)
		expect(node2.children[0].annotation.offset).to.equal(0)
		expect(node2.children[0].annotation.length).to.equal(20)
		
		expect(node3.children.length).to.equal(1)
		expect(node3.children[0].annotation.offset).to.equal(0)
		expect(node3.children[0].annotation.length).to.equal(20)
	})
	
	it("inserts a contained enclosed node into the containing, enclosing node's children", function ()
	{
		var ann1 = new Annotation({ type: type_a, offset: 3, length: 6 }),
			ann2 = new Annotation({ type: type_b, offset: 5, length: 1 }),
			node1 = new AnnotationTreeNode({ annotation: ann1 }),
			node2 = new AnnotationTreeNode({ annotation: ann2 }),
			node3 = (new AnnotationTreeNode()).concat([node1, node2])
			
		expect(node3.children.length).to.equal(1)
		expect(node3.children[0].annotation).to.eql(node1.annotation)
		expect(node3.children[0].children.length).to.equal(1)
		expect(node3.children[0].children[0].annotation).to.eql(node2.annotation)
	})
	
	it("splits an enclosed node when an enclosing node overlaps it", function ()
	{
		var node1 = (new AnnotationTreeNode()).concat([
				new AnnotationTreeNode({
					annotation: new Annotation({ type: type_a, offset: 3, length: 6 })
				}),
				new AnnotationTreeNode({
					annotation: new Annotation({ type: type_b, offset: 5, length: 8 })
				})	
			]),
			node2 = node1.children[0]
		
		expect(node1.children.length).to.equal(2)
		expect(node1.children[0].annotation.type).to.eql(type_a)
		expect(node1.children[0].annotation.offset).to.equal(3)
		expect(node1.children[0].annotation.length).to.equal(6)
		expect(node1.children[1].annotation.type).to.eql(type_b)
		expect(node1.children[1].annotation.offset).to.equal(9)
		expect(node1.children[1].annotation.length).to.equal(4)
		
		expect(node2.children.length).to.equal(1)
		expect(node2.children[0].annotation.type).to.eql(type_b)
		expect(node2.children[0].annotation.offset).to.equal(5)
		expect(node2.children[0].annotation.length).to.equal(4)
	})
	
	it("splits multiple enclosed nodes when an enclosing node overlaps them", function ()
	{
		var ann1 = new Annotation({ type: type_b, offset: 0, length: 3 }),
			ann2 = new Annotation({ type: type_c, offset: 7, length: 3 }),
			ann3 = new Annotation({ type: type_a, offset: 2, length: 7 }),
			node = (new AnnotationTreeNode).concat([
				new AnnotationTreeNode({ annotation: ann1 }),
				new AnnotationTreeNode({ annotation: ann2 }),
				new AnnotationTreeNode({ annotation: ann3 })
			])
		
		expect(node.children.length).to.eql(3)
		
		var ann = node.children[0].annotation
		expect(ann.type).to.eql(type_b)
		expect(ann.offset).to.eql(0)
		expect(ann.length).to.eql(2)
		
		ann = node.children[1].annotation
		expect(ann.type).to.eql(type_a)
		expect(ann.offset).to.eql(2)
		expect(ann.length).to.eql(7)
		
		ann = node.children[2].annotation
		expect(ann.type).to.eql(type_c)
		expect(ann.offset).to.eql(9)
		expect(ann.length).to.eql(1)
	})
})