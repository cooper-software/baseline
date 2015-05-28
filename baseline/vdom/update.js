"use strict"

var VirtualText = require('./model').VirtualText,
	render = require('./render')

/**
 * Update the dom tree associated with the rendered VNode `a` to match the VNode `b`.
 * Returns a fully rendered VNode.
 */
function update(document, a, b)
{
	if (b.render)
	{
		b = b.render(document, a)
	}
	
	if (a == b)
	{
		return a
	}
	
	if (a.constructor != b.constructor)
	{
		replace(document, a, b)
	}
	else if (a.constructor == VirtualText)
	{
		update_text(document, a, b)
	}
	else if (a.tag != b.tag)
	{
		replace(document, a, b)
	}
	else
	{
		update_properties(a, b)
		update_children(document, a, b)
	}
	
	return b
}

function replace (document, old_vnode, new_vnode)
{
	var vnode = render(document, new_vnode)
	old_vnode.dom_node.parentNode.replaceChild(vnode.dom_node, old_vnode.dom_node)
	return vnode
}

function update_text (document, a, b)
{
	if (a.text != b.text)
	{
		a.dom_node.nodeValue = b.text
		b.dom_node = a.dom_node
	}
	else
	{
		return a
	}
}

function update_properties (a, b)
{
	update_property_objects(
		remove_property, 
		set_property, 
		new Set(['attributes', 'style']),
		a, b,
		a.properties, b.properties)
	
	update_property_objects(
		remove_attribute, 
		set_attribute, 
		null,
		a, b,
		a.properties.attributes || {}, b.properties.attributes || {})
	
	update_property_objects(
		remove_style, 
		set_style, 
		null,
		a, b,
		a.properties.style || {}, b.properties.style || {})
}

function update_property_objects (remove_fn, set_fn, ignore, old_vnode, new_vnode, a, b)
{
	Object.keys(a).forEach(function (k)
	{
		if (ignore && ignore.has(k))
		{
			return
		}
		
		if (b[k] == undefined)
		{
			remove_fn(old_vnode, k)
		}
	})
	
	Object.keys(b).forEach(function (k)
	{
		if (ignore && ignore.has(k))
		{
			return
		}
		
		if (a[k] != b[k])
		{
			set_fn(old_vnode, k, b[k])
		}
	})
}

function set_property (vnode, name, value)
{
	vnode.dom_node[name] = value
}

function set_attribute (vnode, name, value)
{
	vnode.dom_node.setAttribute(name, value)
}

function set_style (vnode, name, value)
{
	vnode.dom_node.style[name] = value
}

function remove_property (vnode, name)
{
	vnode.dom_node[name] = undefined
}

function remove_attribute (vnode, name)
{
	vnode.dom_node.removeAttribute(name)
}

function remove_style (vnode, name)
{
	vnode.dom_node.style[name] = ""
}

/**
 * Moves can be detected if all child VNodes are given keys. If not,
 * a naive positional diff occurs. If you give some keys and others not,
 * undefined things will happen.
 */
function update_children (document, a, b)
{
	b.dom_node = a.dom_node
	
	if (a.children.length == 0 && b.children.length == 0)
	{
		return
	}
	if (a.children.length == 0 && b.children.length > 0)
	{
		append_children(document, a, b)
	}
	else if (a.children.length > 0 && b.children.length == 0)
	{
		remove_children(a)
	}
	else if (a.children.length == 1 && b.children.length == 1)
	{
		update(document, a.children[0], b.children[0])
	}
	else
	{
		if (a.children[0].key && b.children[0].key)
		{
			update_keyed_children(document, a, b)
		}
		else
		{
			update_unkeyed_children(document, a, b)
		}
	}
}

function update_unkeyed_children (document, a, b)
{
	var a_length = a.children.length,
		b_length = b.children.length,
		overlap_length = Math.min(a_length, b_length)
	
	for (var i=0; i<overlap_length; i++)
	{
		update(document, a.children[i], b.children[i])
	}
	
	if (b_length < a_length)
	{
		var parent = a.dom_node
		for (var i=b_length; i<a_length; i++)
		{
			parent.removeChild(a.children[i].dom_node)
		}
	}
	else if (a_length < b_length)
	{
		var parent = a.dom_node
		for (var i=a_length; i<b_length; i++)
		{
			var child = render(document, b.children[i])
			parent.appendChild(child.dom_node)
		}
	}
}

function update_keyed_children (document, a, b)
{
	var a_by_key = {}
	a.children.forEach(function (child)
	{
		a_by_key[child.key] = child
	})
	
	var parent = a.dom_node
	
	b.children.forEach(function (b_child)
	{
		var a_child = a_by_key[b_child.key],
			new_child
		
		delete a_by_key[b_child.key]
		
		if (a_child)
		{
			new_child = update(document, a_child, b_child)
		}
		else
		{
			new_child = render(document, b_child)
		}
		
		parent.appendChild(new_child.dom_node)
	})
	
	Object.keys(a_by_key).forEach(function (k)
	{
		var node = a_by_key[k].dom_node
		node.parentNode.removeChild(node)
	})
}

function append_children (document, old_vnode, new_vnode)
{
	var parent = old_vnode.dom_node
		
	new_vnode.children.forEach(function (child)
	{
		var child_vnode = render(document, child)
		parent.appendChild(child_vnode.dom_node)
	})
}

function remove_children (vnode)
{
	var node = vnode.dom_node
	while (node.lastChild)
	{
		node.removeChild(node.lastChild)
	}
}

module.exports = update