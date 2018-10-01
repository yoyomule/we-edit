import React, {Fragment,Children} from "react"
import PropTypes from "prop-types"

import Base from "../section"

import editable from "./editable"

export default class Section extends editable(Base,{stoppable:true,cachable:true}){
	constructor(){
		super(...arguments)
		this.computed.lastComposed=[]
	}
	
	onAllChildrenComposed(){
		super.onAllChildrenComposed()
		let last=this.computed.composed[this.computed.composed.length-1]
		last && (last.lastSectionPage=true);
	}

	createComposed2Parent(){
		const {pgSz:size,  pgMar:margin}=this.props
		const page=React.cloneElement(super.createComposed2Parent(...arguments),{
				"width":size.width-margin.left-margin.right
			})
		this.computed.lastComposed.push(page)
		return page
	}
}
