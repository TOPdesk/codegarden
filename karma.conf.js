// Karma configuration
// Generated on Fri Jul 28 2017 14:23:57 GMT+0200 (W. Europe Daylight Time)

module.exports = function(config) {
	config.set({
		
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',
		
		
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'sinon-chai'],
		
		
		// list of files / patterns to load in the browser
		files: [
			'node_modules/phaser/build/phaser.min.js',
			'build/scripts/**/*.js',
			'src/tests/**/*.test.js',
			'src/assets/levels/*.json'
		],
		
		
		// list of files to exclude
		exclude: [
		],
		
		client: {
			chai: {
				includeStack: true
			}
		},
		babelPreprocessor: {
			options: {
				presets: ['es2015'],
				sourceMap: 'inline'
			}
		},
		jsonFixturesPreprocessor: {
			// strip this from the file path \ fixture name
			stripPrefix: 'src/assets/levels/',
			// change the global fixtures variable name
			variableName: '__levels__'
		},
		
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'src/tests/**/*.test.js': ['babel'],
			'src/assets/levels/*.json': ['json_fixtures']
		},
		
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],
		
		
		// web server port
		port: 9876,
		
		
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		
		
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,
		
		
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		
		
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['PhantomJS'],
		
		
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,
		
		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	})
};
