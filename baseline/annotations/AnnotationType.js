"use strict"

/**
 * Describes an annotation in terms of it's tag, allowed element and style attributes.
 * Precendence determines which annotations contain other annotations. For example, if 
 * an annotation with type FOO that has a rank of 1 and one with type BAR that 
 * has a precendence of 100 are overlapping, then BAR may be split during render in order
 * to create a DOM (or other) tree. Here is a visualization:
 * 
 *     |--------------| <- FOO (1)
 *				   |--------| <-- BAR (10)
 * The quick brown fox jumps over the lazy dog.
 *
 * render ->
 *
 * The <FOO>quick brown <BAR>fox</BAR></FOO><BAR> jumps</BAR> over the lazy dog.
 */

var Model = require('../Model')

module.exports = Model(
{
	rank: 1000,
	tag: 'SPAN',
	tag_aliases: new Set([]),
	attrs: new Set([]),
	styles: new Set([]),
	
	compare_rank: function (other)
	{
		return this.rank - other.rank
	}
})