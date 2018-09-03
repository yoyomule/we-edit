import React, {Component} from "react"

export default class{
	static contextTypes={
		store:PropTypes.any,
		docId:PropTypes.any
	}

	static childContextTypes={
		query: PropTypes.func,
		mount: PropTypes.func,
		unmount: PropTypes.func,
	}

	constructor(){
		super(...arguments)
		this.composers=new Map([[this.props.id,this]])
	}
	
	getChildContext(){
		let query=this.query.bind(this)
		let mount=a=>this.composers.set(a.props.id,a)
		let unmount=a=>this.composers.delete(a.props.id)
		return {
			query,
			mount,
			unmount
		}
	}

	query(){
		return new Query(this, this.context.store.getState())
	}
	
	active(){
        let {docId, store}=this.context
        let {active}=getSelection(store.getState())
        if(active!=docId)
            store.dispatch(ACTION.Cursor.ACTIVE(docId))
    }

	componentDidMount(){
		//this.root.setAttribute("contenteditable",true)
		this.active()
		this.updateCursorAndSelection()
	}

	componentDidUpdate(){
		this.updateCursorAndSelection()
	}


	updateCursorAndSelection(){
        this.cursor && this.cursor.forceUpdate()
        this.selection && this.selection.forceUpdate()
    }


	documentSelection(){
        return window.getSelection()||document.getSelection()
    }

	onClick(e){
		const dispatch=this.context.store.dispatch
		const target=e.target
		const $=this.query()
		switch(target.nodeName){
			case "img":
				dispatch(ACTION.Selection.SELECT(target.dataset.content,-1))
			break
			default:{
				let {focusOffset:at, focusNode:{parentElement:{dataset:{content:id}}}}=this.documentSelection()
				if(!e.shiftKey){
					dispatch(ACTION.Cursor.AT(id,at))
				}else{
					let {end}=getSelection(this.context.store.getState())
					let {left,top}=$.position(id,at)
					let {left:left1,top:top1}=$.position(end.id,end.at)
					if(top<top1 || (top==top1 && left<=left1)){
						dispatch(ACTION.Selection.START_AT(id,at))
					}else{
						dispatch(ACTION.Selection.SELECT(end.id, end.at, id, at))
					}
				}
			}
		}
		this.active()
	}

	onSelect(selection){
		const dispatch=this.context.store.dispatch
        const $=this.query()
        const locate=a=>{
            let node=selection[`${a}Node`].parentNode
            return {
                id:node.dataset.content,
                at:selection[`${a}Offset`]
            }
        }

        let first=locate("anchor"), end=locate("focus")
        let {left:left0,top:top0}=$.position(first.id, first.at)
        let {left:left1,top:top1}=$.position(end.id, end.at)

        const forward=a=>{
            dispatch(ACTION.Selection.SELECT(first.id,first.at,end.id,end.at))
            dispatch(ACTION.Selection.END_AT(end.id,end.at))
        }

        const backward=a=>{
            dispatch(ACTION.Selection.SELECT(end.id,end.at,first.id,first.at))
            dispatch(ACTION.Selection.START_AT(end.id,end.at))
        }

        if(top0>top1){
            backward()
        }else if(top0<top1){
            forward()
        }else if(top0==top1){
            if(first.id!=end.id){
                if(left0<left1){
                    forward()
                }else{
                    backward()
                }
            }else{
                if(first.at<end.at){
                    forward()
                }else{
                    backward()
                }
            }
        }
		this.active()
	}
}