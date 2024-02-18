module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{png,html,css}'
	],
	swDest: 'public/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};