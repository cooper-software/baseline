"use strict"

module.exports = 
{
	DomPoint: require('./DomPoint'),
	Point: require('./Point'),
	Range: require('./Range'),
	
	get_range_from_window: function (window, container, doc)
	{
		var selection = window.getSelection()
		
		if (!selection.anchorNode)
		{
			return null
		}
		
		var is_start_inside = is_inside_doc(container, selection.anchorNode),
			is_end_inside = is_inside_doc(container, selection.focusNode)
			
		if (!is_start_inside && !is_end_inside)
		{
			return null
		}
		
		var dom_start = new DomPoint({ node: selection.anchorNode, offset: selection.anchorOffset }),
			dom_end = new DomPoint({ node: selection.focusNode, offset: selection.focusOffset })
		
		var a = get_doc_point(doc, container, dom_start),
			b = get_doc_point(doc, container, dom_end)
		
		if (a.index > b.index || (a.index == b.index && a.offset > b.offset))
		{
			return new Range({
				start: b,
				end: a
			})
		}
		else
		{
			return new Range({
				start: a,
				end: b
			})
		}
	},

	set_selection_in_window: function (window, container, range)
	{
		
	}
}


var is_inside_doc = function (container, node)
{
	if (node == container)
	{
		return false
	}
	
	while (node.parentNode)
	{
		if (node.parentNode == container)
		{
			return true
		}
		node = node.parentNode
	}
	
	return false
}


var get_doc_point = function (doc, container, dom_point)
{
	var block_node = dom_point.node,
		block_index = -1
	
	while (block_node.parentNode != container)
	{
		block_node = block_node.parentNode
	}
	
	var block_nodes = Array.prototype.slice.apply(container.childNodes)
	for (var i=0; i<block_nodes.length; i++)
	{
		if (block_nodes[i] == block_node)
		{
			block_index = i
			break
		}
	}
	
	if (!block_node || block_index < 0)
	{
		return null
	}
	
	var pos = doc.blocks[block_index].get_position_of_dom_point(block_node, dom_point)
	
	return new Point({
		block: block_index,
		region: pos.region,
		offset: pos.offset
	})
}