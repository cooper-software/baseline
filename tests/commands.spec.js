"use strict"

var expect = require('chai').expect,
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Block = require('../baseline/blocks/Block'),
	Editor = require('../baseline/Editor'),
	Range = require('../baseline/selection/Range'),
	Point = require('../baseline/selection/Point')
	
require('../dummyselection')(window)

describe('baseline.commands', function ()
{
	beforeEach(function ()
	{
		window.getSelection().removeAllRanges()
	})
	
	it('has a command to delete the currently selected range', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p><b>This is block one.</b></p><p>This was block two.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		
		editor.range = new Range({
			start: new Point({ block: 0, region: 0, offset: 7 }), 
			end: new Point({ block: 1, region: 0, offset: 8 })
		})
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.delete_range(editor)
		editor.range.set_in_window(window, container, editor.document)
		
		editor.render()
		
		expect(editor.document.blocks.length).to.equal(1)
		var block = editor.document.blocks[0]
		expect(block.regions.length).to.equal(1)
		var region = block.regions[0]
		expect(region.text).to.equal('This is block two.')
		var annotations = region.annotations.to_array()
		expect(annotations.length).to.equal(1)
		expect(annotations[0].offset).to.equal(0)
		expect(annotations[0].length).to.equal(7)
		expect(editor.range.start.block).to.equal(0)
		expect(editor.range.start.region).to.equal(0)
		expect(editor.range.start.offset).to.equal(7)
		expect(editor.range.is_collapsed()).to.be.true
	})
})