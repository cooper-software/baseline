"use strict"

var h = require('../vdom').h,
	Model = require('../Model'),
	Block = require('./Block'),
	TextRegion = require('../regions/TextRegion')

var FigureBlock = Model.extend(Block,
{
	src: '',
	alt: '',
	caption: '',
	width: 0,
	height: 0,
	attribution_name: '',
	attribution_url: '',
	regions: [ new TextRegion() ],
	
	render: function ()
	{
		return h(
			'figure',
			{
				contentEditable: false
			},
			[
				h('img', {
					src: this.src,
					alt: this.alt,
					width: this.width,
					height: this.height,
					ondragstart: function (e)
					{
						e.preventDefault()
					}
				}),
				this.render_caption()
			]
		)
	},
	
	render_caption: function ()
	{
		if (this.caption || this.attribution_name || this.attribution_url)
		{
			return h('figcaption', [
				this.caption ? h('p', { className: 'caption' }, this.caption) : null,
				this.render_attribution()
			])
		}
	},
	
	render_attribution: function ()
	{
		if (this.attribution_url)
		{
			return h('p', { className: 'attribution' },
				['By ', h('a', { href: this.attribution_url }, this.attribution_name ? this.attribution_name : this.attribution_url)]
			)
		}
		else if (this.attribution_name)
		{
			return h('p', { className: 'attribution' }, ['By ' + this.attribution_name])
		}
	},
	
	insert: function (point, blocks)
	{
		return {
			blocks: [ this ].concat(blocks ? blocks : []),
			point: point.update(
			{
				block: blocks ? point.block + blocks.length : point.block,
				region: blocks ? 0 : point.region+1,
				offset: 0
			})
		}
	}
})

FigureBlock.recognize = function (vnode)
{
	if (vnode.tag != 'FIGURE')
	{
		return
	}
	
	var props = {}
	
	vnode.children.forEach(function (child)
	{
		if (!child.tag)
		{
			return
		}
		
		if (child.tag == 'IMG')
		{
			if (props.src)
			{
				return
			}
			
			props.src = child.prop('src')
			props.alt = child.prop('alt')
			props.width = child.prop('width')
			props.height = child.prop('height')
		}
		else if (child.tag == 'FIGCAPTION')
		{
			child.children.forEach(function (caption_child)
			{
				if (!caption_child.tag)
				{
					return
				}
				
				if (caption_child.tag && 
					caption_child.children.length > 0)
				{
					if (caption_child.prop('className') == 'caption')
					{
						props.caption = caption_child.children[0].text
					}
					else if (caption_child.prop('className') == 'attribution')
					{
						if (caption_child.children.length == 1 && caption_child.children[0].text)
						{
							props.attribution_name = caption_child.children[0].text
							
							if (props.attribution_name.substr(0, 3) == 'By ')
							{
								props.attribution_name = props.attribution_name.substr(3)
							}
						}
						else if (caption_child.children[1].tag == 'A')
						{
							var attr_child = caption_child.children[1]
							props.attribution_url = attr_child.properties.href
							props.attribution_name = attr_child.children.length > 0 ? attr_child.children[0].text : null
							
							if (props.attribution_name == props.attribution_url)
							{
								props.attribution_name = ''
							}
						}
					}
				}
			})
		}
	})
	
	if (props.src)
	{
		return new FigureBlock(props)
	}
}

module.exports = FigureBlock