"use strict"

var h = require('../vdom').h,
	Model = require('../Model'),
	AnnotationTree = require('../annotations/AnnotationTree'),
	DomPoint = require('../selection/DomPoint')

module.exports = Model(
{
	text: '',
	annotations: new AnnotationTree(),
	
	delete: function (start, end)
	{
		start = Math.max(Math.min(start, this.text.length), 0)
		end = Math.max(Math.min(end, this.text.length), 0)
		
		if (start > end)
		{
			var tmp = start
			start = end
			end = start
		}
		
		return this.update(
		{
			text: this.text.substr(0, start) + this.text.substr(end),
			annotations: this.annotations.remove(start, end)
		})
	},
	
	append: function (region)
	{
		var first_region_text_length = this.text.length
		return this.update(
		{
			text: this.text + region.text,
			annotations: this.annotations.concat(
				region.annotations.to_array().map(function (ann)
				{
					return ann.update({
						offset: ann.offset + first_region_text_length
					})
				})
			)
		})
	},
	
	render: function ()
	{
		var text = this.fix_spaces(this.text)
		
		if (this.annotations.empty())
		{
			return [ text ]
		}
		else
		{
			return this.render_annotation_tree(text, this.annotations.root)
		}
	},
	
	render_annotation_tree: function (text, node)
	{
		var children = [],
			offset = node.annotation ? node.annotation.offset : 0,
			length = node.annotation ? node.annotation.length : text.length,
			end = offset + length
		
		if (node.children.length > 0)
		{
			var last_end = node.annotation ? node.annotation.offset : 0
			node.children.forEach(function (n)
			{
				if (last_end < n.annotation.offset)
				{
					children.push(text.substr(last_end, n.annotation.offset - last_end))
				}
				
				children = children.concat(this.render_annotation_tree(text, n))
				last_end = n.annotation.end()
			}.bind(this))
			
			if (last_end < end)
			{
				children.push(text.substr(last_end, end - last_end))
			}
		}
		else
		{
			children.push(text.substr(offset, length))
		}
		
		if (node.annotation)
		{
			return [this.render_annotation(node.annotation, children)]
		}
		else
		{
			return children
		}
	},
	
	render_annotation: function (annotation, children)
	{
		var attrs = {}
		
		Object.keys(annotation.attrs).forEach(function (k)
		{
			attrs[k] = annotation.attrs[k]
		})
		
		if (Object.keys(annotation.styles).length > 0)
		{
			var styles = []
			Object.keys(annotation.styles).forEach(function (k)
			{
				styles.push(k+':'+annotation.styles[k])
			})
			attrs.style = styles.join(';')
		}
		
		return h(annotation.type.tag, attrs, children)
	},
	
	fix_spaces: function (text)
	{
		return text
				.replace(/\s+/, function (match)
				{
					var spaces = []
					
					for (var i=0; i<match.length; i++)
					{
						spaces.push(i % 2 == 0 ? '\u0020' : '\u00A0')
					}
					
					return spaces.join("")
				})
				.replace(/\s$/, '\u00A0')
	},
	
	get_offset_of_dom_point: function (root_node, dom_point)
	{
		// assert(dom_point inside this region)
		
		var offset = { value: 0 }
		this._get_offset_of_dom_point(root_node, dom_point, offset)
		return offset.value
	},
	
	_get_offset_of_dom_point: function (root_node, dom_point, offset)
	{
		var children = Array.prototype.slice.apply(root_node.childNodes)
		
		for (var i=0; i<children.length; i++)
		{
			var child = children[i]
			
			if (child == dom_point.node)
			{
				offset.value += dom_point.offset
				return -1
			}
			else if (child.nodeType == 3)
			{
				offset.value += child.nodeValue.length
			}
			else if (child.nodeType == 1)
			{
				var result = this._get_offset_of_dom_point(child, dom_point, offset)
				
				if (result < 0)
				{
					return -1
				}
			}
		}
		
		return 1
	},
	
	get_dom_point: function (root_node, point)
	{
		if (this.annotations.empty())
		{
			return new DomPoint({
				node: root_node.firstChild,
				offset: point.offset
			})
		}
		else
		{
			return this._get_dom_point(root_node, point.offset)
		}
	},
	
	_get_dom_point: function (node, offset)
	{
		var children = Array.prototype.slice.call(node.childNodes)
		
		if (children.length > 0)
		{
			for (var i=0; i<children.length; i++)
			{
				var child_node = children[i]
				if (child_node.nodeType == 3) // TEXT_NODE
				{
					if (child_node.nodeValue.length >= offset)
					{
						return new DomPoint({
							node: child_node,
							offset: offset
						})
					}
					else
					{
						offset -= child_node.nodeValue.length
					}
				}
				else
				{
					var match = this._get_dom_point(child_node, offset)
					if (match)
					{
						return match
					}
					else
					{
						offset -= child_node.textContent.length
					}
				}
			}
		}
		else
		{
			return new DomPoint({
				node: node,
				offset: offset
			})
		}
	}
})