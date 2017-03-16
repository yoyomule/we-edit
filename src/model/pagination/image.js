import React, {Component, PropTypes} from "react"
import {NoChild} from "./composable"
import Base from "../image"

const Super=NoChild(Base)
export default class Image extends Super{
    createComposed2Parent(){
        const {src, width,height}=this.props
        let availableSpace=this.context.parent.nextAvailableSpace({width,height})
        return <image {...{
                width,
                height,
                xlinkHref: src,
                y:-height
            }} />
    }
}