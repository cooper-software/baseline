"use strict"

var h = require('virtual-dom/h'),
	List = require('../List'),
	Model = require('../Model'),
	Block = require('./Block'),
	TextRegion = require('./TextRegion')

var ListBlock = Model.extend(Block,
{
	list_tag: 'UL',
	item_tag: 'LI',
	regions: List([ new TextRegion() ]),
	
	render: function ()
	{
		var item_tag = this.item_tag
		return h(
			this.list_tag, 
			this.regions.map(function (region)
			{
				return h(item_tag, region.text == '' ? [ h('br') ] : region.render())
			})
		)
	}
})

ListBlock.recognize = function (vnode)
{
	if (vnode.tagName == 'UL' || vnode.tagName == 'OL')
	{
		return new ListBlock({
			list_tag: vnode.tagName,
			regions: List(vnode.children.map(this.parse_region.bind(this)))
		})
	}
}

module.exports = ListBlock