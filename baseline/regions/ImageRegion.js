"use strict"

var Model = require('../Model'),
	h = require('virtual-dom/h')
	
module.exports = Model(
{
	src: '',
	alt: '',
	width: 0,
	height: 0,
	
	render: function ()
	{
		var attrs = {}
		
		;['src', 'alt', 'width', 'height'].forEach(function (k)
		{
			if (this[k])
			{
				attrs[k] = this[k]
			}
		}.bind(this))
		
		return h('img', attrs)
	}
})