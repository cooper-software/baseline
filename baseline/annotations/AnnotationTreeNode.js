"use strict"

var Model = require('mchammer').Model

// Alright, here's the rules...
// 2. The root node MUST NOT have an annotation, all other nodes 
//    MUST have an annotation
// 1. A node may have zero or more children
// 2. The span of a child must completely overlap the span of its parent
// 3. Nodes may be siblings or children but not parents of nodes 
//    with annotations that have higher precedence (lower rank)
// 4. Siblings with contiguous spans that have the same type, 
//    attributes and styles are not allowed
// 5. Children that have the same type, attributes and styles as
//    their parents are not allowed.
module.exports = Model(
{
	annotation: null,
	children: [],
	
	// Insert a new node
	insert: function (node)
	{
		if (!node.annotation)
		{
			throw new Error('Attempting to insert a node without an annotation. Only the root node may not have an annotation.')
		}
		
		if (this.children.length == 0)
		{
			return this.update({ children: [ node ] })
		}
		else
		{
			var new_children = [],
				current_node = node
			
			for (var i=0; i<this.children.length; i++)
			{
				var child = this.children[i]
				
				if ((current_node.annotation.end() == child.annotation.offset ||
					current_node.annotation.offset == child.annotation.end()) &&
					current_node.is_similar(child))
				{
					current_node = current_node.merge(child)
				}
				// If the new node ends before the current child starts, we can 
				// insert the new node here and leave the rest of the children alone
				else if (current_node.annotation.end() <= child.annotation.offset)
				{
					new_children.push(current_node)
					return this.update(
					{
						children: new_children.concat(this.children.slice(i))
					})
				}
				// If the new node starts after the current child ends, keep going
				else if (child.annotation.end() <= current_node.annotation.offset)
				{
					new_children.push(child)
				}
				// If they are overlapping and similar, merge them into one
				else if (child.is_similar(current_node))
				{
					current_node = current_node.merge(child)
				}
				// Otherwise they are different, overlapping annotations that must 
				// be resolved into a hierarchy
				else
				{
					// First we sort by rank
					var a, b
					
					if (child.annotation.type.rank <= current_node.annotation.type.rank)
					{
						a = child
						b = current_node
					}
					else
					{
						a = current_node
						b = child
					}
					
					// If a, the higher precedence node, fully contains b,
					// then b can be inserted into a
					if (a.annotation.contains(b.annotation))
					{
						current_node = a.insert(b)
					}
					// Otherwise b must be split into multiple nodes so that the part
					// that overlaps a can be inserted into a
					else
					{
						var children = a.resolve_overlap(b)
						new_children = new_children.concat(children.slice(0, children.length-1))
						current_node = children[children.length-1]
					}
				}
			}
			
			new_children.push(current_node)
			return this.update({ children: new_children })
		}
	},
	
	resolve_overlap: function (other)
	{
		// assert(this.overlaps(other) && !this.contains(other))
		
		//   0123456789ABCDE
		//   xxxxxxxxxxxxxxx
		// A    |----|
		// B      |------|
		// 
		// A(3,9)
		// B(5,13)
		// ---
		// A(3,9)
		//     B(5,9)
		// B(9,13)
		
		if (this.annotation.offset < other.annotation.offset)
		{
			return [
				this.insert(
					other.truncate(this.annotation.offset, this.annotation.end())
				),
				other.truncate(this.annotation.end(), other.annotation.end())
			]
		}
		else if (other.annotation.offset < this.annotation.offset)
		{
			return [
				other.truncate(other.annotation.offset, this.annotation.offset),
				this.insert(
					other.truncate(this.annotation.offset, other.annotation.end())
				)
			]
		}
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
	
	truncate: function (offset, end)
	{
		// assert(this.overlaps(offset, end))
		
		var length = end - offset
		
		return this.update(
		{
			annotation: this.annotation.union(offset, length),
			children: this.children
						.filter(function (child)
						{
							return child.annotation.overlaps(offset, length)
						})
						.map(function (child)
						{
							return child.truncate(offset, end)
						})
		})
	},
	
	is_similar: function (other)
	{
		if (!this.annotation || !other.annotation)
		{
			return false
		}
		
		return this.annotation.equals(other.annotation, ['type', 'attrs', 'styles'])
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