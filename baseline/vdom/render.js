"use strict"

function render(document, vnode)
{
	if (vnode.element)
	{
		return vnode
	}
	
	var element = document.createElement(vnode.tag)
	set_properties(element, vnode.properties)
	
	return vnode.update(
	{
		element: element,
		children: set_children(document, element, vnode.children)
	})
}

function set_properties (element, properties)
{
	if (properties.attributes)
	{
		Object.keys(properties.attributes).forEach(function (k)
		{
			element.setAttribute(k, properties.attributes[k])
		})
		
		delete properties.attributes
	}
	
	if (properties.style)
	{
		Object.keys(properties.style).forEach(function (k)
		{
			element.style[k] = properties.style[k]
		})
		
		delete properties.style
	}
	
	Object.keys(properties).forEach(function (k)
	{
		element[k] = properties[k]
	})
}

function set_children(document, element, children)
{
	if (children.length < 1)
	{
		return children
	}
	
	var new_children = [],
		frag = document.createDocumentFragment()
		
	children.forEach(function (child)
	{
		if (child.constructor == String)
		{
			frag.appendChild(
				document.createTextNode(child)
			)
			
			new_children.push(child)
		}
		else
		{
			var new_child = render(document, child)
			frag.appendChild(new_child.element)
			new_children.push(new_child)
		}
	})
	
	element.appendChild(frag)
	return new_children
}

module.exports = render