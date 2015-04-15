exports.config = {
	paths: {
		public: "build",
		watched: ["baseline"]
	},
	
	conventions: {
		assets: /examples[\\/]/
	},
	
	files: {
		javascripts: {
			joinTo: 'baseline.js'
		}
	}
}