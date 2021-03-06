import React from "react"
import PropTypes from "prop-types"

import Component from "./component"


export default class Header extends Component{
    static displayName="header"
    static propTypes={
        type: PropTypes.oneOf(["first","even","default"])
    }

    static defaultProps={
        type:"default"
    }
    
    static contextTypes={
        pgSz: PropTypes.object,
        pgMar: PropTypes.object
    }
}
