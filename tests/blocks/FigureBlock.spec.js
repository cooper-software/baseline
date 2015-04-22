"use strict"

var expect = require('chai').expect,
	FigureBlock = require('../../baseline/blocks/FigureBlock'),
	TextRegion = require('../../baseline/regions/TextRegion'),
	ImageRegion = require('../../baseline/regions/ImageRegion')
	
	
describe('blocks.FigureBlock', function ()
{
	it('has sensible defaults', function ()
	{
		var block = new FigureBlock()
		expect(block.figure.constructor).to.equal(ImageRegion)
		expect(block.figure.src).to.equal('')
		expect(block.caption.constructor).to.equal(TextRegion)
		expect(block.caption.annotations.empty()).to.be.true
	})
	
	it('renders correctly without a caption', function ()
	{
		var block = new FigureBlock(
			{
				figure: new ImageRegion({ src: 'foo' })
			}),
			result = block.render()
		
		expect(result.tagName).to.equal('FIGURE')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tagName).to.equal('IMG')
		expect(result.children[0].properties).to.deep.equal({ src: 'foo' })
	})
	
	it('renders correctly with a caption', function ()
	{
		var block = new FigureBlock(
			{
				figure: new ImageRegion({ src: 'foo' }),
				caption: new TextRegion({ text: 'a caption' })
			}),
			result = block.render()
		
		expect(result.tagName).to.equal('FIGURE')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tagName).to.equal('IMG')
		expect(result.children[0].properties).to.deep.equal({ src: 'foo' })
		expect(result.children[1].tagName).to.equal('FIGCAPTION')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].text).to.equal('a caption')
	})
})