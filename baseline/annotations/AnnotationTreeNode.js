"use strict"

var Model = require('../Model')

module.exports = Model(
{
	annotation: null,
	children: [],
	
	/*
	 * Inserts an annotation into this tree. Annotations are kept in sorted order. 
	 * Overlapping annotations are split to enforce non-overlapping. Annotations may contain
	 * other annotations but they may not partially overlap.
	 */
	insert: function (node)
	{
		if (this.children.length == 0)
		{
			return this.update({ children: [node] })
		}
		else
		{
			var new_children = [],
				found_home = false
			
			for (var i=0; i<this.children.length; i++)
			{
				var child = this.children[i]
				
				// If the new node is before a child, insert it and we're done
				if (node.annotation.end() < child.annotation.offset)
				{
					new_children.push(node)
					new_children.push(child)
					found_home = true
					break
				}
				// If the end of the new node is adjacent to the beginning
				// of the child and they are similar, then merge them
				else if (node.annotation.end() == child.annotation.offset &&
							node.annotation.is_similar(child.annotation))
				{
					node.merge(child)
					new_children.push(node)
					found_home = true
					break
				}
				// If the new node overlaps the child, resolve the overlap
				// and continue to loop, checking for more overlap/adjacency conditions
				else if (node.annotation.overlaps(child.annotation))
				{
					var nodes = this.resolve_overlap(node, child)
					if (nodes.length > 1)
					{
						new_children = new_children.concat(nodes.slice(0,nodes.length-1))
					}
					node = nodes[nodes.length-1]
					continue
				}
				// If the end of the child is adjacent to the beginning
				// of the new node and they are similar, then merge them
				else if (child.annotation.end() == node.annotation.offset &&
							node.annotation.is_similar(child.annotation))
				{
					child.merge(node)
					new_children.push(child)
					found_home = true
					break
				}
				else
				{
					new_children.push(child)
				}
			}
			
			if (!found_home)
			{
				new_children.push(node)
			}
			
			return this.update({
				children: new_children.concat(this.children.slice(i+1))
			})
		}
	},
	
	concat: function (nodes)
	{
		var cur = this
		nodes.forEach(function (n)
		{
			cur = cur.insert(n)
		})
		return cur
	},
	
	resolve_overlap: function (a, b)
	{
		if (a.annotation.type.compare_precedence(b.annotation.type) < 0)
		{
			return this.resolve_enclosing_overlap(a, b)
		}
		else if (b.annotation.type.compare_precedence(a.annotation.type) < 0)
		{
			return this.resolve_enclosing_overlap(b, a)
		}
		else if (a.annotation.equals(b.annotation, ['type', 'attrs', 'style']))
		{
			return [ a.merge(b) ]
		}
		else
		{
			return this.resolve_enclosing_overlap(a, b)
		}
	},
	
	resolve_enclosing_overlap: function (a, b)
	{
		// If a completely contains b then add b to a's children...
		if (a.annotation.contains(b.annotation))
		{
			return [ a.insert(b) ]
		}
		// ...otherwise split b up into an overlapping node and one or more 
		// non-overlapping nodes and add the overlapping node to a's children.
		else
		{
			var nodes = []
			
			if (b.annotation.offset < a.annotation.offset)
			{
				nodes.push(
					b.union(b.annotation.offset, a.annotation.offset - b.annotation.offset)
				)
			}
			
			var end = Math.min(a.annotation.end(), b.annotation.end())
			if (end > a.annotation.offset)
			{
				a = a.insert(
					b.union(
						a.annotation.offset,
						end - a.annotation.offset
					)
				)
			}
			
			nodes.push(a)
			
			if (b.annotation.end() > a.annotation.end())
			{
				nodes.push(
					b.union(
						a.annotation.end(),
						b.annotation.end()
					)
				)
			}
			
			return nodes
		}
	},
	
	union: function (offset, length)
	{
		return this.update(
		{
			annotation: this.annotation ? this.annotation.union(offset, length) : null,
			children: this.children
						.filter(function (child)
						{
							return child.overlaps(offset, length)
						})
						.map(function (child)
						{
							return child.union(offset, length)
						})
		})
	},
	
	merge: function (other)
	{
		var node = this
		
		if (node.annotation && other.annotation)
		{
			var offset = Math.min(node.annotation.offset, other.annotation.offset),
				end = Math.max(node.annotation.end(), other.annotation.end())
				
			node = node.update(
			{
				annotation: node.annotation.update(
				{
					offset: offset,
					length: end - offset
				})
			})
		}
		else if (other.annotation)
		{
			node = node.update({
				annotation: other.annotation
			})
		}
		
		if (other.children.length > 0)
		{
			return node.concat(other.children)
		}
		else
		{
			return node
		}
	},
	
	annotations: function ()
	{
		var annotations = []
		
		this.walk(function (ann)
		{
			annotations.push(ann)
		})
		
		return annotations
	},
	
	walk: function (fn)
	{
		if (this.annotation)
		{
			fn(this.annotation)
		}
		
		this.children.forEach(function (child)
		{
			child.walk(fn)
		})
	},
	
	has_contiguous_condition: function (start, end, has_condition)
	{
		var ann_start = -1,
			ann_end = -1,
			has_gap = false,
			annotations = this.annotations()
		
		for (var i=0; i<annotations.length; i++)
		{
			var ann = annotations[i]
			
			if (!ann.overlaps(start, end-start))
			{
				continue
			}
			
			if (has_condition(ann))
			{
				if (ann_start < 0)
				{
					if (ann.offset > start)
					{
						return false
					}
					else
					{
						ann_start = ann.offset
						ann_end = ann.end()
					}
				}
				else
				{
					if (ann.offset > ann_end)
					{
						return false
					}
					else
					{
						ann_end = ann.end()
					}
				}
			}
		}
		
		if (ann_start < 0 || ann_start > start || ann_end < end)
		{
			return false
		}
		else
		{
			return true
		}
	},
	
	to_string: function (depth)
	{
		depth = depth || 0
		var spaces = []
		for (var i=0; i<depth; i++)
		{
			spaces.push(' ')
		}
		var indent = spaces.join('')
		
		var str = indent
		
		if (this.annotation)
		{
			str += [this.annotation.type.tag, this.annotation.offset, this.annotation.length].join(' ')
		}
		else
		{
			str += 'NULL'
		}
		
		if (this.children.length > 0)
		{
			str += '\n' + this.children.map(function (c){ return c.to_string(depth + 1) }).join('\n')
		}
		
		return str
	}
})
