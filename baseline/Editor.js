"use strict"

var h = require('virtual-dom/h'),
	Document = require('./Document'),
	Selection = require('./selection/Selection'),
	AnnotationType = require('./annotations/AnnotationType')


var Editor = function Editor(options)
{
	this.container = options.container
	this.container.contentEditable = true
	this.container.addEventListener('keydown', this.keydown.bind(this))
	this.container.addEventListener('keyup', this.keyup.bind(this))
	this.container.addEventListener('keypress', this.keypress.bind(this))
	this.tree = null
	
	this.document = new Document()
	this.document_stack = []
	
	this.annotation_types = [
		new AnnotationType({
			precedence: -10,
			tag: 'CODE'
		}),
		new AnnotationType({
			precedence: 0,
			tag: 'A',
			attrs: new Set(['href', 'title', 'target', 'rel'])
		}),
		new AnnotationType({
			precedence: 10,
			tag: 'B',
			tag_aliases: new Set(['STRONG'])
		}),
		new AnnotationType({
			precedence: 20,
			tag: 'EM',
			tag_aliases: new Set(['I'])
		}),
		new AnnotationType({
			precedence: 30,
			tag: 'U'
		}),
		new AnnotationType({
			precedence: 40,
			tag: 'S',
			tag_aliases: new Set(['strike', 'del'])
		}),
		new AnnotationType({
			precedence: 50,
			tag: 'span',
			styles: new Set(['color'])
		})
	]
	
	this.selection = new Selection()
	
	this.update_from_presentation()
}

Editor.prototype.update_document = function (props)
{
	this.document_stack.push(this.document)
	this.document = this.document.update(props)
}

Editor.prototype.update_from_presentation = function ()
{
	this.update_document(
	{
		blocks: this.parse('<div>'+this.container.innerHTML+'</div>')
	})
	this.render()
}

Editor.prototype.render = function ()
{
	var new_tree = h('div', this.document.blocks.map(function (x) { return x.render() }))
	
	if (!this.tree)
	{
		this.tree = new_tree
		
		var node = this.container;
		while (node.firstChild)
		{
		    node.removeChild(node.firstChild);
		}
		
		var element = vdom_create(this.tree),
			frag = document.createDocumentFragment()
		
		while (element.firstChild)
		{
			frag.appendChild(element.firstChild)
		}
		
		node.appendChild(frag)
	}
	else
	{
		var patches = vdom_diff(this.tree, new_tree)
		vdom_patch(this.container, patches)
		this.tree = new_tree
	}
}

Editor.prototype.parse = function (html)
{
	
}

Editor.prototype.parse_vtree = function (vtree)
{
	if (vtree.children.length == 0)
	{
		return []
	}
	
	var blocks = []
	
	vtree.children.forEach(function (vnode)
	{
		if (!vnode.tagName)
		{
			return
		}
		
		for (var i=0; i<this.block_types.length; i++)
		{
			var result = this.block_types[i].parse(this, child, blocks.length - 1)
			
			if (result)
			{
				if (result.constructor == Array)
				{
					blocks = blocks.concat(result)
				}
				else
				{
					blocks.push(result)
				}
				
				return
			}
		}
	}.bind(this))
	
	return blocks
}

Editor.prototype.keydown = function (e)
{
	
}

module.exports = Editor