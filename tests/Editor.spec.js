"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Editor = require('../baseline/Editor')

chai.use(sinon_chai)
require('../dummyselection')(window)

describe('Editor', function ()
{
	beforeEach(function ()
	{
		document._listeners = {}
	})
	
	it('throws an error if there is no container', function ()
	{
		expect(function ()
		{
			new Editor()
		}).to.throw('A container element is required')
	})
	
	it('sets up properties and events on the container', function ()
	{
		var container = document.createElement('div'),
			editor = new Editor(
			{
				dom_window: window,
				container: container
			})
		
		expect(container.contentEditable).to.be.true
		expect(container._listeners.keydown).to.not.be.undefined
		expect(container._listeners.keypress).to.not.be.undefined
		expect(container._listeners.keyup).to.not.be.undefined
		expect(container._listeners.paste).to.not.be.undefined
	})
	
	it('sets up a selection change listener on the document', function ()
	{
		expect(document._listeners.selectionchange).to.be.undefined
		var editor = new Editor(
		{
			dom_window: window,
			container: document.createElement('div')
		})
		expect(document._listeners.selectionchange).to.not.be.undefined
	})
	
	it('parses the container on load', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p>Foo</p><p>Bar</p>'
		var editor = new Editor({
			dom_window: window,
			container: container
		})
		
		expect(editor.document.blocks.length).to.equal(2)
		expect(editor.document.blocks[0].regions.length).to.equal(1)
		expect(editor.document.blocks[0].regions[0].text).to.equal('Foo')
		expect(editor.document.blocks[1].regions.length).to.equal(1)
		expect(editor.document.blocks[1].regions[0].text).to.equal('Bar')
	})
	
	it('grabs the selection from the window on load', function ()
	{
		var selection = window.getSelection(),
			range = document.createRange(),
			container = document.createElement('div')
		
		container.innerHTML = '<p>Foo</p><p>Bar</p>'
		range.setStart(container.childNodes[1].childNodes[0], 1)
		range.setEnd(container.childNodes[1].childNodes[0], 3)
		selection.removeAllRanges()
		selection.addRange(range)
		
		var editor = new Editor({
			dom_window: window,
			container: container
		})
		
		expect(editor.range).to.not.be.undefined
		expect(editor.range.start.block).to.equal(1)
		expect(editor.range.start.region).to.equal(0)
		expect(editor.range.start.offset).to.equal(1)
		expect(editor.range.end.block).to.equal(1)
		expect(editor.range.end.region).to.equal(0)
		expect(editor.range.end.offset).to.equal(3)
	})
	
	it('renders on load', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = 'Foo <p>Bar</p><p>Baz</p>'
		var editor = new Editor({
			dom_window: window,
			container: container
		})
		
		expect(container.childNodes.length).to.equal(2)
		expect(container.childNodes[0].tagName).to.equal('P')
		expect(container.childNodes[0].childNodes.length).to.equal(1)
		expect(container.childNodes[0].childNodes[0].nodeValue).to.equal('Bar')
		expect(container.childNodes[1].tagName).to.equal('P')
		expect(container.childNodes[1].childNodes.length).to.equal(1)
		expect(container.childNodes[1].childNodes[0].nodeValue).to.equal('Baz')
	})
	
	it('calls the renderer with its blocks when rendering', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p>Foo</p><p>Bar</p>'
		var editor = new Editor({
			dom_window: window,
			container: container
		})
		
		sinon.spy(editor.renderer, 'render')
		editor.render()
		expect(editor.renderer.render).to.have.been.calledWith(editor.document.blocks)
	})
})