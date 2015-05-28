"use strict"

var vdom = require('./vdom'),
	h = vdom.h


var BlockThunk = function (document, block)
{
	this.document = document
	this.block = block
}
BlockThunk.prototype.render = function (previous)
{
	if (previous && previous.vnode && 
		previous.block._version == this.block._version)
	{
		return previous.vnode
	}
	else
	{
		return this.block.render(this.document)
	}
}

var Renderer = function Renderer (options)
{
	options = options || {}
	this.vdom_update = options.vdom_update || vdom.update
	this.vdom_render = options.vdom_render || vdom.render
	this.document = options.document || (typeof document == 'undefined' ? undefined : document)
	this.container = options.container || (this.document ? this.document.createElement('div') : undefined)
	this.tree = null
}

Renderer.prototype.render = function (blocks)
{
	if (this.tree)
	{
		var document = this.document
		var new_tree = h('div', blocks.map(function (x) { return new BlockThunk(document, x) }))
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
	this.tree = blocks.length > 0 ? h('div', blocks.map(function (x) { return x.render() })) : h('div')
	
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

module.exports = Renderer
