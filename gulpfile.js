require('es6-promise').polyfill();

var gulp = require('gulp');
var tslint = require('gulp-tslint');
var changed = require('gulp-changed');
var minifyHtml = require('gulp-minify-html');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var sass = require('gulp-sass');
var typescript = require('gulp-typescript');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var jasmineBrowser = require('gulp-jasmine-browser');
var karma = require("gulp-karma-runner");

var srcs = {
	scripts: 'src/scripts/**/*.ts',
	html: ['src/*.html', 'src/templates/*.html'],
	styles: 'src/styles/**/*.scss',
	assets: 'src/assets/**/*',
	libs: ['src/libs/phaser/build/phaser.min.js', 'src/libs/jasmine-core/**/*']
};

var dests = {
	base: 'build',
	libs: 'build/libs/',
	assets: 'build/assets/',
	scripts: 'build/scripts/',
	styles: 'build/styles/'
};

gulp.task('browserSync', () => {
	browserSync({
		server: {
			baseDir: dests.base
		}
	});
});

gulp.task('clean', () => {
	return del([dests.base]);
});

gulp.task('copy', () => {
	return gulp.src(srcs.libs)
		.pipe(gulp.dest(dests.libs))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('tslint', () => {
	return gulp.src(srcs.scripts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('assets', () => {
	return gulp.src(srcs.assets)
		.pipe(changed(dests.assets))
		.pipe(gulp.dest(dests.assets))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', () => {
	var htmlDest = './build';

	return gulp.src(srcs.html)
		.pipe(changed(dests.base))
		.pipe(minifyHtml())
		.pipe(gulp.dest(htmlDest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('scripts', () => {
	return gulp.src(srcs.scripts)
		.pipe(sourcemaps.init())
		.pipe(typescript({
			declarationFiles: true,
			noExternalResolve: false,
			sortOutput: true,
			target: 'es5'
		}))
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dests.scripts))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', () => {
	return gulp.src(srcs.styles)
		.pipe(sass())
		.pipe(concat('styles.min.css'))
		.pipe(autoprefix('last 2 versions'))
		.pipe(minifyCSS())
		.pipe(gulp.dest(dests.styles))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('ts-test', () => {
	return gulp.src('src/specs/**/*.spec.ts')
		.pipe(typescript({
			declarationFiles: true,
			noExternalResolve: false,
			sortOutput: true,
			target: 'es5'
		}))
		.pipe(gulp.dest('build/specs/'));
});

gulp.task('jasmine-browser', () => {
	return gulp.src([
		'build/libs/phaser.min.js',
		'build/scripts/**/*.js',
		'build/specs/**/*.spec.js'
	])
		.pipe(jasmineBrowser.specRunner())
		.pipe(jasmineBrowser.server({ port: 8888 }));
});

gulp.task('jasmine-karma', () => {
	gulp.src([
		'build/libs/phaser.min.js',
		'build/scripts/**/*.js',
		'build/specs/**/*.spec.js'
	], { 'read': false })
		.pipe(karma.server({
			'singleRun': true,
			'plugins': ['karma-jasmine', 'karma-phantomjs-launcher'],
			'frameworks': ['jasmine'],
			'browsers': ['PhantomJS']
		})
		);
});

gulp.task('test', function (done) {
	runSequence('clean', 'copy', 'scripts', 'ts-test', 'jasmine-karma', () => {
		done();
	});
});

gulp.task('build', ['tslint', 'copy', 'assets', 'html', 'scripts', 'styles', 'browserSync'], () => {
});

gulp.task('default', function (done) {
    runSequence('clean', 'build', () => {
		gulp.watch(srcs.html, ['html']);
		gulp.watch(srcs.assets, ['assets']);
		gulp.watch(srcs.scripts, ['scripts']);
		gulp.watch(srcs.styles, ['styles']);
        done();
    });
});
