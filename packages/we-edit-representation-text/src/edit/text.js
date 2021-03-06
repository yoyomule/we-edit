import React,{Component} from "react"
import PropTypes from "prop-types"
import {Editors} from  "we-edit-representation-html"

export default class Text extends Component{
	static contextTypes={
		colorful:PropTypes.bool,
		fonts: PropTypes.string,
		size: PropTypes.number
	}

	render(){
		let {color, vanish,id,children, changed, selfChanged}=this.props

		let {fonts, size,colorful}=this.context

		let props={fonts, size, vanish, id, children,changed, selfChanged}
		if(colorful){
			props.color=color
		}
		return <Editors.Text {...props}/>
	}
}
