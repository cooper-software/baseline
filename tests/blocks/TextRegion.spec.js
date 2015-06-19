"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	expect = require("chai").expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	AnnotationTreeNode = require('../../baseline/annotations/AnnotationTree'),
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Point = require('../../baseline/selection/Point'),
	DomPoint = require('../../baseline/selection/DomPoint')
	
chai.use(sinon_chai)
	
describe('blocks.TextRegion', function ()
{
	it('has sensible defaults', function ()
	{
		var text = new TextRegion()
		expect(text.text).to.equal('')
		expect(text.annotations.constructor).to.equal(AnnotationTree)
		expect(text.annotations.empty()).to.be.true
	})
	
	it('renders only its text if it has no annotations', function ()
	{
		var text = new TextRegion({ text: 'Foo bar baz' }),
			result = text.render()
		
		expect(result).to.eql(['Foo bar baz'])
	})
	
	it('a single annotation the length of the text renders a single vdom node', function ()
	{
		var text = new TextRegion(
		{
			text: 'foo bar baz',
			annotations: (new AnnotationTree()).add(
				new Annotation(
				{
					type: new AnnotationType({ tag: 'em', attrs: new Set(['q', 'p']), styles: new Set(['x', 'y']) }),
					offset: 0,
					length: 11,
					attrs: {
						q: 'a',
						p: 'b'
					},
					styles: {
						x: 'c',
						y: 'd'
					}
				})
			)
		})
		
		var result = text.render()
		expect(result.constructor).to.equal(Array)
		expect(result.length).to.eql(1)
		expect(result[0].tag).to.equal('EM')
		expect(result[0].properties).to.eql({ q: 'a', p: 'b', style: 'x:c;y:d' })
		expect(result[0].children.length).to.equal(1)
		expect(result[0].children[0].text).to.equal('foo bar baz')
	})
	
	it('renders nested and non-adjacent annotations correctly', function ()
	{
		var bold = new AnnotationType({ tag: 'b', rank: 0 }),
			italic = new AnnotationType({ tag: 'i', rank: 1 }),
			text = new TextRegion(
			{
				text: 'foo bar baz',
				annotations: (new AnnotationTree()).set(
				[
					new Annotation({ type: bold, offset: 2, length: 4 }),
					new Annotation({ type: bold, offset: 9, length: 2 }),
					new Annotation({ type: italic, offset: 4, length: 2 })
				])
			}),
			result = text.render()
		
		/*
		fo
		<b>
			o 
			<i>ba</i>
		</b>
		r b
		<b>
			az
		</b>
		*/
		expect(result.length).to.equal(4)
		expect(result[0]).to.equal('fo')
		expect(result[1].tag).to.equal('B')
		expect(result[1].children.length).to.equal(2)
		expect(result[1].children[0].text).to.equal('o ')
		expect(result[1].children[1].tag).to.equal('I')
		expect(result[1].children[1].children.length).to.equal(1)
		expect(result[1].children[1].children[0].text).to.equal('ba')
		expect(result[2]).to.equal('r b')
		expect(result[3].tag).to.equal('B')
		expect(result[3].children.length).to.equal(1)
		expect(result[3].children[0].text).to.equal('az')
	})

	it('returns correct offset for a node with a single child', function ()
	{
		var region = new TextRegion(),
			root_node = { childNodes: [ {} ] },
			dom_point = { node: root_node.childNodes[0], offset: 11 },
			offset = region.get_offset_of_dom_point(root_node, dom_point)
		
		expect(offset).to.equal(11)
	})
	
	it('returns correct offset for a node with nested children', function ()
	{
		var region = new TextRegion(),
			root_node = {
				childNodes: [
					{
						nodeType: 1,
						childNodes: [
							{
								nodeType: 1,
								childNodes: []
							}
						]
					}
				]
			},
			dom_point = { node: root_node.childNodes[0].childNodes[0], offset: 5 },
			offset = region.get_offset_of_dom_point(root_node, dom_point)
		
		expect(offset).to.equal(5)
	})
	
	it('returns correct offset when there are multiple children', function ()
	{
		var region = new TextRegion(),
			root_node = {
				childNodes: [
					{
						nodeType: 3,
						nodeValue: 'foo'
					},
					{
						nodeType: 3,
						nodeValue: 'bar'
					},
					{
						nodeType: 1,
						childNodes: [
							{
								nodeType: 3,
								nodeValue: 'baz'
							},
							{
								nodeType: 3,
								nodeValue: 'qux'
							}
						]
					}
				]
			},
			dom_point = { node: root_node.childNodes[2].childNodes[1], offset: 5 },
			offset = region.get_offset_of_dom_point(root_node, dom_point)
		
		expect(offset).to.equal(14)
	})
	
	it('returns correct offset when there are multiple children and deep nesting', function ()
	{
		var region = new TextRegion(),
			root_node = {
				childNodes: [
					{
						nodeType: 3,
						nodeValue: 'This is '
					},
					{
						nodeType: 1,
						childNodes: [
							{
								nodeType: 3,
								nodeValue: 'some '
							}
						]
					},
					{
						nodeType: 1,
						childNodes: [
							{
								nodeType: 1,
								childNodes: [
									{
										nodeType: 1,
										childNodes: [
											{
												nodeType: 3,
												nodeValue: 'text'
											}
										]
									}
								]
							}
						]
					}
				]
			},
			dom_point = { node: root_node.childNodes[1].childNodes[0], offset: 2 },
			offset = region.get_offset_of_dom_point(root_node, dom_point)
		
		expect(offset).to.equal(10)
	})
	
	it('returns correct offset when looking past deep nesting', function ()
	{
		var region = new TextRegion(),
			root_node = {
				childNodes: [
					{
						nodeType: 3,
						nodeValue: 'foo'
					},
					{
						nodeType: 3,
						nodeValue: 'bar'
					},
					{
						nodeType: 1,
						childNodes: [
							{
								nodeType: 3,
								nodeValue: 'baz'
							},
							{
								nodeType: 1,
								childNodes: [
									{
										nodeType: 3,
										nodeValue: 'qux'
									},
									{
										nodeType: 1,
										childNodes: []
									}
								]
							}
						]
					},
					{
						nodeType: 3,
						nodeValue: 'quack'
					}
				]
			},
			dom_point = { node: root_node.childNodes[3], offset: 5 },
			offset = region.get_offset_of_dom_point(root_node, dom_point)
		
		expect(offset).to.equal(17)
	})
	
	it('can find the DomPoint for a Point when it has no annotations', function ()
	{
		var region = new TextRegion({ text: 'Foo bar baz' }),
			point = new Point({ offset: 3 }),
			node = document.createElement('p')
		
		node.appendChild(document.createTextNode('Foo bar baz'))
		var dom_point = region.get_dom_point(node, point)
		expect(dom_point.node).to.equal(node.childNodes[0])
		expect(dom_point.offset).to.equal(3)
	})
	
	it('can find the DomPoint for a point when there are annotations', function ()
	{
		var ann_type = new AnnotationType({ tag: 'z' }),
			region = new TextRegion({
				text: 'Foo bar baz',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 4, length: 3, type: ann_type }),
					new Annotation({ offset: 8, length: 3, type: ann_type })
				])
			}),
			point = new Point({ offset: 5 }),
			node = document.createElement('p')
		
		node.innerHTML = 'Foo <z>bar</z> <z>baz</z>'
		
		var dom_point = region.get_dom_point(node, point)
		expect(dom_point.node).to.equal(node.childNodes[1].childNodes[0])
		expect(dom_point.offset).to.equal(1)
	})
	
	it('can find the DomPoint for a point when it is inside an annotation', function ()
	{
		var ann_type = new AnnotationType({ tag: 'z' }),
			region = new TextRegion({
				text: 'Foo bar baz qux',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 4, length: 3, type: ann_type }),
					new Annotation({ offset: 8, length: 3, type: ann_type })
				])
			}),
			point = new Point({ offset: 10 }),
			node = document.createElement('p')
		
		node.innerHTML = 'Foo <z>bar</z> <z>baz</z> qux'
		var dom_point = region.get_dom_point(node, point)
		expect(dom_point.node.nodeName).to.equal('#text')
		expect(dom_point.node.nodeValue).to.equal('baz')
		expect(dom_point.offset).to.equal(2)
	})
	
	it('can delete a range when there are no annotations', function ()
	{
		var region = new TextRegion({ text: 'This is some text' }),
			changed_region = region.delete(1, 5)
		
		expect(region.text).to.equal('This is some text')
		expect(changed_region.text).to.equal('Tis some text')
	})
	
	it('can delete a range when there are annotations', function ()
	{
		var ann_type = new AnnotationType({ tag: 'foo' }),
			region = new TextRegion({
				text: 'This is some text',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 0, length: 5, type: ann_type }),
					new Annotation({ offset: 3, length: 5, type: ann_type }),
					new Annotation({ offset: 12, length: 3, type: ann_type })
				])
			}),
			changed_region = region.delete(1, 5),
			changed_anns = changed_region.annotations.to_array()
		
		expect(changed_region.text).to.equal('Tis some text')
		expect(changed_anns.length).to.equal(2)
		expect(changed_anns[0].offset).to.equal(0)
		expect(changed_anns[0].length).to.equal(4)
		expect(changed_anns[1].offset).to.equal(8)
		expect(changed_anns[1].length).to.equal(3)
	})
	
	it('can merge with another region', function ()
	{
		var ann_type = new AnnotationType({ tag: 'foo' }),
			region_a = new TextRegion(
			{
				text: 'foo',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 0, length: 2, type: ann_type })
				])
			}),
			region_b = new TextRegion(
			{
				text: ' bar',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 1, length: 2, type: ann_type })
				])
			}),
			region_c = region_a.append(region_b)
		
		expect(region_a.text).to.equal('foo')
		var region_a_annotations = region_a.annotations.to_array()
		expect(region_a_annotations.length).to.equal(1)
		expect(region_a_annotations[0].offset).to.equal(0)
		expect(region_a_annotations[0].length).to.equal(2)
		expect(region_b.text).to.equal(' bar')
		var region_b_annotations = region_b.annotations.to_array()
		expect(region_b_annotations.length).to.equal(1)
		expect(region_b_annotations[0].offset).to.equal(1)
		expect(region_b_annotations[0].length).to.equal(2)
		expect(region_c.text).to.equal('foo bar')
		var region_c_annotations = region_c.annotations.to_array()
		expect(region_c_annotations.length).to.equal(2)
		expect(region_c_annotations[0].offset).to.equal(0)
		expect(region_c_annotations[0].length).to.equal(2)
		expect(region_c_annotations[1].offset).to.equal(4)
		expect(region_c_annotations[1].length).to.equal(2)
	})
	
	it('can tell if it has a contiguous annotation matching a prototypical annotation', function ()
	{
		var type_a = new AnnotationType({ tag: 'foo', rank: 2 }),
			type_b = new AnnotationType({ tag: 'bar', rank: 1 }),
			proto_ann = new Annotation({ type: type_a }),
			wrong_proto_ann = new Annotation({ type: type_b }),
			region_a = new TextRegion({
				text: 'Lorem ipsum dolor sit amet',
				annotations: (new AnnotationTree()).concat([
					new Annotation({ offset: 0, length: 11, type: type_a, styles: { color: 'red' }, attrs: { alt: 'Foo' } }),
					new Annotation({ offset: 11, length: 10, type: type_b  }),
					new Annotation({ offset: 11, length: 6, type: type_a, styles: { color: 'red' }, attrs: { alt: 'Foo' } })
				])
			})
		
		var result = region_a.has_annotation(0, 15, proto_ann)
		expect(result).to.be.true
		
		result = region_a.has_annotation(0, 15, wrong_proto_ann)
		expect(result).to.be.false
		
		result = region_a.has_annotation(8, 20, proto_ann)
		expect(result).to.be.false
	})

	it('can add an annotation for a range based on a prototype annotation', sinon.test(function ()
	{
		var region = new TextRegion(),
			ann = new Annotation()
		
		this.stub(ann, "update").returns('foo')
		this.stub(region.annotations, "add").returns('bar')
		
		var new_region = region.add_annotation(5, 25, ann)
		
		expect(ann.update).to.have.been.calledWith({ offset: 5, length: 20 })
		expect(region.annotations.add).to.have.been.calledWith('foo')
		expect(new_region.annotations).to.equal('bar')
	}))
	
	it('can remove all annotations in a range based on a prototype annotation', sinon.test(function ()
	{
		var region = new TextRegion(),
			ann = new Annotation()
		
		this.stub(region.annotations, "clear").returns('bar')
		
		var new_region = region.remove_annotation(5, 25, ann)
		
		expect(region.annotations.clear).to.have.been.calledWith(5, 25, ann)
		expect(new_region.annotations).to.equal('bar')
	}))
})