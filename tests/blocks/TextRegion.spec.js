"use strict"

var expect = require("chai").expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	AnnotationTree = require('../../baseline/annotations/AnnotationTree'),
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType'),
	TextRegion = require('../../baseline/blocks/TextRegion'),
	Point = require('../../baseline/selection/Point'),
	DomPoint = require('../../baseline/selection/DomPoint')
	
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
							{}
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
							{}
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
									{}
								]
							}
						]
					}
				]
			},
			dom_point = { node: root_node.childNodes[2].childNodes[1].childNodes[1], offset: 5 },
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
			point = new Point({ offset: 1 }),
			node = document.createElement('p')
		
		node.innerHTML = 'Foo <z>bar</z> <z>baz</z>'
		
		var dom_point = region.get_dom_point(node, point)
		expect(dom_point.node).to.equal(node.childNodes[0])
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
})