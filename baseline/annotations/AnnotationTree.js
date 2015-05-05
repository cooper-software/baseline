"use strict"

var Model = require('mchammer').Model,
	AnnotationTreeNode = require('./AnnotationTreeNode')

module.exports = Model(
{
	root: new AnnotationTreeNode(),
	
	empty: function ()
	{
		return (!this.root.annotation) && this.root.children.length == 0
	},
	
	add: function (annotation)
	{
		return this.update(
		{
			root: this.root.insert(new AnnotationTreeNode({ annotation: annotation }))
		})
	},
	
	set: function (annotations)
	{
		return this.concat(
			annotations, 
			new AnnotationTreeNode()
		)
	},
	
	concat: function (annotations, node)
	{
		var root = node || this.root
		return this.update(
		{
			root: root.concat(annotations.map(function (x) { return new AnnotationTreeNode({ annotation: x }) }))
		})
	},
	
	each: function (fn)
	{
		this.root.walk(fn)
	},
	
	map: function ()
	{
		var results = []
		this.root.walk(function (ann)
		{
			results.push(fn(ann))
		})
		return this.set(results)
	},
	
	filter: function ()
	{
		var results = []
		this.root.walk(function (ann)
		{
			if (fn(ann))
			{
				results.push()
			}
		})
		return this.set(results)
	},
	
	in_range: function (offset, length)
	{
		return this.filter(function (ann)
		{
			return ann.overlaps(offset, length)
		})
	},
	
	remove_and_collapse: function (start, end)
	{
		return this.filter(function (ann)
		{
			ann.remove_and_collapse(start, end-start)
			return ann.length != 0
		})
	},
	
	remove: function (start, end, type)
	{
		var new_annotations = [],
			length = end-start
			
		this.each(function (ann)
		{
			if (ann.type != type)
			{
				new_annotations.push(ann)
				return
			}
			else if (ann.start >= start && ann.end() <= end)
			{
				return
			}
			else if (start > ann.offset && end < ann.end())
			{
				var before = ann.union(ann.offset, start - ann.offset),
					after = ann.union(end, ann.end() - end)
				
				if (before.length > 0)
				{
					new_annotations.push(before)
				}
				if (after.length > 0)
				{
					new_annotations.push(after)
				}
			}
			else if (ann.overlaps(start, length))
			{
				var new_length = ann.length,
					new_offset = ann.offset
					
				if (end < ann.end())
				{
					new_length = ann.length - (end - ann.offset)
					new_offset = end
				}
				else
				{
					new_length = start - ann.offset
				}
				
				if (new_length > 0)
				{
					new_annotations.push(ann.update(
					{
						offset: new_offset,
						length: new_length
					}))
				}
			}
			else
			{
				new_annotations.push(ann)
			}
		})
		return this.set(new_annotations)
	},
	
	has_contiguous_condition: function (start, end, has_condition)
	{
		return this.root.has_contiguous_condition(start, end, has_condition)
	},
	
	to_array: function ()
	{
		return this.root.annotations()
	}
})