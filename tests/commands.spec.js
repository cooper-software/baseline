"use strict"

var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinon_chai = require('sinon-chai'),
	window = require('jsdom').jsdom().defaultView,
	document = window.document,
	SimpleBlock = require('../baseline/blocks/SimpleBlock'),
	TextRegion = require('../baseline/regions/TextRegion'),
	Editor = require('../baseline/Editor'),
	Range = require('../baseline/selection/Range'),
	Point = require('../baseline/selection/Point'),
	Annotation = require('../baseline/annotations/Annotation'),
	defaults = require('../baseline/defaults')

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
	
	it('maintains annotations when inserting a new block if the selection is at the end of the block', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p>This is <b>block</b> one.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		var annotations = editor.document.blocks[0].regions[0].annotations.annotations
		expect(annotations.length).to.equal(1)
		expect(annotations[0].type.tag).to.equal('B')
		
		var point = new Point({ block: 0, region: 0, offset: 14 })
		editor.range = new Range({ start: point, end: point })
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.insert_block(editor)
		
		var annotations = editor.document.blocks[0].regions[0].annotations.annotations
		expect(annotations.length).to.equal(1)
		expect(annotations[0].type.tag).to.equal('B')
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
	
	it('can insert multiple blocks at the current point', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p><b>This is block one.</b></p><p>This is block two.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		
		var point = new Point({ block: 0, region: 0, offset: 5 })
		editor.range = new Range({ start: point, end: point })
		
		var block_to_split = editor.document.blocks[0]
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.insert_block(editor, [
			new SimpleBlock({ tag: 'P', regions: [ new TextRegion({ text: 'foo' })] }),
			new SimpleBlock({ tag: 'P', regions: [ new TextRegion({ text: 'bar' })] })
		])
		var blocks = editor.document.blocks
		expect(blocks.length).to.equal(3)
		expect(blocks[0].regions[0].text).to.equal('This foo')
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
		sinon.spy(block_to_merge, "append_to")
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.delete_at_boundary(editor)
		editor.range.set_in_window(window, container, editor.document)
		
		expect(block_to_merge.append_to).to.have.been.calledWith(block_to_merge_with)
		var blocks = editor.document.blocks
		expect(blocks.length).to.equal(1)
		expect(blocks[0].regions[0].text).to.equal('This is block one.This was block two.')
		expect(editor.range.is_collapsed()).to.be.true
		expect(editor.range.start.block).to.equal(0)
		expect(editor.range.start.region).to.equal(0)
		expect(editor.range.start.offset).to.equal(18)
	})

	it('merges regions within a block when delete_at_boundary() is called for a region that is not the first', function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.render()
		
		var point = new Point({ block: 0, region: 1, offset: 0 })
		editor.range = new Range({ start: point, end: point })
		
		var region_to_merge_with = editor.document.blocks[0].regions[0],
			region_to_merge = editor.document.blocks[0].regions[1]
		sinon.spy(region_to_merge_with, "append")
		editor.range.set_in_window(window, container, editor.document)
		editor.commands.delete_at_boundary(editor)
		editor.range.set_in_window(window, container, editor.document)
		
		expect(region_to_merge_with.append).to.have.been.calledWith(region_to_merge)
		var blocks = editor.document.blocks
		expect(blocks.length).to.equal(1)
		expect(blocks[0].regions.length).to.equal(2)
		expect(blocks[0].regions[0].text).to.equal('FooBar')
		expect(blocks[0].regions[1].text).to.equal('Baz')
		expect(editor.range.is_collapsed()).to.be.true
		expect(editor.range.start.block).to.equal(0)
		expect(editor.range.start.region).to.equal(0)
		expect(editor.range.start.offset).to.equal(3)
	})
	
	it('has a command to toggle annotations on and off', sinon.test(function ()
	{
		var container = document.createElement('div')
		container.innerHTML = '<p>This is <b>block one.</b></p><p><b>This was</b> block two.</p>'
		
		var editor = new Editor({
			dom_window: window,
			dom_document: document,
			container: container
		})
		
		editor.range = new Range({
			start: new Point({ block: 0, region: 0, offset: 14 }),
			end: new Point({ block: 1, region: 0, offset: 4 })
		})
		
		var proto_ann = new Annotation({ type: defaults.named_annotation_types.bold }),
			orig_doc = editor.document
		
		this.stub(orig_doc, "has_annotation").returns(true)
		this.stub(orig_doc, "add_annotation").returns(editor.document)
		this.stub(orig_doc, "remove_annotation").returns(editor.document)
		
		editor.commands.toggle_annotation(editor, proto_ann)
		
		expect(orig_doc.has_annotation).to.have.been.called
		expect(orig_doc.has_annotation.args[0][0]).to.equal(editor.range)
		expect(orig_doc.has_annotation.args[0][1]).to.equal(proto_ann)
		
		expect(orig_doc.add_annotation).to.not.have.been.called
		
		expect(orig_doc.remove_annotation).to.have.been.called
		expect(orig_doc.remove_annotation.args[0][0]).to.equal(editor.range)
		expect(orig_doc.remove_annotation.args[0][1]).to.equal(proto_ann)
	}))
})