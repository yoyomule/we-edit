import React from "react"
import PropTypes from "prop-types"


import {HasParentAndChild} from "./composable"
import {models} from "we-edit"
const {Frame:Base}=models

import {Group} from "./composed"

const Super=HasParentAndChild(Base)

export default class Frame extends Super{
	nextAvailableSpace(required){
		let {width,height}=this.props
		return {width,height}
	}

	appendComposed(content){
		return this.computed.composed.push(content)
	}

	onAllChildrenComposed(){
		let composed=this.createComposed2Parent()
		this.context.parent.appendComposed(composed)

		super.onAllChildrenComposed()
	}

	createComposed2Parent() {
		let {width,height,margin,wrap}=this.props
		width+=(margin.left+margin.right)
		height+=(margin.top+margin.bottom)
		this.context.parent.nextAvailableSpace({width,height})
		return (
			<Group {...{width,height}}>
				<Group x={margin.left} y={margin.top} children={[...this.computed.composed]}/>
			</Group>
		)
    }
}
