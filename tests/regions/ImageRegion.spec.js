"use strict"

var expect = require("chai").expect,
	ImageRegion = require('../../baseline/regions/ImageRegion')
	
describe('regions.ImageRegion', function ()
{
	it('has sensible defaults', function ()
	{
		var region = new ImageRegion()
		expect(region.src).to.equal('')
		expect(region.alt).to.equal('')
		expect(region.width).to.equal(0)
		expect(region.height).to.equal(0)
	})
	
	it('renders correctly', function ()
	{
		var region1 = new ImageRegion(),
			result1 = region1.render()
		
		expect(result1.tagName).to.equal('IMG')
		expect(result1.children.length).to.equal(0)
		expect(result1.properties).to.deep.equal({})
		
		var region2 = new ImageRegion({ src: 'foo', alt: 'bar', width: 111, height: 222 }),
			result2 = region2.render()
			
		expect(result2.tagName).to.equal('IMG')
		expect(result2.children.length).to.equal(0)
		expect(result2.properties).to.deep.equal({ src: 'foo', alt: 'bar', width: 111, height: 222 })
	})
})