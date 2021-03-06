import Base from "./base"

export default class extends Base{
	constructor(node, selector){
		super(node,null,selector)
		this.id='*'
		this.basedOn=null
		this.cache=null

		this.r=this._convert(node.children.find(a=>a.name=="w:rPrDefault"), "w:rPr",{
			"w:rFonts":"fonts",
			"w:sz":"size",
			"w:color":"color",
			"w:b":"bold",
			"w:i":"italic",
			"w:vanish":"vanish"
		}, selector)

		this.p=this._convert(node.children.find(a=>a.name=="w:pPrDefault"), "w:pPr",{
			"w:spacing":"spacing",
			"w:indent":"indent"
		}, selector)
	}
}
