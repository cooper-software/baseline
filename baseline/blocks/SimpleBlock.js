"use strict"

var h = require('virtual-dom/h'),
	Model = require('../Model'),
	Block = require('./Block'),
	TextRegion = require('./TextRegion')

module.exports = Model.extend(Block,
{
	tag: 'P',
	regions: [ new TextRegion() ],
	
	render: function ()
	{
		return h(this.tag, this.regions[0].text == '' ? [ h('br') ] : this.regions[0].render())
	}
})