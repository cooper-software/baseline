"use strict"

var expect = require("chai").expect,
	Model = require('../../baseline/Model'),
	Annotation = require('../../baseline/annotations/Annotation'),
	AnnotationType = require('../../baseline/annotations/AnnotationType')

describe('annotations.Annotation', function ()
{
	it('has sensible defaults', function ()
	{
		var ann = new Annotation()
		expect(ann.offset).to.eql(0)
		expect(ann.length).to.eql(0)
		expect(Model.equals(ann.type, new AnnotationType({ tag: 'STRONG' }))).to.be.true
		expect(ann.attrs).to.eql({})
		expect(ann.styles).to.eql({})
	})
	
	it('has an end() method', function ()
	{
		var ann = new Annotation({ offset: 2, length: 5 })
		expect(ann.end()).to.eql(7)
	})
	
	it('can tell if another annotation or range is overlapping', function ()
	{
		var a = new Annotation({ offset: 0, length: 5 }),
			b = new Annotation({ offset: 3, length: 18 }),
			c = new Annotation({ offset: 12, length: 2 })
		
		expect(a.overlaps(b)).to.be.true
		expect(a.overlaps(c)).to.be.false
		expect(a.overlaps(1, 3)).to.be.true
		expect(a.overlaps(10, 5)).to.be.false
	})
	
	it('can tell if it contains another annotation or range', function ()
	{
		var a = new Annotation({ offset: 0, length: 5 }),
			b = new Annotation({ offset: 3, length: 1 }),
			c = new Annotation({ offset: 3, length: 18 }),
			d = new Annotation({ offset: 3, length: 2 })
		
		expect(a.contains(b)).to.be.true
		expect(a.contains(c)).to.be.false
		expect(a.contains(1, 4)).to.be.true
		expect(a.contains(10, 5)).to.be.false
		expect(c.contains(d)).to.be.true
	})
	
	it('can get the union with another annotation or range', function ()
	{
		var a = new Annotation({ offset: 3, length: 5 }),
			b = new Annotation({ offset: 6, length: 10 })
		
		var c = a.union(b)
		expect(c.offset).to.eql(6)
		expect(c.length).to.eql(2)
		
		var d = a.union(0, 4)
		expect(d.offset).to.eql(3)
		expect(d.length).to.eql(1)
		
		var e = a.union(12, 3)
		expect(e).to.be.null
	})
})