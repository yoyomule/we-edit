export class Measure{
    constructor(style){
		const {fonts, size}=style
		this.style=style
		this.fontFamily=fonts.split(",").map(a=>a.trim()).filter(a=>!!a)[0]
		this.size=size
		const {height, descent}=this.lineHeight()
        this.height=Math.ceil(height)
		this.descent=Math.ceil(descent)

		this.defaultStyle={
			whiteSpace:'pre',
			fontSize:`${size}pt`,
			fontWeight:style.bold ? 700 : 400,
			fontStyle:style.italic ? "italic" : "normal",
			height: this.height,
			descent: this.descent,
			fontFamily:this.fontFamily
		}
    }

	lineHeight(){
		return {height:25,descent:2}
	}

	stringWidth(string){
		return 200
	}
	
	widthString(width,string){
		return Array.prototype.reduce.call(string,(state,a)=>{
			if(state.done)
				return state
			
			let aWidth=this.stringWidth(a)
			if(state.width+aWidth>width){
				state.done=true
				if(width-state.width>state.width+aWidth-width){
					state.width+=aWidth
					state.text+=a
				}
			}else{
				state.width+=aWidth
				state.text+=a
			}
			return state
		},{width:0,text:"",done:false}).text.length
	}
}

export default Measure