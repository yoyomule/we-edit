import React, {Component, PropTypes} from "react"

export default class Cursor extends Component{
    render(){
        return <rect {...this.props}/>
    }
	
	static defaultProps={
		height:0,
		width:2,
		stroke-width:2,
		strock:"black"
	}
}