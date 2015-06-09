"use strict"

var model = require('./model'),
	VirtualText = model.VirtualText,
	watch = require('./watch')
	

function render(document, vnode)
{
	if (vnode.render)
	{
		vnode = vnode.render()
	}
	
	if (vnode.dom_node)
	{
		return vnode
	}
	
	if (vnode.constructor == VirtualText)
	{
		vnode.dom_node = document.createTextNode(vnode.text)
	}
	else
	{
		var element = document.createElement(vnode.tag)
		set_properties(element, vnode.properties)
		set_children(document, element, vnode.children)
		vnode.dom_node = element
	}
	
	if (vnode.onchange)
	{
		vnode.watcher = watch({
			vnode: vnode,
			onchange: vnode.onchange
		})
		vnode.watcher.start()
	}
	
	return vnode
}

function set_properties (element, properties)
{
	if (properties.attributes)
	{
		Object.keys(properties.attributes).forEach(function (k)
		{
			element.setAttribute(k, properties.attributes[k])
		})
		
		properties.attributes
	}
	
	if (properties.style)
	{
		Object.keys(properties.style).forEach(function (k)
		{
			element.style[k] = properties.style[k]
		})
		
		properties.style
	}
	
	Object.keys(properties).forEach(function (k)
	{
		if (k != 'attributes' && k != 'style')
		{
			element[k] = properties[k]
		}
	})
}

function set_children(document, element, children)
{
	if (children.length < 1)
	{
		return
	}
	
	children.forEach(function (child)
	{
		if (child.constructor == VirtualText)
		{
			child.dom_node = document.createTextNode(child.text)
			element.appendChild(
				child.dom_node
			)
		}
		else
		{
			element.appendChild(
				render(document, child).dom_node
			)
		}
	})
}

module.exports = render