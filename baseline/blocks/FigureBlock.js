"use strict"

var Model = require('../Model'),
	TextRegion = require('../regions/TextRegion'),
	ImageRegion = require('../regions/ImageRegion'),
	h = require('virtual-dom/h')
	
module.exports = Model(
{
	figure: new ImageRegion(),
	caption: new TextRegion(),
	
	regions: function ()
	{
		return [this.figure, this.caption]
	},
	
	render: function ()
	{
		var children = [this.figure.render()]
		
		if (this.caption.text)
		{
			children.push(h('figcaption', [ this.caption.render() ]))
		}
		
		return h('figure', children)
	}
})