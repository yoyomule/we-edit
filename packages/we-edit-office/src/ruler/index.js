import React from "react"
import PropTypes from "prop-types"

import {compose,setDisplayName,getContext,mapProps,withProps} from "recompose"

import {ACTION, connect, getSelectionStyle} from "we-edit"

import HorizontalRuler from "./horizontal"
import VerticalRuler from "./vertical"


export default compose(
	setDisplayName("Ruler"),
	connect(state=>({selection:getSelectionStyle(state)})),
	withProps(({dispatch})=>({
		setLeftMargin(left){
			dispatch(ACTION.Style.update({section:{pgMar:{left}}}))
		},
		setRightMargin(right){
			dispatch(ACTION.Style.update({section:{pgMar:{right}}}))
		},
		setBottomMargin(bottom){
			dispatch(ACTION.Style.update({section:{pgMar:{bottom}}}))
		},
		setTopMargin(top){
			dispatch(ACTION.Style.update({section:{pgMar:{top}}}))
		},
		setFirstLine(firstLine){
			dispatch(ACTION.Style.update({paragraph:{indent:{firstLine}}}))
		},
		setLeftIndent(left){
			dispatch(ACTION.Style.update({paragraph:{indent:{left}}}))
		},
		setRightIndent(right){
			dispatch(ACTION.Style.update({paragraph:{indent:{right}}}))
		}
	})),
	withProps(({selection})=>{
		if(!selection){
			return {
				Ruler: a=>null
			}
		}

		let {
				pgSz:{width,height},
				pgMar:{
					left:leftMargin,top:topMargin,right:rightMargin,bottom:bottomMargin,
					header,footer,
				}
			}=selection.props("section")

		let {
			indent:{left:leftIndent,right:rightIndent,firstLine}={}
		}=(selection.props("paragraph",false)||{})

		return {
			width,height,leftMargin,topMargin,bottomMargin,rightMargin,leftIndent,rightIndent,firstLine,
			header,footer
		}
	}),
)(({direction="horizontal", Ruler=direction=="horizontal" ? HorizontalRuler : VerticalRuler, ...props})=>(
	<Ruler {...props}/>
))
