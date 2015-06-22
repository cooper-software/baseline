"use strict"

var h = require('../vdom').h,
	Model = require('../Model'),
	Block = require('./Block'),
	SimpleBlock = require('./SimpleBlock'),
	TextRegion = require('../regions/TextRegion'),
	DomPoint = require('../selection/DomPoint'),
	Point = require('../selection/Point')

var ColumnsBlock = Model.extend(Block,
{
	columns: 2,
	regions: [ new TextRegion(), new TextRegion() ],
	
	set_columns: function (n)
	{
		if (n > this.columns)
		{
			var num_new_regions = n - this.regions.length,
				new_regions = new Array(num_new_regions)
			
			for (var i=0; i<num_new_regions; i++ )
			{
				new_regions[i] = new TextRegion()
			}
			
			return this.update(
			{
				columns: n,
				regions: this.regions.concat(
					new_regions
				)
			})
		}
		else
		{
			return this.update({
				columns: n,
				regions: this.regions.slice(0, n)
			})
		}
	},
	
	render: function ()
	{
		return h(
			'div',
			{
				className: 'row',
				contentEditable: false
			},
			this.regions.map(function (region)
			{
				return h(
					'div',
					{
						className: 'column span-1-' + this.columns,
						contentEditable: true
					},
					region.render()
				)
			}.bind(this))
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
			blocks: [ this.update({ regions: regions.slice(0, this.columns) }) ],
			point: tuples[0][1]
		}
	},
	
	insert: function (point)
	{
		// assert(point.region >= 0 && point.region < this.regions.length &&
		//        point.offset >= 0 && point.offset < this.regions[point.region].length)
		if (point.region == this.regions.length - 1)
		{
			return {
				blocks: [
					this,
					new SimpleBlock()
				],
				point: new Point(
				{
					block: point.block + 1,
					region: 0,
					offset: 0
				})
			}
		}
		else
		{
			return {
				blocks: [ this ],
				point: point.update(
				{
					region: point.region+1,
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
			var col_node = dom_point.node
			while (col_node.parentNode && col_node.parentNode != block_node)
			{
				col_node = col_node.parentNode
			}
			
			var index = Array.prototype.indexOf.call(block_node.childNodes, col_node)
			
			return {
				region: index,
				offset: this.regions[index].get_offset_of_dom_point(col_node, dom_point)
			}
		}
	},
	
	get_dom_point: function (block_node, point)
	{
		return this.regions[point.region].get_dom_point(block_node.childNodes[point.region], point)
	},
	
	delete_at_boundary: function (point)
	{
		return {
			blocks: [ this ],
			point: point.update(
			{
				region: point.region - 1
			})
		}
	},
	
	append_to: function (block)
	{
		return [block, this]
	}
})

var all_whitespace = /^\s+$/
ColumnsBlock.recognize = function (vnode)
{
	var tag = vnode.tag,
		className = vnode.prop('className')
	
	if (tag == 'DIV' && -1 < (className ? className.split(' ') : []).indexOf('row'))
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
		
		return new ColumnsBlock({
			columns: regions.length,
			regions: regions
		})
	}
}

module.exports = ColumnsBlock