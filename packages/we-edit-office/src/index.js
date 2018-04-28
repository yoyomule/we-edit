import React, {Component} from "react"
import ReactDOM from "react-dom"
import {WeEdit, Viewer, Editor, Emitter,Stream, Representation} from "we-edit"


import WeEditUI from "./we-edit-ui"
import Workspace from "./workspace"


import IconRead from "material-ui/svg-icons/communication/import-contacts"
import IconPrint from "material-ui/svg-icons/editor/format-align-justify"
import IconWeb from "material-ui/svg-icons/av/web"

const DefaultOffice=()=>(
    <WeEdit>
        <WeEditUI fonts={["Arial", "Calibri", "Cambria"]}>
            <Workspace accept="*.docx" layout="print" debug={false}>
                <Viewer
                    toolBar={null} ruler={false}
                    layout="read" icon={<IconRead/>}
                    representation={<Representation type="pagination"/>}>

                </Viewer>

                <Editor
                    layout="print"
					icon={<IconPrint/>}
                    representation={<Representation type="pagination"/>}
					>
                </Editor>

                <Editor ruler={false}
                    layout="web" icon={<IconWeb/>}
                    representation={<Representation type="html"/>}>

                </Editor>
            </Workspace>
        </WeEditUI>
    </WeEdit>
)

export function create(container, office=<DefaultOffice/>){
	if(!container || container==document.body){
		container=document.createElement("div")
		document.body.style="margin:0px;padding:0px;border:0px"
		document.body.appendChild(container)
	}
	return ReactDOM.render(office, container)
}

(function(me){
	window.addEventListener("load", ()=>{
		let container=document.querySelector('#OfficeContainer')
		if(container || process.env.NODE_ENV!=="production")
			create(container)
	})
})(window);


export const WeEditOffice={
	Default:DefaultOffice,
	WeEditUI,
	Workspace,
}

import * as WE from "we-edit"
import * as MaterialUI from "material-ui"
export {React,ReactDOM,MaterialUI, WE as WeEdit}

