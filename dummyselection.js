"use strict"

var Selection = function (window)
{
	this.window = window
	this.anchorNode = null
	this.anchorOffset = 0
	this.focusNode = null
	this.focusOffset = 0
	this.isCollapsed = true
	this.rangeCount = 0
}

Selection.prototype = 
{
	removeAllRanges: function ()
	{
		this.anchorNode = null
		this.anchorOffset = 0
		this.focusNode = null
		this.focusOffset = 0
		this.isCollapsed = true
		this.rangeCount = 0
	},
	
	addRange: function (range)
	{
		this.rangeCount = 1
		this.anchorNode = range.start.node
		this.anchorOffset = range.start.offset
		this.focusNode = range.end.node
		this.focusOffset = range.end.offset
		this.isCollapsed = range.start.node == range.end.node && 
							range.start.offset == range.end.offset
	}
}

var Range = function ()
{
	this.start = {
		node: null,
		offset: 0
	}
	this.end = {
		node: null,
		offset: 0
	}
}
Range.prototype = 
{
	setStart: function (node, offset)
	{
		this.start.node = node
		this.start.offset = offset
	},
	
	setEnd: function (node, offset)
	{
		this.end.node = node
		this.end.offset = offset
	}
}

module.exports = function (window)
{
	var selection = new Selection(window)
	window.getSelection = function ()
	{
		return selection
	}
	window.document.createRange = function ()
	{
		return new Range()
	}
}