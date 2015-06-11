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
	text: ''
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
	}
})

module.exports = 
{
	VirtualNode: VirtualNode,
	VirtualText: VirtualText,
	VirtualElement: VirtualElement
}