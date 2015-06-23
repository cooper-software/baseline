"use strict"

var h = require('../vdom').h,
	Model = require('../Model'),
	Block = require('./Block'),
	base_block = new Block(),
	SimpleBlock = require('./SimpleBlock'),
	TextRegion = require('../regions/TextRegion'),
	DomPoint = require('../selection/DomPoint')

var ListBlock = Model.extend(Block,
{
	list_tag: 'UL',
	item_tag: 'LI',
	regions: [ new TextRegion() ],
	
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
	
	convert: function (tuples)
	{
		var regions = []
		tuples.forEach(function (tuple)
		{
			regions = regions.concat(tuple[0].regions)
		})
		return {
			blocks: [ this.update({ regions: regions }) ],
			point: tuples[0][1]
		}
	},
	
	insert: function (point, blocks)
	{
		if (blocks)
		{
			return this.insert_blocks(point, blocks)
		}
		else
		{
			return this.insert_empty(point)
		}
	},
	
	insert_blocks: function (point, blocks)
	{
		return base_block.insert.call(this, point, blocks)
	},
	
	insert_empty: function (point)
	{
		var region = this.regions[point.region]
		
		if (region.text.length == 0 && point.region == this.regions.length - 1)
		{
			return {
				blocks: [
					this.update(
					{
						regions: this.regions
									.slice(0, point.region)
									.concat(
										this.regions.slice(point.region+1)
									)
					}),
					new SimpleBlock()
				],
				point: point.update({
					block: point.block + 1,
					region: 0,
					offset: 0
				})
			}
		}
		else
		{
			return {
				blocks: [
					this.update(
					{
						regions: this.regions
									.slice(0, point.region)
									.concat([ region.delete(point.offset, region.text.length) ])
									.concat([ region.delete(0, point.offset) ])
									.concat(this.regions.slice(point.region+1))
					})
				],
				point: point.update(
				{
					region: point.region + 1,
					offset: 0
				})
			}
		}
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
		return this.regions[point.region].get_dom_point(block_node.childNodes[point.region], point)
	}
})

var all_whitespace = /^\s+$/
ListBlock.recognize = function (vnode)
{
	if (vnode.tag == 'UL' || vnode.tag == 'OL')
	{
		var regions = []
		
		vnode.children.forEach(function (child)
		{
			if (child.tag)
			{
				regions.push(this.parse_region(child))
			}
			else if (child.text && !all_whitespace.test(child.text))
			{
				regions.push(new TextRegion({ text: child.text }))
			}
		}.bind(this))
		
		return new ListBlock({
			list_tag: vnode.tag,
			regions: regions
		})
	}
}

module.exports = ListBlock