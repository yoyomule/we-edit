import {Input} from "we-edit"

let _uuid=0
const uuid=()=>`${_uuid++}`
export default class EditableDocument extends Input.Editable{
	constructor(data){
		super(...arguments)
		this.doc=data
		this.doc.id="root"
	}

	serialize(options){
		return JSON.stringify(this.doc, (k,v)=>k=="id" ? undefined : v, "\t")
	}

	get root(){
		return this.doc
	}

	makeId(node,uid){
		return node.id=uid||node.id||uuid()
	}

	getNode(id){
		let found=null
		const visit=node=>{
			if(node.id==id)
				return found=node
			if(Array.isArray(node.children)){
				return node.children.find(a=>visit(a))
			}
		}

		visit(this.doc)

		return found
	}

	_getParentNode(id){
		let found=null
		const visit=node=>{
			if(node.children.find ? node.children.find(a=>visit(a)) : null){
				found=node
				return false
			}
			return node.id==id
		}

		visit(this.doc)

		return found
	}

	cloneNode(node){
		return this.attach(JSON.parse(JSON.stringify(node,(k,v)=>k=="id" ? undefined : v)))
	}

	createNode(nodeTmpl){
		return this.attach({...nodeTmpl})
	}

	updateNode({id,props}){
		let docNode=this.getNode(id)
		Object.assign(docNode,arguments[0])
		return docNode
	}

	removeNode({id}){
		let {children}=this._getParentNode(id)
		let i=children.findIndex(a=>a.id==id)
		children.splice(i,1)
		return arguments[0]
	}

	insertNodeBefore(newNode,referenceNode,parentNode){
		this.removeNode(newNode)
		if(!parentNode)
			parentNode=this._getParentNode(referenceNode.id)
		let siblings=parentNode.children=parentNode.children||[]
		let i=referenceNode ? siblings.findIndex(({id})=>id==referenceNode.id) : siblings.length
		siblings.splice(i,0,newNode)
	}

	insertNodeAfter(newNode,referenceNode,parentNode){
		this.removeNode(newNode)
		if(!parentNode)
			parentNode=this._getParentNode(referenceNode.id)
		let siblings=parentNode.children=parentNode.children||[]
		let i=referenceNode ? siblings.findIndex(({id})=>id==referenceNode.id) : 0
		siblings.splice(i,0,newNode)
	}

	construct(from,to){
		if(from==to){
			return this.attach(this.cloneNode(this.getNode(from)))
		}

		const getPath=()=>{
			let path=[]
			const find=node=>{
				if(node.id==from){
					path.push(node)
					return node
				}else if(node.children.find){
					if(node.children.find(a=>find(a))){
						if(node.id!=to){
							path.push(node)
							return true
						}else{
							path.push(node)
							return false
						}
					}
				}
				return false
			}

			find(this.doc)

			return path
		}

		let path=getPath()

		let piece=path.reduce((constructed,node)=>{
				let cloned=this.cloneNode(node)
				if(constructed)
					cloned.children=[constructed]
				return cloned
			},null)

		return this.attach(piece)
	}

	attach(piece){
		this.makeId(piece)
		this.doc.children.splice(0,0,piece)
		return piece
	}
}
