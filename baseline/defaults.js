var AnnotationType = require('./annotations/AnnotationType'),
	ListBlock = require('./blocks/ListBlock'),
	FigureBlock = require('./blocks/FigureBlock'),
	ColumnsBlock = require('./blocks/ColumnsBlock')

var annotation_types_by_name = {
		code: new AnnotationType({
			rank: -10,
			tag: 'CODE'
		}),
		link: new AnnotationType({
			rank: 0,
			tag: 'A',
			attrs: new Set(['href', 'title', 'target', 'rel'])
		}),
		bold: new AnnotationType({
			rank: 10,
			tag: 'B',
			tag_aliases: new Set(['STRONG'])
		}),
		italic: new AnnotationType({
			rank: 20,
			tag: 'EM',
			tag_aliases: new Set(['I'])
		}),
		underline: new AnnotationType({
			rank: 30,
			tag: 'U'
		}),
		strikethru: new AnnotationType({
			rank: 40,
			tag: 'S',
			tag_aliases: new Set(['STRIKE', 'DEL'])
		}),
		color: new AnnotationType({
			rank: 50,
			tag: 'span',
			styles: new Set(['color'])
		})
}

var annotation_types_list = Object.keys(annotation_types_by_name).map(function (k)
{
	return annotation_types_by_name[k]
})

module.exports = 
{
	annotation_types: annotation_types_list,
	named_annotation_types: annotation_types_by_name,
	
	block_recognizers: [
		ListBlock.recognize,
		FigureBlock.recognize,
		ColumnsBlock.recognize
	],
	
	commands: 
	{
		delete_at_boundary: require('./commands/delete_at_boundary'),
		delete_range: require('./commands/delete_range'),
		insert_block: require('./commands/insert_block'),
		toggle_annotation: require('./commands/toggle_annotation'),
		set_block_type: require('./commands/set_block_type')
	}
}