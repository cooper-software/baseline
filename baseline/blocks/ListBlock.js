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
	},
	
	get_position_of_dom_point: function (block_node, dom_point)
	{
		if (dom_point.node == block_node)
		{
			return {
				region: 0,
				offset: 0
			}
		}
		else if (dom_point.node.parentNode == block_node)
		{
			return {
				region: Array.prototype.indexOf.call(block_node.childNodes, dom_point.node),
				offset: dom_point.offset
			}
		}
		else
		{
			var list_node = dom_point.node
			while (list_node.parentNode && list_node.parentNode != block_node)
			{
				list_node = list_node.parentNode
			}
			
			var index = Array.prototype.indexOf.call(block_node.childNodes, list_node)
			
			return {
				region: index,
				offset: this.regions[index].get_offset_of_dom_point(list_node, dom_point)
			}
		}
	},
	
	get_dom_point: function (block_node, point)
	{
		return new DomPoint(
		{
			node: block_node,
			offset: 0
		})
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