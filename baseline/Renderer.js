"use strict"

var vdom = require('./vdom'),
	h = vdom.h


var BlockThunk = function (block, onchange)
{
	this.onchange = onchange
	this.block = block
	this.vnode = null
}
BlockThunk.prototype.render = function (previous)
{
	if (this.vnode)
	{
		return this.vnode
	}
	else if (previous && previous.vnode && 
		previous.block == this.block)
	{
		this.vnode = previous.vnode
		return previous.vnode
	}
	else
	{
		this.vnode = this.block.render()
		this.vnode.onchange = this.onchange
		return this.vnode
	}
}

var Renderer = function Renderer (options)
{
	options = options || {}
	this.vdom_update = options.vdom_update || vdom.update
	this.vdom_render = options.vdom_render || vdom.render
	this.document = options.document || (typeof document == 'undefined' ? undefined : document)
	this.container = options.container || (this.document ? this.document.createElement('div') : undefined)
	this.onchange = options.onchange || function () {}
	this.tree = null
}

Renderer.prototype.render = function (blocks)
{
	if (this.tree)
	{
		if (this.onchange)
		{
			this.tree.children.forEach(function (thunk)
			{
				thunk.vnode.watcher.stop()
			})
		}
		
		var new_tree = this.create_tree(blocks)
		this.tree = this.vdom_update(this.document, this.tree, new_tree)
	}
	else
	{
		this.replace(blocks)
	}
	
	if (this.onchange)
	{
		this.tree.children.forEach(function (thunk)
		{
			thunk.vnode.watcher.start()
		})
	}
	
	return this.tree
}

Renderer.prototype.replace = function (blocks)
{
	this.tree = this.create_tree(blocks)
	while (this.container.lastChild)
	{
	    this.container.removeChild(this.container.lastChild);
	}
	
	this.tree = this.vdom_render(this.document, this.tree)
	
	while (this.tree.dom_node.firstChild)
	{
		this.container.appendChild(this.tree.dom_node.firstChild)
	}
	
	this.tree.dom_node = this.container
}

Renderer.prototype.create_tree = function (blocks)
{
	if (blocks.length > 0)
	{
		return h('div', blocks.map(function (x, i) { return new BlockThunk(x, this.onchange.bind(null, i)) }.bind(this)))
	}
	else
	{
		return h('div')
	}
}

Renderer.prototype.to_html = function (blocks)
{
	return this.tree.dom_node.innerHTML
}

module.exports = Renderer
