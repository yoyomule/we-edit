import {getSelection,getFile} from "../../state/selector"
import ACTION from "../../state/action"
import xQuery from "./xquery"

export default class Reducer{
	constructor(state){
		this._state=state
		this._undoables={}
		this._updated={}
		this._selection=getSelection(state)
		this._file=getFile(state)

		this.$=context=>new xQuery(state,context)
	}

	state(){
		let state={}
		if(Object.keys(this._updated).length>0)
			state.updated=this._updated

		if(Object.keys(this._undoables).length>0)
			state.undoables=this._undoables

		if(Object.keys(this._selection).length>0)
			state.selection=this._selection

		return state
	}

	get selection(){
		return this._selection
	}

	get file(){
		return this._file
	}

	save4undo(id){
		this._undoables[id]=this.file.cloneNode(this.file.getNode(id),false)
	}

	renderChanged(id){
		let docNode=typeof(id)=="string" ? this.file.getNode(id) : id

		try{
			docNode=docNode.get(0)
		}catch(e){

		}

		let rendered=this.file.renderChanged(docNode)

		id=rendered.id

		if(this._state.hasIn(["content",id])){
			this._state.setIn(["_content",id,"parent"],
				this._state.getIn(["content",id,"parent"]))
			this._updated[id]={}
		}

		return rendered
	}

	renderChangedChildren(id){
		this._undoables[id]={children:this._state.getIn(["content",id,"children"]).toJS()}
		this._updated[id]={children:this.$('#'+id).children().toArray()}
	}

	cursorAt(id,at, endId=id, endAt=at, cursorAt){
		if(cursorAt=="start" || cursorAt=="end")
			this._selection.cursorAt=cursorAt

		this._selection={...this._selection,start:{id,at}, end:{id:endId, at:endAt}}
		return this._selection
	}
}
