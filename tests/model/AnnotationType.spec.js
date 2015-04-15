"use strict"

var AnnotationType = require('../../baseline/model/AnnotationType'),
	Immutable = require('immutable'),
	expect = require("chai").expect
	
	
describe('model.AnnotationType', function ()
{
	it('has sensible defaults', function ()
	{
		var annotation_type = new AnnotationType()
		expect(annotation_type.precedence).to.equal(1000)
		expect(annotation_type.tag).to.equal('SPAN')
		expect(annotation_type.attrs).to.be.an.instanceof(Immutable.Set)
		expect(annotation_type.attrs.size).to.equal(0)
		expect(annotation_type.styles).to.be.an.instanceof(Immutable.Set)
		expect(annotation_type.styles.size).to.equal(0)
	})
	
	it('can be configured with an options object', function ()
	{
		var annotation_type = new AnnotationType(
		{
			precedence: 23,
			tag: 'floop',
			attrs: ['foo', 'bar'],
			styles: ['baz', 'qux']
		})
		
		expect(annotation_type.precedence).to.eql(23)
		expect(annotation_type.tag).to.eql('FLOOP')
		expect(annotation_type.attrs.toArray()).to.eql(['foo', 'bar'])
		expect(annotation_type.styles.toArray()).to.eql(['baz', 'qux'])
	})
	
	it('can compare its precendence with another', function ()
	{
		var a = new AnnotationType({ precedence: 1 }),
			b = new AnnotationType({ precedence: 100 }),
			c = new AnnotationType({ precedence: 1 })
		
		expect(a.compare_precedence(b)).to.be.below(0)
		expect(b.compare_precedence(a)).to.be.above(0)
		expect(a.compare_precedence(c)).to.equal(0)
	})
})