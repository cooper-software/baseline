"use strict"

var h = require('virtual-dom/h'),
	Model = require('mchammer').Model,
	Block = require('./Block')

var FigureBlock = Model.extend(Block,
{
	src: '',
	alt: '',
	caption: '',
	width: 0,
	height: 0,
	attribution_name: '',
	attribution_url: '',
	
	render: function ()
	{
		return h(
			'figure', 
			{
				contentEditable: false,
				className: this.selected ? 'selected' : ''
			},
			[
				h('img', {
					src: this.src,
					alt: this.alt,
					width: this.width,
					height: this.height
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
	}
})

FigureBlock.recognize = function (vnode)
{
	if (vnode.tagName != 'FIGURE')
	{
		return
	}
	
	var props = {}
	
	vnode.children.forEach(function (child)
	{
		if (child.tagName == 'IMG')
		{
			if (props.src)
			{
				return
			}
			
			props.src = child.properties.src
			props.alt = child.properties.alt
			props.width = child.properties.width
			props.height = child.properties.height
		}
		else if (child.tagName == 'FIGCAPTION')
		{
			child.children.forEach(function (caption_child)
			{
				if (caption_child.tagName && 
					caption_child.children.length > 0)
				{
					if (caption_child.properties.className == 'caption')
					{
						props.caption = caption_child.children[0].text
					}
					else if (caption_child.properties.className == 'attribution')
					{
						if (caption_child.children.length == 1 && caption_child.children[0].text)
						{
							props.attribution_name = caption_child.children[0].text
							
							if (props.attribution_name.substr(0, 3) == 'By ')
							{
								props.attribution_name = props.attribution_name.substr(3)
							}
						}
						else if (caption_child.children[1].tagName == 'A')
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