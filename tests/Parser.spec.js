"use strict"

var expect = require('chai').expect,
	Parser = require('../baseline/Parser'),
	AnnotationType = require('../baseline/annotations/AnnotationType')
	
describe('Parser', function ()
{
	it('has sensible defaults', function ()
	{
		var parser = new Parser()
		expect(parser.block_recognizers).to.deep.equal([])
		expect(parser.annotation_types).to.deep.equal([])
		expect(parser.default_block_tag).to.equal('P')
		expect(parser.allowed_block_tags).to.deep.equal(new Set(['P', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE']))
	})
	
	it('won\'t parse text outside of a block', function ()
	{
		var parser = new Parser(),
			result = parser.parse_html('sdfgsdfg sdfg')
		
		expect(result).to.deep.equal([])
	})
	
	it('will parse all blocks in its allowed list', function ()
	{
		var parser = new Parser(),
			result = parser.parse_html(
				'<div>'+
					'<p>A</p>'+
					'<h1>B</h1>'+
					'<h2>C</h2>'+
					'<h3>D</h3>'+
					'<h4>E</h4>'+
					'<blockquote>F</blockquote>'+
				'</div>'
			)
		
		expect(result.length).to.equal(6)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('A')
		expect(result[0].regions[0].annotations.empty()).to.be.true
		expect(result[1].tag).to.equal('H1')
		expect(result[1].regions.length).to.equal(1)
		expect(result[1].regions[0].text).to.equal('B')
		expect(result[1].regions[0].annotations.empty()).to.be.true
		expect(result[2].tag).to.equal('H2')
		expect(result[2].regions.length).to.equal(1)
		expect(result[2].regions[0].text).to.equal('C')
		expect(result[2].regions[0].annotations.empty()).to.be.true
		expect(result[3].tag).to.equal('H3')
		expect(result[3].regions.length).to.equal(1)
		expect(result[3].regions[0].text).to.equal('D')
		expect(result[3].regions[0].annotations.empty()).to.be.true
		expect(result[4].tag).to.equal('H4')
		expect(result[4].regions.length).to.equal(1)
		expect(result[4].regions[0].text).to.equal('E')
		expect(result[4].regions[0].annotations.empty()).to.be.true
		expect(result[5].tag).to.equal('BLOCKQUOTE')
		expect(result[5].regions.length).to.equal(1)
		expect(result[5].regions[0].text).to.equal('F')
		expect(result[5].regions[0].annotations.empty()).to.be.true
	})
	
	it('won\'t parse a block that isn\'t allowed', function ()
	{
		var parser = new Parser(),
			result = parser.parse_html(
				'<div>'+
					'<p>A</p>'+
					'<foo>B</foo>'+
					'<h2>C</h2>'+
				'</div>'
			)
		
		expect(result.length).to.equal(2)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('A')
		expect(result[0].regions[0].annotations.empty()).to.be.true
		expect(result[1].tag).to.equal('H2')
		expect(result[1].regions.length).to.equal(1)
		expect(result[1].regions[0].text).to.equal('C')
		expect(result[1].regions[0].annotations.empty()).to.be.true
	})
	
	it('will use a block recognizer if there is a match', function ()
	{
		var parser = new Parser()
		parser.block_recognizers.push(function (vnode)
		{
			if (vnode.tagName == 'P')
			{
				return 'FOO'
			}
		})
		
		var result = parser.parse_html('<div><p>foo</p></div>')
		expect(result).to.deep.equal(['FOO'])
	})
	
	it('uses itself as the context for the block recognizer', function (done)
	{
		var parser = new Parser()
		parser.block_recognizers.push(function (vnode)
		{
			expect(this).to.equal(parser)
			done()
		})
		
		parser.parse_html('<div><p>foo</p></div>')
	})
	
	it('falls back to a simple block when block recognizers don\'t return anything', function ()
	{
		var parser = new Parser()
		parser.block_recognizers.push(function (vnode){})
		
		var result = parser.parse_html('<div><p>foo</p></div>')
		expect(result.length).to.equal(1)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('foo')
	})
	
	it('uses the first matched block recognizer', function ()
	{
		var parser = new Parser(
			{
				block_recognizers: [
					function () { return 'one' },
					function () { return 'two' }
				]
			}),
			result = parser.parse_html('<div><foo></foo></div>')
		
		expect(result).to.deep.equal(['one'])
	})
	
	it('does not parse unrecognized annotations', function ()
	{
		var parser = new Parser({ annotation_types: [] }),
			result = parser.parse_html('<div><p>Foo bar <strong>baz</strong></p></div>')
		
		expect(result.length).to.equal(1)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('Foo bar baz')
		expect(result[0].regions[0].annotations.empty()).to.be.true
	})
	
	it('parses recognized annotations', function ()
	{
		var parser = new Parser({ annotation_types: [ new AnnotationType({ tag: 'STRONG' }) ] }),
			result = parser.parse_html('<div><p>Foo bar <strong>baz</strong></p></div>')
		
		expect(result.length).to.equal(1)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('Foo bar baz')
		var anns = result[0].regions[0].annotations.to_array()
		expect(anns.length).to.equal(1)
		expect(anns[0].type).to.equal(parser.annotation_types[0])
		expect(anns[0].offset).to.equal(8)
		expect(anns[0].length).to.equal(3)
	})
	
	it('adjust annotations to match rank when parsing', function ()
	{
		var parser = new Parser({
				annotation_types: [
					new AnnotationType({ tag: 'FOO', rank: 0 }),
					new AnnotationType({ tag: 'BAR', rank: 10 })
				]
			}),
			result = parser.parse_html('<div><p>Foo bar <bar>baz <foo>qux</foo></bar></p></div>')
		
		expect(result.length).to.equal(1)
		expect(result[0].tag).to.equal('P')
		expect(result[0].regions.length).to.equal(1)
		expect(result[0].regions[0].text).to.equal('Foo bar baz qux')
		var anns = result[0].regions[0].annotations.to_array()
		expect(anns.length).to.equal(3)
		expect(anns[0].type).to.equal(parser.annotation_types[1])
		expect(anns[0].offset).to.equal(8)
		expect(anns[0].length).to.equal(4)
		expect(anns[1].type).to.equal(parser.annotation_types[0])
		expect(anns[1].offset).to.equal(12)
		expect(anns[1].length).to.equal(3)
		expect(anns[2].type).to.equal(parser.annotation_types[1])
		expect(anns[2].offset).to.equal(12)
		expect(anns[2].length).to.equal(3)
	})
})