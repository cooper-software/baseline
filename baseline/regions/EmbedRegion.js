"use strict"

var Model = require('../Model'),
	h = require('virtual-dom/h')

module.exports = Model(
{
	oembed: null,
	
	render: function ()
	{
		return h('div.oembed', { contenteditable: false, innerHTML: this.oembed })
	}
})