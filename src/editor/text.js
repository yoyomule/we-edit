import React,{PropTypes} from "react"
import {Text} from "../content"
import editable from "./editable"

import Group from "../composed/group"
import {Shape as CursorShape} from "./cursor"

let Super=editable(Text)
export default class extends Super{
	createComposed2Parent(props){
		let composed=super.createComposed2Parent(...arguments)
		let {width, height, children:text}=composed.props
		text=React.cloneElement(text,{onClick:e=>this.onClick(e,props)})

		let cursor=this.context.cursor()||{state:{}}
		let {target,at: cursorAt}=cursor.state
		if(target!=this){
			return (
				<Group height={height} width={width}>
				{text}
				</Group>
			)
		}

		let ps={width,height}
		const {end, children: textpiece}=props

		if(end-textpiece.length<cursorAt && cursorAt<=end){
			ps.ref=a=>{
				let node=ReactDOM.findDOMNode(a)
				let text=textpiece.substr(0,cursorAt-(end-textpiece.length))
				let composer=new this.constructor.WordWrapper(text, style)
				let {contentWidth, fontFamily}=composer.next({width})||{end:0}
				let style=this.getStyle()
				cursor.setState({
					target:this,
					at:cursorAt,
					node,
					width:contentWidth,
					height:composer.height, style})
			}
	        return (
				<Group {...ps}>
					{text}
				</Group>
			)
		}else {
			return composed
		}
    }

    onClick(event, text){
		const {nativeEvent:{offsetX, offsetY}, target}=event
        let style=this.getStyle()
        let composer=new this.constructor.WordWrapper(text.children, style)
        let {contentWidth,end}=composer.next({width:offsetX})||{end:0,contentWidth:0}
        let index=text.end-text.children.length+end
		let cursor=this.context.cursor()
		cursor.setState({
			target:this,
			at: index,
			node:event.target.parentNode,
			width:Math.ceil(contentWidth),
			height:composer.height,
			style })
    }

	splice(start, length, str){
		const {content}=this.state
		this.setState({content:content.splice(start,length,str)},e=>this.reCompose())
	}

	static contextTypes=Object.assign({
		cursor: PropTypes.func
	},Super.contextTypes)
}
