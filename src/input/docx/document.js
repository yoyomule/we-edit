import docx4js from "docx4js"
import uuid from "tools/uuid"
import Base from "input/document"

const defineId=(target,id)=>Object.defineProperty(target,"id",{
	enumerable: false,
	configurable: false,
	writable: false,
	value: id
})

//implement Base interface
export default class Document extends docx4js{
	makeId(node, uid){
		if(uid){
			defineId(node.attribs,uid)
			return uid
		}

		if(node.attribs.id!=undefined)
			return node.attribs.id

		let id=uid||uuid()
		defineId(node.attribs,id)

		if(this.part)
			return `${id}[${this.part}]`

		return id
	}

	getNode(uid){
		let [id,part]=uid.split(/[\[\]]/g)
		let node=null

		if(!part)
			node=this.officeDocument.content(`#${id}`)
		else
			node=this.officeDocument.getRel(part)(`#${id}`)
		console.assert(node.length<2)
		return node
	}

	cloneNode(node){
		let withIds=node.find("[id]").each((i,el)=>el.attribs._id=el.attribs.id)
		let cloned=node.clone()
		withIds.removeAttr("_id")
		return cloned
	}

	createNode(props){

	}

	updateNode({type}){
		return this[`_update${type[0].toUpperCase()+type.substr(1)}Node`](...arguments)
	}

	removeNode({id,type}){
		return this.getNode(id).remove()
	}

	_updateTextNode({id},{props,children}){
		if(children!=undefined){
			return this.getNode(id).text(children).get(0)
		}else{

		}
	}

	construct(from,to){
		let $=this.officeDocument.content
		let nodeFrom=this.getNode(from)
		let nodeTo=this.getNode(to)
		let path=nodeFrom.parentsUntil(nodeTo).toArray()
		path.splice(path.length,0,nodeTo.get(0))

		let xml=path.reduce((constructed,node)=>{
				switch(node.name.split(":").pop()){
				case "r":
					return `<w:r>${$.xml($(node).find("w\\:rPr"))}${constructed}</w:r>`
				break
				case "p":
					return `<w:p>${$.xml($(node).find("w\\:pPr"))}${constructed}</w:p>`
				break
				}
			},`<${nodeFrom.get(0).name}/>`)

		return $(xml).appendTo("w\\:body").get(0)
	}
	
	resize(id, width, height){
		let node=this.getNode(id)
		let ext0=node.find("a\\:xfrm>a\\:ext")
		let inline=node.closest("wp\\:inline")
		
		const update=(x,target)=>{
			if(x){
				let cx=px2cm(x)
				let cx0=parseInt(ext0.attr(target))
				ext0.attr(target,cx)

				if(inline.length){
					let ext1=inline.children("wp\\:extent")
					let cx1=parseInt(ext1.attr(target))
					ext1.attr(target,cx+cx1-cx0)
				}
			}
		}
		
		update(width,"cx")
		update(height,"cy")
		
		return (inline.length ? inline : node).get(0)
	}
}

function px2cm(px){
	return Math.ceil(px*72/96*360000/28.3464567)
}