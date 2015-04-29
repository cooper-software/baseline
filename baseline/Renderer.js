"use strict"

var vtree_diff = require('virtual-dom/diff'),
	vdom_patch = require('virtual-dom/patch'),
	vdom_create = require('virtual-dom/create-element'),
	h = require('virtual-dom/h')


var BlockThunk = function (block)
{
	this.block = block
}
BlockThunk.prototype.type = 'Thunk'
BlockThunk.prototype.render = function (previous)
{
	if (previous && previous.vnode && 
		previous.block === this.block)
	{
		return previous.vnode
	}
	else
	{
		return this.block.render()
	}
}


var Renderer = function Renderer (options)
{
	options = options || {}
	this.vtree_diff = options.vtree_diff || vtree_diff
	this.vdom_patch = options.vdom_patch || vdom_patch
	this.vdom_create = options.vdom_create || vdom_create
	this.document = options.document || (typeof document == 'undefined' ? undefined : document)
	this.container = options.container || (this.document ? this.document.createElement('div') : undefined)
	this.tree = null
}

Renderer.prototype.render = function (blocks)
{
	if (this.tree)
	{
		var new_tree = h('div', blocks.map(function (x) { return new BlockThunk(x) })),
			patches = this.vtree_diff(this.tree, new_tree)
		
		this.vdom_patch(this.container, patches)
		this.tree = new_tree
	}
	else
	{
		this.replace(blocks)
	}
}

Renderer.prototype.replace = function (blocks)
{
	this.tree = blocks.length > 0 ? h('div', blocks.map(function (x) { return x.render() })) : h('div')
	
	while (this.container.firstChild)
	{
	    this.container.removeChild(this.container.firstChild);
	}
	
	var element = this.vdom_create(this.tree),
		frag = this.document.createDocumentFragment()
	
	while (element.firstChild)
	{
		frag.appendChild(element.firstChild)
	}
	
	this.container.appendChild(frag)
}

module.exports = Renderer
