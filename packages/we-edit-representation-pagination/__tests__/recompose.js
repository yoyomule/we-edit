import React,{Fragment,Children} from "react"
import TestRender from "react-test-renderer"
import ReactDOMServer from 'react-dom/server'
import cheerio from "cheerio"

import {ACTION} from "we-edit"

import {Viewers, Editors} from "../src"
import Responsible from "../src/composed/responsible"
import Locator from "../src/composed/locator"
import ComposedDocument from "../src/composed/document"
import provider from "./context"
import Waypoint from "react-waypoint"

const {Document, Section, Paragraph, Text, Image}=Editors
Document.defaultProps.id="root"

const $=pages=>{
	const html=ReactDOMServer.renderToString(<ComposedDocument pages={pages}/>)
	const $=cheerio.load(html)
	return $("svg")
}

jest.mock("../src/composed/locator")
jest.mock("react-waypoint")

describe("continuable", ()=>{
	beforeAll(()=>{
		Paragraph.prototype.children=jest.fn(function(){
			return this.props.children
		})
		Paragraph.defaultProps.defaultStyle={
			fonts:"arial",
			size:12
		}
		Locator.prototype.shouldComponentUpdate=jest.fn(a=>true)
	})
	
	const store=(state={
			equals({start,end}){
				return false
			},
			toJS(){
				return {start:{},end:{}}
			},
			hashCode(){
				return "1234"
			}
		})=>({activeDocStore:{
				subscribe(){},
				dispatch(){},
				getState(){
					return {
						get(){
							return state
						}
					}
				}
			}
		})

	const StoreContext=provider(Responsible,store())
	const TextContext=provider(Text,{
			Measure:class{
				height=10
				defaultStyle={height:10}
				widthString(x,text){
					return text.substring(0,x)
				}

				stringWidth(text){
					return text.length
				}
			}
		})
	const size={width:816,height:1056}
	const section=(id,ps=1)=>(<Section id={`${id}.0`} key={`${id}.0`}
					pgSz={size}
					pgMar={{
						left: 96,
						right: 120,
						top: 120,
						bottom: 96,

						header: 48,
						footer: 48
					}}
				>
					<Paragraph id={`${id}.1`} key={`${id}.1`}>
						<Text  id={`${id}.2`} key={`${id}.2`} fonts="arial" size={12}>hello{id||""}</Text>
					</Paragraph>
					{
						ps>1 && new Array(ps-1)
							.fill(0)
							.map((a,i)=>
								<Paragraph id={`${id}.1.${i+1}`} key={`${id}.1.${i+1}`}>
									<Text  id={`${id}.2.${i+1}`} key={`${id}.2.${i+1}`} fonts="arial" size={12}>hello{`${id}.${i+1}`}</Text>
								</Paragraph>
							)
					}
				</Section>
	)
	const pageGap=12

	describe("compose to Y", ()=>{
		const compose2Y=(y,n)=>it(`${y},pages=${n}`,()=>{
			const renderer=TestRender.create(
				<StoreContext>
					<TextContext>
						<Document 
							pageGap={pageGap} 
							viewport={{width:500,height:y,node:{scrollTop:0}}} 
							screenBuffer={0} 
							scale={1}>
							{section(1)}
							{section(2)}
							{section(3)}
						</Document>
					</TextContext>
				</StoreContext>
			)
			const doc=renderer.root.findByType(Document).instance
			const pages=doc.computed.composed
			expect(pages.length).toBe(n)
		})

		compose2Y(10,1)
		compose2Y(size.height,1)
		compose2Y(size.height+pageGap+1,2)
		compose2Y(size.height*1.9,2)
		compose2Y(size.height*2,2)
		compose2Y(size.height*2+2*pageGap+1,3)
		compose2Y(size.height*3,3)
		compose2Y(size.height*5,3)
	})

	describe("compose to id",()=>{
		const compose2Id=(id,n)=>it(`${id},pages=${n}`,()=>{
			const renderer=TestRender.create(
				<StoreContext context={store({
					equals(){
						return false
					},
					toJS(){
						return {start:{id,at:0},end:{id,at:0}}
					},
					hashCode(){
						return "1234"
					}
				})}>
					<TextContext>
						<Document viewport={{width:500,height:100,node:{scrollTop:0}}} screenBuffer={0} scale={1}>
							{section(1)}
							{section(2)}
							{section(3)}
						</Document>
					</TextContext>
				</StoreContext>
			)
			const doc=renderer.root.findByType(Document).instance
			const pages=doc.computed.composed
			expect(pages.length).toBe(n)
			console.log($(pages).text())
		})

		compose2Id('1.0',1)
		compose2Id('1.1',1)
		compose2Id('1.2',1)

		compose2Id('2.2',2)

		compose2Id('3.2',3)
	})


	describe("compose to y/id then y/id",()=>{
		function compose2(node,state,i){
			let root=null
			const renderer=TestRender.create(root=
				<StoreContext context={store(state)} key="test">
					<TextContext>
						<Document pageGap={pageGap} viewport={{width:500,height:size.height/2,node}} screenBuffer={0} scale={1}>
							{section(1,i)}
							{section(2,i)}
							{section(3,i)}
						</Document>
					</TextContext>
				</StoreContext>
			)
			return Object.assign(renderer.root.findByType(Document).instance,{renderer,root})
		}

		it("compose to y then to 2y",()=>{
			const node={scrollTop:0}
			const state={
				equals(){
					return false
				},
				toJS(){
					return {start:{},end:{}}
				},
				hashCode(){
					return "1234"
				}
			}
			const doc=compose2(node,state)
			let pages=doc.computed.composed

			expect($(pages).text()).toBe("hello1")
			expect(pages.length).toBe(1)

			return new Promise((resolve, reject)=>{
				node.scrollTop=size.height/2+pageGap
				doc.setState({mode:"viewport",time:Date.now()},()=>{
					let pages=doc.computed.composed
					expect(pages.length).toBe(2)
					expect($(pages).text()).toBe("hello1hello2")
					resolve()
				})
			})
		})

		it("compose to y then to id",()=>{
			const node={scrollTop:0}
			const state={
				equals(){
					return false
				},
				toJS(){
					return {start:{},end:{}}
				},
				hashCode(){
					return "1234"
				}
			}
			const doc=compose2(node,state)

			let pages=doc.computed.composed

			expect($(pages).text()).toBe("hello1")
			expect(pages.length).toBe(1)

			return new Promise((resolve, reject)=>{
				state.toJS=jest.fn(()=>{
					return {start:{id:"3.2",at:0},end:{id:"3.2",at:0}}
				})
				doc.setState({mode:"viewport",time:Date.now()},()=>{
					let pages=doc.computed.composed
					expect(pages.length).toBe(3)
					expect($(pages).text()).toBe("hello1hello2hello3")
					resolve()
				})
			})

		})

		it("compose to id then to id",()=>{
			const node={scrollTop:0}
			const state={
				equals(){
					return false
				},
				toJS(){
					return {start:{id:"2.2",at:0},end:{id:"2.2",at:0}}
				},
				hashCode(){
					return "1234"
				}
			}
			const doc=compose2(node,state)

			const pages=doc.computed.composed
			expect(pages.length).toBe(2)
			expect($(pages).text()).toBe("hello1hello2")

			return new Promise((resolve, reject)=>{
				state.toJS=jest.fn(()=>{
					return {start:{id:"3.2",at:0},end:{id:"3.2",at:0}}
				})

				doc.setState({mode:"viewport",time:Date.now()},()=>{
					const pages=doc.computed.composed
					expect(pages.length).toBe(3)
					expect($(pages).text()).toBe("hello1hello2hello3")

					resolve()
				})
			})
		})

		describe("cache", ()=>{
			it("scroll with cache(all) compose",()=>{
				const node={scrollTop:0}
				const state={
					equals(){
						return false
					},
					toJS(){
						return {start:{id:"2.2",at:0},end:{id:"2.2",at:0}}
					},
					hashCode(){
						return "1234"
					}
				}
				Section.prototype.render=jest.fn(Section.prototype.render)
				Paragraph.prototype.render=jest.fn(Paragraph.prototype.render)
				const doc=compose2(node,state)

				const pages=doc.computed.composed
				expect(pages.length).toBe(2)
				expect($(pages).text()).toBe("hello1hello2")
				expect(Section.prototype.render).toHaveBeenCalledTimes(3)
				expect(Section.prototype.render).lastReturnedWith(null)
				expect(Paragraph.prototype.render).toHaveBeenCalledTimes(2)


				return new Promise((resolve, reject)=>{
					state.toJS=jest.fn(()=>{
						return {start:{id:"3.2",at:0},end:{id:"3.2",at:0}}
					})

					doc.setState({mode:"viewport",time:Date.now()},()=>{
						const pages=doc.computed.composed
						expect(pages.length).toBe(3)
						expect($(pages).text()).toBe("hello1hello2hello3")

						/**section1&section2 should not be recomposed
						1. section1/2.render should be return null
						2. so paragraph1/2.render should not be called
						*/
						expect(Section.prototype.render).toHaveBeenCalledTimes(6)
						expect(Paragraph.prototype.render).toHaveBeenCalledTimes(3)

						expect(Section.prototype.render).nthReturnedWith(4,null)
						expect(Section.prototype.render).nthReturnedWith(5,null)
						expect(React.isValidElement(Section.prototype.render.mock.results[5].value)).toBe(true)
						//expect(section2.render).lastReturnedWith(null)

						resolve()
					})
				})
			})

			it("scroll with cache(part)/section compose",()=>{
				const node={scrollTop:0}
				const state={
					equals(){
						return false
					},
					toJS(){
						return {start:{id:"2.2",at:0},end:{id:"2.2",at:0}}
					},
					hashCode(){
						return "1234"
					}
				}
				Section.prototype.render=jest.fn(Section.prototype.render)
				Paragraph.prototype.render=jest.fn(Paragraph.prototype.render)
				const doc=compose2(node,state,2)

				const pages=doc.computed.composed
				//expect(pages.length).toBe(2)
				expect($(pages).text()).toBe("hello1hello1.1hello2")
				//section 3 render to null since selection is on section2.paragraph1
				expect(Section.prototype.render).toHaveBeenCalledTimes(3)
				expect(Section.prototype.render).lastReturnedWith(null)

				//section2.paragraph2 render to null since selection is on first paragraph
				expect(Paragraph.prototype.render).toHaveBeenCalledTimes(4)
				expect(Paragraph.prototype.render).lastReturnedWith(null)


				return new Promise((resolve, reject)=>{
					state.toJS=jest.fn(()=>{
						return {start:{id:"3.2",at:0},end:{id:"3.2",at:0}}
					})
					debugger
					doc.setState({mode:"selection",time:Date.now()},()=>{
						const pages=doc.computed.composed
						expect(pages.length).toBe(3)
						expect($(pages).text()).toBe("hello1hello1.1hello2hello2.1hello3")

						/**section1&section2 should not be recomposed
						1. section1/2.render should be return null
						2. so paragraph1/2.render should not be called
						*/
						expect(Section.prototype.render).toHaveBeenCalledTimes(3+3)
						expect(Paragraph.prototype.render).toHaveBeenCalledTimes(4+3)

						expect(Section.prototype.render).nthReturnedWith(4,null)
						expect(Paragraph.prototype.render).nthReturnedWith(7,null)

						expect(React.isValidElement(Section.prototype.render.mock.results[5].value)).toBe(true)
						//expect(section2.render).lastReturnedWith(null)

						resolve()
					})
				})
			})

			xit("change content with cache(all) compose",()=>{
				const node={scrollTop:0}
				const state={
					equals(){
						return false
					},
					toJS(){
						return {start:{id:"2.2",at:0},end:{id:"2.2",at:0}}
					},
					hashCode(){
						return "1234"
					}
				}
				Section.prototype.render=jest.fn(Section.prototype.render)
				Paragraph.prototype.render=jest.fn(Paragraph.prototype.render)
				const doc=compose2(node,state)

				const pages=doc.computed.composed
				expect(pages.length).toBe(2)
				expect($(pages).text()).toBe("hello1hello2")
				expect(Section.prototype.render).toHaveBeenCalledTimes(3)
				expect(Section.prototype.render).lastReturnedWith(null)
				expect(Paragraph.prototype.render).toHaveBeenCalledTimes(2)


				return new Promise((resolve, reject)=>{
					Document.prototype.componentDidUpdate=jest.fn((a,b,c)=>{
						doc.componentDidUpdate(a,b,c)

						const pages=doc.computed.composed
						expect(pages.length).toBe(2)
						expect($(pages).text()).toBe("hello1ahello2")

						/**section1&section2 should not be recomposed
						1. section1/2.render should be return null
						2. so paragraph1/2.render should not be called
						*/
						expect(Section.prototype.render).toHaveBeenCalledTimes(6)
						expect(Paragraph.prototype.render).toHaveBeenCalledTimes(3)

						expect(Section.prototype.render).nthReturnedWith(4,null)
						expect(Section.prototype.render).nthReturnedWith(5,null)
						expect(React.isValidElement(Section.prototype.render.mock.results[5].value)).toBe(true)
						//expect(section2.render).lastReturnedWith(null)

						resolve()
					})

					let [section1, section2, section3]=Children.toArray(doc.props.children)
					let [p1]=Children.toArray(section2.props.children)
					p1=React.cloneElement(p1,{changed:true})
					section2=React.cloneElement(section2,{children:p1,changed:true})
					const {renderer, root}=doc
					renderer.update(React.cloneElement(root,{children:[section1,section2,section3],changed:true}))
				})
			})

			xit("change content with cache(part)[section] compose",()=>{

			})
		})
	})
})
