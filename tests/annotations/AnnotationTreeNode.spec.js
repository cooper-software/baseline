"use strict"

var expect = require("chai").expect,
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTreeNode'),
	
	type_a = new AnnotationType({ tag: 'a', rank: 0 }),
	type_b = new AnnotationType({ tag: 'b', rank: 1 }),
	type_c = new AnnotationType({ tag: 'c', rank: 2 })

describe("annotations.AnnotationTreeNode", function ()
{
	it("has an annotation and a list of children", function ()
	{
		var ann = new Annotation(),
			node = new AnnotationTreeNode({ annotation: ann })
		
		expect(node.annotation).to.deep.equal(ann)
		expect(node.children).to.deep.equal([])
	})
	
	it("adds a node directly to its children when inserting", function ()
	{
		var node = new AnnotationTreeNode(),
			ann = new Annotation({ offset: 0, length: 5, type: type_a }),
			node_with_child = node.insert(new AnnotationTreeNode({ annotation: ann }))
		
		expect(node.children.length).to.equal(0)
		expect(node_with_child.children.length).to.equal(1)
		expect(node_with_child.children[0].annotation).to.deep.equal(ann)
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
		expect(root1.children[0].annotation).to.deep.equal(ann2)
		expect(root1.children[1].annotation).to.deep.equal(ann1)
		expect(root2.children.length).to.equal(2)
		expect(root2.children[0].annotation).to.deep.equal(ann2)
		expect(root2.children[1].annotation).to.deep.equal(ann1)
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
		var ann1 = new Annotation({ type: type_a, offset: 3, length: 6 })
		var ann2 = new Annotation({ type: type_b, offset: 5, length: 1 })
		var node1 = new AnnotationTreeNode({ annotation: ann1 })
		var node2 = new AnnotationTreeNode({ annotation: ann2 })
		var node3 = (new AnnotationTreeNode()).concat([node1, node2])
		
		expect(node3.children.length).to.equal(1)
		expect(node3.children[0].annotation).to.deep.equal(node1.annotation)
		expect(node3.children[0].children.length).to.equal(1)
		expect(node3.children[0].children[0].annotation).to.deep.equal(node2.annotation)
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
		expect(node1.children[0].annotation.type).to.deep.equal(type_a)
		expect(node1.children[0].annotation.offset).to.equal(3)
		expect(node1.children[0].annotation.length).to.equal(6)
		expect(node1.children[1].annotation.type).to.deep.equal(type_b)
		expect(node1.children[1].annotation.offset).to.equal(9)
		expect(node1.children[1].annotation.length).to.equal(4)
		
		expect(node2.children.length).to.equal(1)
		expect(node2.children[0].annotation.type).to.deep.equal(type_b)
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
		
		expect(node.children.length).to.deep.equal(3)
		
		var ann = node.children[0].annotation
		expect(ann.type).to.deep.equal(type_b)
		expect(ann.offset).to.deep.equal(0)
		expect(ann.length).to.deep.equal(2)
		
		ann = node.children[1].annotation
		expect(ann.type).to.deep.equal(type_a)
		expect(ann.offset).to.deep.equal(2)
		expect(ann.length).to.deep.equal(7)
		
		ann = node.children[2].annotation
		expect(ann.type).to.deep.equal(type_c)
		expect(ann.offset).to.deep.equal(9)
		expect(ann.length).to.deep.equal(1)
	})
	
	it('handles deeply nested, exact overlapping annotations correctly', function ()
	{
		var foo = new AnnotationType({ tag: 'FOO', rank: 0 }),
			bar = new AnnotationType({ tag: 'BAR', rank: 10 }),
			baz = new AnnotationType({ tag: 'BAZ', rank: 100 }),
			node = (new AnnotationTreeNode()).concat([
				new Annotation({ type: bar, offset: 8, length: 5 }),
				new Annotation({ type: baz, offset: 13, length: 4 }),
				new Annotation({ type: bar, offset: 13, length: 4 }),
				new Annotation({ type: foo, offset: 13, length: 4 })
			].map(function (ann) { return new AnnotationTreeNode({ annotation: ann }) }))
			
		expect(node.annotation).to.be.null
		expect(node.children.length).to.equal(2)
		expect(node.children[0].annotation.type.tag).to.equal('BAR')
		expect(node.children[0].annotation.offset).to.equal(8)
		expect(node.children[0].annotation.length).to.equal(5)
		expect(node.children[0].children.length).to.equal(0)
		expect(node.children[1].annotation.type.tag).to.equal('FOO')
		expect(node.children[1].annotation.offset).to.equal(13)
		expect(node.children[1].annotation.length).to.equal(4)
		expect(node.children[1].children.length).to.equal(1)
		expect(node.children[1].children[0].annotation.type.tag).to.equal('BAR')
		expect(node.children[1].children[0].annotation.offset).to.equal(13)
		expect(node.children[1].children[0].annotation.length).to.equal(4)
		expect(node.children[1].children[0].children.length).to.equal(1)
		expect(node.children[1].children[0].children[0].annotation.type.tag).to.equal('BAZ')
		expect(node.children[1].children[0].children[0].annotation.offset).to.equal(13)
		expect(node.children[1].children[0].children[0].annotation.length).to.equal(4)
	})
	
	it('can check if a condition holds continuously across a range', function ()
	{
		var foo = new AnnotationType({ tag: 'FOO', rank: 0 }),
			bar = new AnnotationType({ tag: 'BAR', rank: 10 }),
			node = (new AnnotationTreeNode()).concat([
				new Annotation({ type: bar, offset: 0, length: 8 }),
				new Annotation({ type: foo, offset: 8, length: 5 }),
				new Annotation({ type: bar, offset: 8, length: 3 })
			].map(function (ann) { return new AnnotationTreeNode({ annotation: ann }) }))
		
		var result = node.has_contiguous_condition(0, 10, function (ann)
		{
			return ann.type == bar
		})
		
		expect(result).to.be.true
		
		result = node.has_contiguous_condition(5, 18, function (ann)
		{
			return ann.type == bar
		})
		
		expect(result).to.be.false
	})
})