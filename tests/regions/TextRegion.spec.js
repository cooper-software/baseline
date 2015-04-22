"use strict"

var expect = require("chai").expect,
	AnnotationTree = require('../../baseline/annotations/AnnotationTree').AnnotationTree,
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType'),
	TextRegion = require('../../baseline/regions/TextRegion')
	
describe('regions.TextRegion', function ()
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
		expect(result[0].tagName).to.equal('EM')
		expect(result[0].properties).to.eql({ q: 'a', p: 'b', style: 'x:c;y:d' })
		expect(result[0].children.length).to.equal(1)
		expect(result[0].children[0].text).to.equal('foo bar baz')
	})
	
	it('renders nested and non-adjacent annotations correctly', function ()
	{
		var bold = new AnnotationType({ tag: 'b', precedence: 0 }),
			italic = new AnnotationType({ tag: 'i', precedence: 1 }),
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
		expect(result[1].tagName).to.equal('B')
		expect(result[1].children.length).to.equal(2)
		expect(result[1].children[0].text).to.equal('o ')
		expect(result[1].children[1].tagName).to.equal('I')
		expect(result[1].children[1].children.length).to.equal(1)
		expect(result[1].children[1].children[0].text).to.equal('ba')
		expect(result[2]).to.equal('r b')
		expect(result[3].tagName).to.equal('B')
		expect(result[3].children.length).to.equal(1)
		expect(result[3].children[0].text).to.equal('az')
	})
})