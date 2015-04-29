"use strict"

var expect = require('chai').expect,
	Model = require('../../baseline/Model'),
	Block = require('../../baseline/blocks/Block'),
	FigureBlock = require('../../baseline/blocks/FigureBlock'),
	h = require('virtual-dom/h')

describe('blocks.FigureBlock', function ()
{
	it('is a kind of Block', function ()
	{
		var block = new FigureBlock()
		expect(Model.is_instance(block, Block))
	})
	
	it('has some default properties', function ()
	{
		var block = new FigureBlock()
		expect(block.src).to.equal('')
		expect(block.alt).to.equal('')
		expect(block.caption).to.equal('')
		expect(block.attribution_name).to.equal('')
		expect(block.attribution_url).to.equal('')
		expect(block.width).to.equal(0)
		expect(block.height).to.equal(0)
	})
	
	it('renders correctly when empty', function ()
	{
		var block = new FigureBlock(),
			result = block.render()
		
		expect(result.tagName).to.equal('FIGURE')
		expect(result.children.length).to.equal(1)
		expect(result.children[0].tagName).to.equal('IMG')
		expect(result.children[0].properties.src).to.equal('')
		expect(result.children[0].properties.alt).to.equal('')
		expect(result.children[0].properties.width).to.equal(0)
		expect(result.children[0].properties.height).to.equal(0)
	})
	
	it('renders correctly when all attributes are set', function ()
	{
		var block = new FigureBlock({
				src: 'foo',
				alt: 'bar',
				width: 100,
				height: 200,
				caption: 'Stuff and things',
				attribution_name: 'Fozzy Bear',
				attribution_url: 'http://www.example.com'
			}),
			result = block.render()
		
		expect(result.tagName).to.equal('FIGURE')
		expect(result.children.length).to.equal(2)
		expect(result.children[0].tagName).to.equal('IMG')
		expect(result.children[0].properties.src).to.equal('foo')
		expect(result.children[0].properties.alt).to.equal('bar')
		expect(result.children[0].properties.width).to.equal(100)
		expect(result.children[0].properties.height).to.equal(200)
		expect(result.children[1].tagName).to.equal('FIGCAPTION')
		expect(result.children[1].children.length).to.equal(2)
		expect(result.children[1].children[0].tagName).to.equal('P')
		expect(result.children[1].children[0].properties.className).to.equal('caption')
		expect(result.children[1].children[0].children[0].text).to.equal('Stuff and things')
		expect(result.children[1].children[1].tagName).to.equal('P')
		expect(result.children[1].children[1].properties.className).to.equal('attribution')
		expect(result.children[1].children[1].children.length).to.equal(2)
		expect(result.children[1].children[1].children[0].text).to.equal('By ')
		expect(result.children[1].children[1].children[1].tagName).to.equal('A')
		expect(result.children[1].children[1].children[1].properties.href).to.equal('http://www.example.com')
		expect(result.children[1].children[1].children[1].children.length).to.equal(1)
		expect(result.children[1].children[1].children[1].children[0].text).to.equal('Fozzy Bear')
	})
	
	it('renders correctly with an attribution name but no URL', function ()
	{
		var block = new FigureBlock({ attribution_name: 'Fozzy Bear' }),
			result = block.render()
		
		expect(result.children[1].tagName).to.equal('FIGCAPTION')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].tagName).to.equal('P')
		expect(result.children[1].children[0].properties.className).to.equal('attribution')
		expect(result.children[1].children[0].children[0].text).to.equal('By Fozzy Bear')
	})
	
	it('renders correctly with an attribution URL but no name', function ()
	{
		var block = new FigureBlock({ attribution_name: 'Fozzy Bear', attribution_url: 'http://www.example.com' }),
			result = block.render()
		
		expect(result.children[1].tagName).to.equal('FIGCAPTION')
		expect(result.children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].tagName).to.equal('P')
		expect(result.children[1].children[0].properties.className).to.equal('attribution')
		expect(result.children[1].children[0].children.length).to.equal(2)
		expect(result.children[1].children[0].children[0].text).to.equal('By ')
		expect(result.children[1].children[0].children[1].tagName).to.equal('A')
		expect(result.children[1].children[0].children[1].properties.href).to.equal('http://www.example.com')
		expect(result.children[1].children[0].children[1].children.length).to.equal(1)
		expect(result.children[1].children[0].children[1].children[0].text).to.equal('Fozzy Bear')
	})
	
	it('has a recognizer', function ()
	{
		var vnode = h('figure', [ h('img', { src: 'foo' }) ]),
			block = FigureBlock.recognize(vnode)
		
		expect(block.constructor).to.equal(FigureBlock)
	})
	
	it('won\'t recognize a figure with a missing or empty image', function ()
	{
		var vnode = h('figure', [ h('p', 'stuff') ]),
			block = FigureBlock.recognize(vnode)
		
		expect(block).to.be.undefined
	})
	
	it('will recognize a figure with image, caption and attribution', function ()
	{
		var vnode = h('figure', [
				h('img', { src: 'foo', alt: 'bar', width: 555, height: 2020 }),
				h('figcaption', [
					h('p', { className: 'caption' }, [ 'Foo bar baz' ]),
					h('p', { className: 'attribution' }, [
						'By ',
						h('a', { href: 'http://www.example.com' }, [ 'Fozzy Bear' ])
					])
				])
			]),
			block = FigureBlock.recognize(vnode)
		
		expect(block.constructor).to.equal(FigureBlock)
		expect(block.src).to.equal('foo')
		expect(block.alt).to.equal('bar')
		expect(block.caption).to.equal('Foo bar baz')
		expect(block.attribution_name).to.equal('Fozzy Bear')
		expect(block.attribution_url).to.equal('http://www.example.com')
		expect(block.width).to.equal(555)
		expect(block.height).to.equal(2020)
	})
	
	it('will recognize a figure with a an attribution name, but not a URL', function ()
	{
		var vnode = h('figure', [
				h('img', { src: 'foo' }),
				h('figcaption', [
					h('p', { className: 'caption' }, [ 'Foo bar baz' ]),
					h('p', { className: 'attribution' }, [ 'By Fozzy Bear' ])
				])
			]),
			block = FigureBlock.recognize(vnode)
		
		expect(block.constructor).to.equal(FigureBlock)
		expect(block.attribution_name).to.equal('Fozzy Bear')
		expect(block.attribution_url).to.equal('')
	})
	
	it('will recognize a figure with a an attribution URL, but not a name', function ()
	{
		var vnode = h('figure', [
				h('img', { src: 'foo' }),
				h('figcaption', [
					h('p', { className: 'caption' }, [ 'Foo bar baz' ]),
					h('p', { className: 'attribution' }, [
						'By ',
						h('a', { href: 'http://www.example.com' }, [ 'http://www.example.com' ])
					])
				])
			]),
			block = FigureBlock.recognize(vnode)
		
		expect(block.constructor).to.equal(FigureBlock)
		expect(block.attribution_name).to.equal('')
		expect(block.attribution_url).to.equal('http://www.example.com')
	})
})