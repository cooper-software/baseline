"use strict"

var expect = require("chai").expect,
	EmbedRegion = require('../../baseline/regions/EmbedRegion')
	
describe('regions.EmbedRegion', function ()
{
	it('has sensible defaults', function ()
	{
		var region = new EmbedRegion()
		expect(region.oembed).to.be.null
	})
	
	it('renders correctly', function ()
	{
		var region = new EmbedRegion({ oembed: '<b>foo</b>' }),
			result = region.render()
		
		expect(result.tagName).to.equal('DIV')
		expect(result.children.length).to.equal(0)
		expect(result.properties).to.deep.equal({ className: 'oembed', contenteditable: false, innerHTML: '<b>foo</b>' })
	})
})