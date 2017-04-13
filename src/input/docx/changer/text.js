import Base from "state/reducer/text"

export class text extends Base{
	constructor(state, getNode, renderChanged){
		super(state)
		this.getNode=getNode
		this.renderChanged=renderChanged
	}

	insert_withoutSelection_string_withoutNewLine(inserting){
		let {start:{id,at}}=this.selection
		const target=this.getNode(id)

		let text=target.text()
		target.text(text.substring(0,at)+inserting+text.substr(at))
		at+=inserting.length

		this.renderChanged(target.get(0))

		this.updateSelection(id,at)
	}

	//{type:"text/INSERT", payload:"hello\r\nworld"}
	insert_withoutSelection_string_withNewLine(inserting){
		const {start:{id,at}}=this.selection
		let target=this.getNode(id)
		let text=target.text()

		let r=target.closest("w\\:r")
		let p=target.closest("w\\:p")

		let pId=p.attr("id")
		let parentId=this.getParentId(pId)

		let emptyR=r.clone(), emptyP=p.clone()
		console.assert(emptyR.attr("id")==undefined)
		emptyR.find("w\\:t").text("")
		emptyP.find("w\\:r").remove()

		let pieces=inserting.split(/[\r\n]+/g)
		let first=0, last=pieces.length-1
		let cursorId, cursorAt

		pieces.reduceRight((b,piece,i)=>{
			switch(i){
			case first:{
					target.text(text.substring(0,at)+piece)
					this.renderChanged(p.get(0))
					break
				}
			case last:{
					let r0=emptyR.clone(), t0=r0.find("w\\:t")
					t0.text(piece+text.substr(at))
					let p0=emptyP.clone()

					p0.append(r0)
					 .append(target.nextAll())
					 .insertAfter(p)

					let rendered=this.renderChanged(p0.get(0))
					this.updateChildren(parentId, children=>children.splice(children.indexOf(pId)+1,0,rendered.id))
					this.updateSelection(t0.attr("id"), piece.length)
					break
				}
			default:{
					let r0=emptyR.clone()
					r0.find("w\\:t").text(piece)

					let p0=emptyP.clone()
					p0.append(r0)
					  .insertAfter(p)

					let rendered=this.renderChanged(p0)
					this.updateChildren(parentId, children=>children.splice(children.indexOf(pId)+1,0,rendered.id))
				}
			}
		},1)
	}

	remove_withoutSelection_backspace(removing){
		let {start:{id,at}}=this.selection
		const target=this.getNode(id)

		let text=target.text()
		target.text(text.substring(0,at-removing)+text.substr(at))
		at-=removing

		this.renderChanged(target.get(0))
		this.updateSelection(id,at)
	}

	remove_withoutSelection_delete(removing){
		let {start:{id,at}}=this.selection
		const target=this.getNode(id)

		let text=target.text()
		target.text(text.substring(0,at)+text.substr(at-removing))

		this.renderChanged(target.get(0))
	}

	remove_withSelection(){
		const {start,end}=this.selection
		const target0=this.getNode(start.id)
		const target1=this.getNode(end.id)
		const ancestor=target0.parentsUntil(target1.parentsUntil()).last().parent()
		let ancestors0=target0.parentsUntil(ancestor)
		let ancestors1=target1.parentsUntil(ancestor)

		const $=this.file.officeDocument.content
		const willRemove=a=>{
			this.removeContent(a.attribs.id || $(a).find("[id]").attr("id"))
		}

		ancestors0.last().nextUntil(ancestors1.last()).each(willRemove).remove()

		ancestors0.each(a=>$(a).nextAll().each(willRemove).remove())
		ancestors1.each(a=>$(a).prevAll().each(willRemove).remove())

		let text=target0.text()
		target0.text(text.substring(0,start.at))

		text=target1.text()
		target1.text(text.substr(end.at))


		ancestors0.last().append(ancestors1.last().children())
		willRemove(ancestors1.last().get(0))
		ancestors1.last().remove()

		this.renderChanged(ancestors0.last().get(0))
		this.updateSelection(start.id,start.at)
	}
}
