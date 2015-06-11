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
		
		if (this.block.opaque)
		{
			this.vnode.properties.contentEditable = false
		}
		
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
	this.onblockchange = options.onblockchange || function () {}
	this.parser = options.parser
	this.tree = null
}

Renderer.prototype.render = function (blocks)
{
	if (this.tree)
	{
		this.tree.children.forEach(function (thunk)
		{
			thunk.vnode.watcher.stop()
		})
		
		var new_tree = this.create_tree(blocks)
		this.tree = this.vdom_update(this.document, this.tree, new_tree)
	}
	else
	{
		this.replace(blocks)
	}
	
	this.tree.children.forEach(function (thunk)
	{
		thunk.vnode.watcher.start()
	})
	
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
		return h('div', blocks.map(function (x, i) { return new BlockThunk(x, this.onchange.bind(this, i)) }.bind(this)))
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

Renderer.prototype.onchange = function (index)
{
	var thunk = this.tree.children[index],
		vnode = thunk.vnode,
		new_vnode = vdom.parse(vnode.dom_node, true),
		new_block = this.parser.parse_vnode(new_vnode)
		
	if (new_block)
	{
		thunk.vnode = new_vnode
		thunk.vnode.watcher = vnode.watcher
		thunk.block = new_block
	}
	
	if (this.onblockchange)
	{
		this.onblockchange(index, new_block)
	}
}

module.exports = Renderer
