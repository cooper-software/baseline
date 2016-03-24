"use strict"

var Model = require('../Model')

var VirtualNode = Model(
{
	dom_node: null,
	onchange: null,
	watcher: null,
	key: null
})

var VirtualText = Model.extend(VirtualNode,
{
	text: '',
    
    to_html: function ()
    {
        return this.text
    }
})

var prop_attr_map = {
	acceptCharset: 'acceptcharset',
	accessKey: 'accesskey',
	bgColor: 'bgcolor',
	cellIndex: 'cellindex',
	cellPadding: 'cellpadding',
	cellSpacing: 'cellspacing',
	chOff: 'choff',
	className: 'class',
	codeBase: 'codebase',
	codeType: 'codetype',
	colSpan: 'colspan',
	dateTime: 'datetime',
	defaultChecked: 'checked',
	defaultSelected: 'selected',
	defaultValue: 'value',
	frameBorder: 'frameborder',
	httpEquiv: 'httpequiv',
	longDesc: 'longdesc',
	marginHeight: 'marginheight',
	marginWidth: 'marginwidth',
	maxLength: 'maxlength',
	noHref: 'nohref',
	noResize: 'noresize',
	noShade: 'noshade',
	noWrap: 'nowrap',
	readOnly: 'readonly',
	rowIndex: 'rowindex',
	rowSpan: 'rowspan',
	sectionRowIndex: 'sectionrowindex',
	selectedIndex: 'selectedindex',
	tabIndex: 'tabindex',
	tBodies: 'tbodies',
	tFoot: 'tfoot',
	tHead: 'thead',
	URL: 'url',
	useMap: 'usemap',
	vAlign: 'valign',
	valueType: 'valuetype'
}

var VirtualElement = Model.extend(VirtualNode,
{
	tag: 'P',
	properties: {},
	children: [],
	
	prop: function (name)
	{
		if (this.properties[name] !== undefined)
		{
			return this.properties[name]
		}
		else if (this.properties.attributes)
		{
			var attr_name = prop_attr_map[name]
			if (attr_name)
			{
				return this.properties.attributes[attr_name]
			}
			else
			{
				return this.properties.attributes[name]
			}
		}
	},
    
  to_html: function ()
  {
      var html = '<' + this.tag.toLowerCase()
      
      if (this.properties.attributes)
      {
          var attrs = this.properties.attributes,
              keys = Object.keys(attrs)
          
          if (keys.length > 0)
          {
              html += ' ' + keys.map(function (k)
              {
                  return k+'="'+attrs[k]+'"'
              }).join(' ')
          }
      }
      
      if (this.properties.style)
      {
          var styles = this.properties.style,
              keys = Object.keys(styles)
              
          if (keys.length > 0)
          {
              html += ' style="'
              html += keys.map(function (k)
              {
                  return k+':'+styles[k]
              }).join(';')
          }
      }
      
      html += '>'
      
      html += this.children.map(function (c)
      {
          if (c.vnode)
          {
              return c.vnode.to_html()
          }
          else
          {
              return c.to_html()
          }
      }).join('')
      
      return html + '</'+ this.tag.toLowerCase() +'>'
  }
})

var RawHTML = Model.extend(VirtualNode,
{
  html: '',
    
  to_html: function ()
  {
    return this.html
  }
})

module.exports = 
{
	VirtualNode: VirtualNode,
	VirtualText: VirtualText,
	VirtualElement: VirtualElement,
  RawHTML: RawHTML
}