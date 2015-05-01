"use strict"

var h = require('virtual-dom/h'),
	vdom_from_html = require('virtual-html'),
	SimpleBlock = require('./blocks/SimpleBlock'),
	TextRegion = require('./blocks/TextRegion'),
	Annotation = require('./annotations/Annotation'),
	AnnotationTree = require('./annotations/AnnotationTree')

var Parser = function Parser(options)
{
	options = options || {}
	this.block_recognizers = options.block_recognizers || []
	this.annotation_types = options.annotation_types || []
	this.default_block_tag = options.default_block_tag || 'P'
	this.allowed_block_tags = new Set([
		'P', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE'
	])
}

Parser.prototype.parse_html = function (html)
{
	return this.parse_vtree(vdom_from_html(html))
}

Parser.prototype.parse_vtree = function (vtree)
{
	var blocks = []
	
	if (!vtree.children)
	{
		return blocks
	}
	
	vtree.children.forEach(function (vnode)
	{
		var result = this.parse_vnode(vnode)
		
		if (!result)
		{
			return
		}
		
		if (result.constructor == Array)
		{
			blocks = blocks.concat(result)
		}
		else
		{
			blocks.push(result)
		}
	}.bind(this))
	
	return blocks
}

Parser.prototype.parse_vnode = function (vnode)
{
	if (!vnode.tagName)
	{
		return
	}
	
	for (var i=0; i<this.block_recognizers.length; i++)
	{
		var result = this.block_recognizers[i].call(this, vnode)
		
		if (result)
		{
			return result
		}
	}
	
	if (this.allowed_block_tags.has(vnode.tagName))
	{
		return new SimpleBlock({
			tag: vnode.tagName,
			regions: [ this.parse_region(vnode) ]
		})
	}
}

Parser.prototype.parse_region = function (vnode)
{
	if (vnode.children.length == 0)
	{
		return new TextRegion({ text: '' })
	}
	else
	{
		var context = {
			text: '',
			annotations: [],
			annotation_types: this.annotation_types
		}
		
		for (var i=0; i<vnode.children.length; i++)
		{
			this.parse_region_node(context, vnode.children[i])
		}
		
		return new TextRegion({
			text: context.text,
			annotations: context.annotations.length > 0 ? (new AnnotationTree()).concat(context.annotations.reverse()) : new AnnotationTree()
		})
	}
}

Parser.prototype.parse_region_node = function (context, vnode)
{
	if (vnode.text)
	{
		context.text += vnode.text
	}
	else
	{
		var offset = context.text.length
		
		for (var i=0; i<vnode.children.length; i++)
		{
			this.parse_region_node(context, vnode.children[i])
		}
		
		for (var i=0; i<this.annotation_types.length; i++)
		{
			var vnode_props = this.parse_region_node_properties(vnode)
			
			if (this.region_node_matches_annotation_type(vnode.tagName, vnode_props, this.annotation_types[i]))
			{
				context.annotations.push(
					new Annotation({
						type: this.annotation_types[i],
						attrs: vnode_props.attrs,
						styles: vnode_props.styles,
						offset: offset,
						length: context.text.length - offset
					})
				)
				break
			}
		}
	}
}

Parser.prototype.parse_region_node_properties = function (vnode)
{
	var props = {
		attrs: {},
		styles: {}
	}
	
	Object.keys(vnode.properties).forEach(function (k)
	{
		if (k == 'style')
		{
			var pattern = /[\s]*([^:]+):[\s]*([^;]+);?/g,
				match = null
				
				while (match = pattern.exec(vnode.properties.style))
				{
					props.styles[match[1]] = match[2]
				}
		}
		else
		{
			props.attrs[k] = vnode.properties[k]
		}
	})
	
	return props
}

Parser.prototype.region_node_matches_annotation_type = function (vnode_tag, vnode_props, annotation_type)
{
	if (vnode_tag != annotation_type.tag && 
		!annotation_type.tag_aliases.has(vnode_tag))
	{
		return false
	}
	
	for (var i=0; i<annotation_type.attrs; i++)
	{
		if (typeof vnode_props.attrs[annotation_type.attrs[i]] == "undefined")
		{
			return false
		}
	}
	
	for (var i=0; i<annotation_type.styles; i++)
	{
		if (typeof vnode_props.styles[annotation_type.styles[i]] == "undefined")
		{
			return false
		}
	}
	
	return true
}

module.exports = Parser