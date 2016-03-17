"use strict"

var Model = require('../Model'),
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
	
	filter: function (fn)
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
	
	in_range: function (start, end)
	{
		var offset = start
		var length = end - start
		var matches = []
		this.root.walk(function (ann)
		{
			if (ann.overlaps(offset, length))
			{
				matches.push(ann)
			}
		})
		return matches
	},
	
	remove: function (start, end)
	{
		var new_annotations = []
		
		this.root.walk(function (ann)
		{
			var ann_start = ann.offset,
				ann_end = ann.end(),
				length = end - start
			
			if (ann_end <= start)
			{
				new_annotations.push(ann)
			}
			else if (ann_start >= end)
			{
				new_annotations.push(
					ann.update({
						offset: ann.offset - length
					})
				)
			}
			else
			{
				if (ann_start <= start)
				{
					var new_ann = ann.update(
					{
						offset: ann_start,
						length: start - ann_start
					})
					
					if (new_ann.length > 0)
					{
						new_annotations.push(new_ann)
					}
				}
				
				if (ann_end >= end)
				{
					var new_ann = ann.update(
					{
						offset: start,
						length: ann_end - end
					})
					
					if (new_ann.length > 0)
					{
						new_annotations.push(new_ann)
					}
				}
			}
		})
		
		return this.set(new_annotations)
	},
	
	clear: function (start, end, prototype)
	{
		var new_annotations = []
		
		this.root.walk(function (ann)
		{
			if (prototype && !Model.equals(ann, prototype, ['type']))
			{
				new_annotations.push(ann)
				return
			}
			
			var ann_start = ann.offset,
				ann_end = ann.end(),
				length = end - start
			
			if (ann_end <= start)
			{
				new_annotations.push(ann)
			}
			else if (ann_start >= end)
			{
				new_annotations.push(ann)
			}
			else
			{
				if (ann_start <= start)
				{
					var new_ann = ann.update(
					{
						offset: ann_start,
						length: start - ann_start
					})
					
					if (new_ann.length > 0)
					{
						new_annotations.push(new_ann)
					}
				}
				
				if (ann_end >= end)
				{
					var new_ann = ann.update(
					{
						offset: end,
						length: ann_end - end
					})
					
					if (new_ann.length > 0)
					{
						new_annotations.push(new_ann)
					}
				}
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