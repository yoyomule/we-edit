import React, {PropTypes} from "react"

import {HasParentAndChild} from "./composable"
import Base from "../cell"
const Super=HasParentAndChild(Base)

export default class Cell extends Super{
	nextAvailableSpace(required){
		let {width,height}=super.nextAvailableSpace(...arguments)

		let {margin}=this.props
		width=width
			-margin.right
			-margin.left

		height=height
			-margin.top
			-margin.bottom

		return {width,height}
	}
}