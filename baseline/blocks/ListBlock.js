"use strict"

var Model = require('../Model'),
	TextRegion = require('../regions/TextRegion'),
	h = require('virtual-dom/h')

module.exports = Model(
{
	list_tag: 'ul',
	item_tag: 'li',
	text_regions: [],
	
	regions: function ()
	{
		return this.text_regions
	},
	
	render: function ()
	{
		var item_tag = this.item_tag
			
		return h(this.list_tag, this.text_regions.map(function (t)
		{
			return h(item_tag, t.render())
		}))
	},
	
	insert: function (index, region)
	{
		return this.update(
		{
			text_regions: this.text_regions
							.slice(0, index)
							.concat([region])
							.concat(this.text_regions.slice(index))
		})
	},
	
	replace: function (index, region)
	{
		return this.update(
		{
			text_regions: this.text_regions.slice(0, index)
							.concat([region])
							.concat(this.text_regions.slice(index+1))
		})
	},
	
	remove: function (index)
	{
		return this.update(
		{
			text_regions: this.text_regions.slice(0, index).concat(this.text_regions.slice(index+1))
		})
	}
})