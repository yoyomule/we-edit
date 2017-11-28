import React from "react"
import ReactDOM from "react-dom"

import {Editor, Viewer, Pagination, Html} from "component"
import fonts from "fonts"
import Input from "input"

import NodeWordWrapper from "wordwrap/node"
import {Text} from "pagination"
Text.WordWrapper=NodeWordWrapper

function edit(input,container){
	ReactDOM.unmountComponentAtNode(container)
	return Input.load(input)
		.then(doc=>{
			ReactDOM.render((
				<doc.Store>
					<div className="editors">
						<Editor width={600}>
							<Pagination/>
						</Editor>
					</div>
				</doc.Store>
			), container)
			return doc
		})
}

function create(container){
    ReactDOM.unmountComponentAtNode(container)
	return Input.create()
        .then(doc=>{
			ReactDOM.render((
				<doc.Store>
					<div className="editors">
						<Editor>
							<Pagination/>
						</Editor>
					</div>
				</doc.Store>
			), container)
			return doc
		})
}

function preview(input,container){
    ReactDOM.unmountComponentAtNode(container)
	return Input.load(input)
		.then(doc=>ReactDOM.render((
			<doc.Store>
				<Viewer>
					<Pagination/>
				</Viewer>
			</doc.Store>
		), container))
}

Object.assign(window, {edit,preview,loadFont: fonts.fromBrowser})


function testDocx(){
	Input.support(require("./src/docx"))
	fetch("basic.docx").then(res=>res.blob()).then(docx=>{
		docx.name="basic.docx"
		let app=document.querySelector('#app')
		
		fonts.load("verdana.ttf", "verdana")
		.then(()=>edit(docx,app).then(a=>window.doc=a))
	})
}

function testNative(){
	Input.support(require("./src/input/native"))
	fetch("basic.wed.json").then(res=>res.json()).then(doc=>{
		let app=document.querySelector('#app')	
		fonts.load("verdana.ttf", "verdana")
		.then(()=>edit(doc,app).then(a=>window.doc=a))
	})
}

testNative()