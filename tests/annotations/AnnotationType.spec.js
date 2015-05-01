"use strict"

var expect = require("chai").expect,
	AnnotationType = require('../../baseline/annotations/AnnotationType')
	
	
	
describe('annotations.AnnotationType', function ()
{
	it('has sensible defaults', function ()
	{
		var annotation_type = new AnnotationType()
		expect(annotation_type.rank).to.equal(1000)
		expect(annotation_type.tag).to.equal('SPAN')
		expect(annotation_type.attrs).to.be.an.instanceof(Set)
		expect(annotation_type.attrs.size).to.equal(0)
		expect(annotation_type.styles).to.be.an.instanceof(Set)
		expect(annotation_type.styles.size).to.equal(0)
	})
	
	it('can be configured with an options object', function ()
	{
		var annotation_type = new AnnotationType(
		{
			rank: 23,
			tag: 'FLOOP',
			attrs: new Set(['foo', 'bar']),
			styles: new Set(['baz', 'qux'])
		})
		
		expect(annotation_type.rank).to.eql(23)
		expect(annotation_type.tag).to.eql('FLOOP')
		expect(annotation_type.attrs).to.eql(new Set(['foo', 'bar']))
		expect(annotation_type.styles).to.eql(new Set(['baz', 'qux']))
	})
	
	it('can compare its rank with another', function ()
	{
		var a = new AnnotationType({ rank: 1 }),
			b = new AnnotationType({ rank: 100 }),
			c = new AnnotationType({ rank: 1 })
		
		expect(a.compare_rank(b)).to.be.below(0)
		expect(b.compare_rank(a)).to.be.above(0)
		expect(a.compare_rank(c)).to.equal(0)
	})
})
