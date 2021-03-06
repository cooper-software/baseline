"use strict"

var Model = require('../Model'),
	AnnotationType = require('./AnnotationType')

module.exports = Model(
{
	offset: 0,
	length: 0,
	type: new AnnotationType({ tag: 'STRONG' }),
	attrs: {},
	styles: {},
	
	end: function ()
	{
		return this.offset + this.length
	},
	
	overlaps: function (offset_or_annotaton, length)
	{
		var range = this._get_range(offset_or_annotaton, length)
		return (this.offset < range.end && this.end() > range.offset) ||
				(range.offset < this.end() && range.end > this.offset)
	},
	
	contains: function (offset_or_annotaton, length)
	{
		var range = this._get_range(offset_or_annotaton, length)
		return this.offset <= range.offset && this.end() >= range.end
	},
	
	union: function (offset_or_annotaton, length)
	{
		var range = this._get_range(offset_or_annotaton, length),
			new_offset = Math.max(range.offset, this.offset),
			new_end = Math.min(range.end, this.end())
		
		if (new_end <= new_offset)
		{
			return null
		}
		
		return this.update(
		{
			offset: new_offset,
			length: new_end - new_offset
		})
	},
	
	is_similar: function (other)
	{
		return Model.equals(this, other, ['type'])
	},
	
	_get_range: function (offset_or_annotaton, length)
	{
		if (length === undefined)
		{
			var offset = offset_or_annotaton.offset,
				end = offset_or_annotaton.end()
			length = offset_or_annotaton.length
		}
		else
		{
			var offset = offset_or_annotaton,
				end = offset + length
		}
		
		return {
			offset: offset,
			length: length,
			end: end
		}
	}
})