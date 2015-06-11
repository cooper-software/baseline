"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	Block = require('../baseline/blocks/Block'),
	Editor = require('../baseline/Editor'),
	Range = require('../baseline/selection/Range'),
	Point = require('../baseline/selection/Point')

chai.use(sinon_chai)

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

	it('has a command to insert a block at the current point', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p><b>This is block one.</b></p><p>This was block two.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		
		var point = new Point({ block: 0, region: 0, offset: 5 })
		editor.range = new Range({ start: point, end: point })
		
		var block_to_split = editor.document.blocks[0]
		sinon.spy(block_to_split, "insert")
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.insert_block(editor)
		editor.range.set_in_window(window, container, editor.document)
		
		expect(block_to_split.insert).to.have.been.called
		var blocks = editor.document.blocks
		expect(blocks.length).to.equal(3)
	})
	
	it('has a command to merge a block with the block before it', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p><b>This is block one.</b></p><p>This was block two.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		
		var point = new Point({ block: 1, region: 0, offset: 0 })
		editor.range = new Range({ start: point, end: point })
		
		var block_to_merge_with = editor.document.blocks[0],
			block_to_merge = editor.document.blocks[1]
		sinon.spy(block_to_merge_with, "append")
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.merge_block_with_previous(editor)
		editor.range.set_in_window(window, container, editor.document)
		
		expect(block_to_merge_with.append).to.have.been.calledWith(block_to_merge)
		var blocks = editor.document.blocks
		expect(blocks.length).to.equal(1)
		expect(blocks[0].regions[0].text).to.equal('This is block one.This was block two.')
		expect(editor.range.is_collapsed()).to.be.true
		expect(editor.range.start.block).to.equal(0)
		expect(editor.range.start.region).to.equal(0)
		expect(editor.range.start.offset).to.equal(18)
	})
})