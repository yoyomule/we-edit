import React, {Component, Children} from "react"
import PropTypes from "prop-types"

import {connect} from "../../state"
import ACTION from "../../state/action"
import {getContent,  getSelection} from "../../state/selector"

import get from "lodash.get"

import Shape from "./shape"

export class Cursor extends Component{
	static contextTypes={
		activeDocStore: PropTypes.any,
		docId: PropTypes.string,
		getCursorInput: PropTypes.func,
		query: PropTypes.func
	}

	static propTypes={
		id: PropTypes.string,
		at: PropTypes.number,
		active: PropTypes.string,
	}

	constructor(){
		super(...arguments)
		this.up=this.up.bind(this)
		this.down=this.down.bind(this)
	}

	render(){
		const {active,children,isCaret}=this.props
		const {docId}=this.context
		return (
			<Shape ref={a=>this.shape=a} active={active==docId} >
				{children}
			</Shape>
		)
	}

	shouldComponentUpdate({content}){
		/**
			when content changed, composition must happen,
			it will be forceUpdated by composed document,
			otherwise the timing is not correct.
		**/
		return this.props.content==content
	}

	componentDidUpdate(prevProps){
		const {active,id,at, up, down, isCaret}=this.props
		const {docId, getCursorInput,query}=this.context
		if(!isCaret){
			this.style=null
			getCursorInput()
				.setState({
					height:0
				})
			if(this.shape){
				this.shape.setState({height:0})
			}
			return
		}
		let docQuery=query()
		if(!docQuery)
			return
		this.style=docQuery.position(id,at)
		if(!this.style)
			return

		let {
			top,left, height,fontFamily,fontSize,
			x,y,
			}=this.style

		if(docId==active){
			getCursorInput()
				.setState({
					style:this.style,
					query:docQuery,

					top,left,fontFamily,fontSize,
					height: this.shape ? 0.1 : height,
					up: this.up,
					down: this.down
				})
		}

		if(this.shape){
			this.shape.setState({x,y,height})
		}
	}

	up(shiftKey){
		const {activeDocStore, query}=this.context
		const dispatch=activeDocStore.dispatch
		const state=activeDocStore.getState()
		const selection=getSelection(state)
		const {start,end,cursorAt}=selection
		const cursor=selection[cursorAt]
		const $=query()
		

		if(!shiftKey){
			let {id,at}=$.prevLine(cursor.id, cursor.at)
			dispatch(ACTION.Cursor.AT(id,at))
			
		}else{
			let {id,at}=$.prevLine(cursor.id, cursor.at,true)
			if(start.id==end.id && start.at==end.at){
				dispatch(ACTION.Selection.START_AT(id,at))
			}else{
				if(cursorAt=="start")
					dispatch(ACTION.Selection.START_AT(id,at))
				else if(cursorAt=="end"){
					let {left,top}=$.position(id,at)
					let {left:left0,top:top0}=$.position(start.id, start.at)
					if((top0==top && left<left0) //same line, new point is on the left of start
						|| (top<top0)) //above start point line
						{
						dispatch(ACTION.Selection.SELECT(id,at,start.id,start.at))
						dispatch(ACTION.Selection.START_AT(id,at))
					}else{
						dispatch(ACTION.Selection.END_AT(id,at))
					}
				}
			}
		}
	}

	down(shiftKey){
		const {activeDocStore,query}=this.context
		const dispatch=activeDocStore.dispatch
		const state=activeDocStore.getState()
		const selection=getSelection(state)
		const {start,end,cursorAt}=selection
		const cursor=selection[cursorAt]
		const $=query()

		

		if(!shiftKey){
			let {id,at}=$.nextLine(cursor.id,cursor.at)
			dispatch(ACTION.Cursor.AT(id,at))
		}else{
			let {id,at}=$.nextLine(cursor.id,cursor.at, true)
			if(start.id==end.id && start.at==end.at){
				dispatch(ACTION.Selection.END_AT(id,at))
			}else{
				if(cursorAt=="end")
					dispatch(ACTION.Selection.END_AT(id,at))
				else if(cursorAt=="start"){
					let {left,top}=$.position(id,at)
					let {left:left1, top:top1}=$.position(end.id, end.at)
					if((top==top1 && left>left1) || (top>top1)){
						dispatch(ACTION.Selection.SELECT(end.id,end.at,id,at))
						dispatch(ACTION.Selection.END_AT(id,at))
					}else{
						dispatch(ACTION.Selection.START_AT(id,at))
					}
				}
			}
		}
	}
}

const CursorHolder=connect((state)=>{
	let selection=getSelection(state)
	let content=state.get("content")
	let {end,start,active,cursorAt}=selection
	let {id,at}=selection[cursorAt]
	return {id,at,active, content, isCaret:end.id==start.id && end.at==start.at}
},null,null, {withRef:true})(Cursor)

export default class extends Component{
	forceUpdate(){
		if(this.cursor)
			this.cursor.forceUpdate()
	}

	render(){
		const {children, render:Shape, ...others}=this.props
		return (
			<CursorHolder ref={a=>{a && (this.cursor=a.getWrappedInstance())}}
				{...others}>
				{Shape ? <Shape/> : children}
			</CursorHolder>
		)
	}
}
