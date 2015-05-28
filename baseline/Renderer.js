"use strict"

var vdom = require('./vdom'),
	h = vdom.h


var BlockThunk = function (block, onchange)
{
	this.onchange = onchange
	this.block = block
}
BlockThunk.prototype.render = function (previous)
{
	if (previous && previous.vnode && 
		previous.block == this.block)
	{
		return previous.vnode
	}
	else
	{
		var vnode = this.block.render()
		vnode.onchange = this.onchange
		return vnode
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
		var new_tree = this.create_tree(blocks)
		this.vdom_update(this.document, this.tree, new_tree)
		this.tree = new_tree
	}
	else
	{
		this.replace(blocks)
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
	
	var vnode = this.vdom_render(this.document, this.tree)
	
	while (vnode.dom_node.firstChild)
	{
		this.container.appendChild(vnode.dom_node.firstChild)
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

module.exports = Renderer
