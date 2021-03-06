import docx4js from "docx4js"
import editors from "./model/edit"
import Fetchable from "fetchable"

const uuid=(_uuid=>()=>`${_uuid++}`)(0)

const defineId=(target,id)=>Object.defineProperty(target,"id",{
	enumerable: false,
	configurable: false,
	writable: false,
	value: id
})

const Type=type=>type[0].toUpperCase()+type.substr(1)
	
export default class EditableDocument extends docx4js{
	static get URL(){
		if(!this.__cachedData){
			this.__cachedData=new Fetchable("docx-memory")
		}
		return this.__cachedData
	}
	
	createObjectURL(data,type){
		return EditableDocument.URL.createObjectURL(...arguments)
	}
	
	revokeObjectURL(url){
		return EditableDocument.URL.revokeObjectURL(...arguments)
	}
	
	getDataPartAsUrl(name,type="*/*"){
		let part=this.parts[name]
		let crc32=part._data.crc32
		if(!this._shouldReleased.has(crc32)){
			this._shouldReleased.set(crc32,this.createObjectURL(this.getDataPart(name),type))
		}
		return this._shouldReleased.get(crc32)
	}

	release(){
		for(let [, url] of this._shouldReleased){
			this.revokeObjectURL(url)
		}
	}
	
	makeId(node, uid){
		if(uid){
			defineId(node.attribs,uid)
			return uid
		}

		if(node.attribs.id!=undefined)
			return node.attribs.id

		let id=uid||(node.name=="w:document"&&"root")||uuid()
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

	cloneNode(node, autoAttach=true){
		let withIds=node.find("[id]").each((i,el)=>el.attribs._id=el.attribs.id)
		let cloned=node.clone()
		withIds.removeAttr("_id")
		if(autoAttach)
			return this.attach(cloned)
		else
			return cloned
	}

	createNode({type},reducer, target){
		let editor=new editors[Type(type)](this)
		return editor.create(arguments[0],reducer, target)
	}
	
	updateNode({id,type},changing, query){
		let editor=new editors[Type(type)](this)
		return editor.update(arguments[0],changing)
	}

	removeNode({id}){
		return this.getNode(id).remove()
	}

	insertNodeBefore(newNode,referenceNode,parentNode){
		if(referenceNode)
			referenceNode.before(newNode)
		else if(parentNode)
			parentNode.append(newNode)
		else
			throw new Error("not support")
	}

	insertNodeAfter(newNode,referenceNode,parentNode){
		if(referenceNode)
			referenceNode.after(newNode)
		else if(parentNode)
			parentNode.prepend(newNode)
		else
			throw new Error("not support")
	}

	attach(xml){
		xml=this.officeDocument.content(xml)
		this.officeDocument.content("w\\:body").append(xml)
		this.makeId(xml.get(0))
		return xml.get(0)
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

		return this.attach(xml)
	}

	px2cm(px){
		return Math.ceil(px*72/96*360000/28.3464567)
	}
	
	px2Pt(px){
		return px*72/96
	}

	toString(id){
		return this.officeDocument.content.xml(this.getNode(id))
	}
	
	toXml(node){
		return this.officeDocument.content.xml(node)
	}
}


