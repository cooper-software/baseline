var AnnotationType = require('./annotations/AnnotationType'),
	ListBlock = require('./blocks/ListBlock'),
	FigureBlock = require('./blocks/FigureBlock')

module.exports = 
{
	annotation_types: [
		new AnnotationType({
			rank: -10,
			tag: 'CODE'
		}),
		new AnnotationType({
			rank: 0,
			tag: 'A',
			attrs: new Set(['href', 'title', 'target', 'rel'])
		}),
		new AnnotationType({
			rank: 10,
			tag: 'B',
			tag_aliases: new Set(['STRONG'])
		}),
		new AnnotationType({
			rank: 20,
			tag: 'EM',
			tag_aliases: new Set(['I'])
		}),
		new AnnotationType({
			rank: 30,
			tag: 'U'
		}),
		new AnnotationType({
			rank: 40,
			tag: 'S',
			tag_aliases: new Set(['STRIKE', 'DEL'])
		}),
		new AnnotationType({
			rank: 50,
			tag: 'span',
			styles: new Set(['color'])
		})
	],
	
	block_recognizers: [
		ListBlock.recognize,
		FigureBlock.recognize
	]
}