import HtmlMeasure from "./html"

let canvas=null, ctx2d=null
let DEFAULT_STYLE="margin:0;padding:0;border:0;position:absolute;left:-1000px"
export default class CanvasMeasure extends HtmlMeasure{
    lineHeight(){
		if(!ctx2d){
			canvas=document.createElement('canvas')
			document.body.appendChild(canvas)
			canvas.style=""
			ctx2d=canvas.getContext('2d')
		}
		ctx2d.font=`${this.size}pt ${this.fontFamily}`

        return super.lineHeight()
    }

    stringWidth(word){
		ctx2d.font=`${this.size}pt ${this.fontFamily}`
        return ctx2d.measureText(word).width
    }
}
