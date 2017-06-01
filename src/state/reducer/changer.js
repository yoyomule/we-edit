import {getSelection, getParentId,getFile,getContent} from "state/selector"
export default class Changer{
	constructor(state){
		this._state=state
		this._updated={}
		this._selection=getSelection(state)
	}
	
	getParentId(id){
		return getParentId(this._state, id)
	}
	
	state(){
		let state={}
		if(Object.keys(this._updated).length>0)
			state.updated=this._updated
		if(Object.keys(this._selection).length>0)
			state.selection=this._selection
		
		if(Object.keys(state).length>0)
			return state
	}
	
	get selection(){
		return this._selection
	}
	
	get file(){
		return getFile(this._state)
	}
	
	getContent(id){
		return getContent(this._state,id).toJS()
	}
	
	updateChildren(id, f){
		if(!this._updated[id])
			this._updated[id]={children:getContent(this._state,id).get("children").toJS()}
		f(this._updated[id].children)
		return this
	}
	
	updateSelection(id,at, endId=id, endAt=at, cursorAt){
		if(cursorAt=="start" || cursorAt=="end")
			this._selection.cursorAt=cursorAt
		
		this._selection={...this._selection,start:{id,at}, end:{id:endId, at:endAt}}
		return this._selection
	}
		
	renderChanged(changed){
		let {id,props,children}=this._renderChanged(...arguments)
		this._updated[id]={}
	}

	_renderChanged(changed){
		throw new Error("you need implement it")
	}
}