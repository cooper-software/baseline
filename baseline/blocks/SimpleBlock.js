"use strict"

var Model = require('../Model'),
	TextRegion = require('../regions/TextRegion'),
	h = require('virtual-dom/h')

module.exports = Model(
{
	tag: 'p',
	text_region: new TextRegion(),
	
	regions: function ()
	{
		return [ this.text_region ]
	},
	
	render: function ()
	{
		return h(this.tag, this.text_region.render())
	}
})