const path = require('path');
const webpack = require("webpack");
const packages=(function(){
	let ps=require("fs")
		.readdirSync("./packages")
		.filter(a=>a.startsWith("we-edit"))
		.sort()
	return ps
})();

module.exports=(env,args)=>{
	const base={
		entry:"./src/index.js",
		output:{
			filename:"[name].js",
			path:path.resolve(__dirname, 'dist')
		},
		module:{
			rules:[{
				test: /\.js?$/,
				use: ['babel-loader'],
				exclude: /node_modules/,
				include: /src/
			},{
				test: /\.js?$/,
				use: ["transform-loader/cacheable?brfs"],
				enforce:"post",
				include: /(linebreak|unicode-properties|fontkit|pdfkit)/
			},{
				test:/\.less?$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					'less-loader'
				]
			}]
		},
		resolve:{
			symlinks:false,
		},
		plugins:[],
		node:{
			fs: "empty",
			stream: true,
		},
		stats:"errors-only",
	}

	if(env){
		return require(`./webpack.${env}.js`)(base, packages, args)
	}

	return base
}
