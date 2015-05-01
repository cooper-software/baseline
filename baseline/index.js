var Annotation = require('./annotations/Annotation'),
	AnnotationType = require('./annotations/AnnotationType'),
	AnnotationTreeNode = require('./annotations/AnnotationTreeNode'),
	foo = new AnnotationType({ tag: 'FOO', rank: 0 }),
	bar = new AnnotationType({ tag: 'BAR', rank: 10 }),
	baz = new AnnotationType({ tag: 'BAZ', rank: 100 }),
	children = [
		new Annotation({ type: bar, offset: 8, length: 5 }),
		new Annotation({ type: baz, offset: 13, length: 4 }),
		new Annotation({ type: bar, offset: 13, length: 4 }),
		new Annotation({ type: foo, offset: 13, length: 4 })
	].map(function (ann) { return new AnnotationTreeNode({ annotation: ann }) })
var node = (new AnnotationTreeNode()).concat(children)

module.exports = 
{
	Editor: require('./Editor')
}