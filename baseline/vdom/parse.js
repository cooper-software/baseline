"use strict"

var model = require('./model')

function parse (node, should_map_nodes)
{
	if (node.nodeType == 1)
	{
		return parse_element(node, should_map_nodes)
	}
	else if (node.nodeType == 3)
	{
		return parse_text(node, should_map_nodes)
	}
	else
	{
		return null
	}
}

function parse_element(node, should_map_nodes)
{
	return new model.VirtualElement({
		dom_node: should_map_nodes ? node : null,
		tag: node.tagName,
		properties: {
			attributes: parse_attributes(node),
			style: parse_style(node)
		},
		children: parse_children(node, should_map_nodes)
	})
}

function parse_attributes(node)
{
	var attributes = {}
	for (var i=0; i<node.attributes.length; i++)
	{
		var attr = node.attributes[i]
		
		if (attr.name != 'style')
		{
			attributes[attr.name] = attr.value
		}
	}
	return attributes
}

function parse_style(node)
{
	var style = {}
	for (var i=0; i<node.style.length; i++)
	{
		var n = node.style[i]
		style[n] = node.style.getPropertyValue(n)
	}
	return style
}

function parse_children(node, should_map_nodes)
{
	var children = []
	
	for (var i=0; i<node.childNodes.length; i++)
	{
		var vnode = parse(node.childNodes[i], should_map_nodes)
		if (vnode)
		{
			children.push(vnode)
		}
	}
	
	return children
}

function parse_text(node, should_map_nodes)
{
	return new model.VirtualText(
	{
		dom_node: should_map_nodes ? node : null,
		text: node.nodeValue
	})
}

module.exports = parse