var Immutable = require('immutable')

var AnnotationType = function AnnotationType(options)
{
	var options = options || {}
	this.precedence = options.precedence || 1000
	this.tag = (options.tag || 'SPAN').toUpperCase()
	this.attrs = Immutable.Set(options.attrs || [])
	this.styles = Immutable.Set(options.styles || [])
}

AnnotationType.prototype.compare_precedence = function (other)
{
	return this.precedence - other.precedence
}

module.exports = AnnotationType