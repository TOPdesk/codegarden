'use strict';
require('es6-promise').polyfill();

const gulp = require('gulp');
const tslint = require('gulp-tslint');
const changed = require('gulp-changed');
const minifyHtml = require('gulp-minify-html');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefix = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const less = require('gulp-less');
const typescript = require('gulp-typescript');
const browserSync = require('browser-sync');
const del = require('del');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const jasmineBrowser = require('gulp-jasmine-browser');
const karma = require("gulp-karma-runner");

const srcs = {
	buildArtefacts: 'build/**/*',
	scripts: 'src/scripts/**/*.ts',
	html: ['src/*.html', 'src/templates/*.html'],
	styles: 'src/styles/**/*.less',
	assets: 'src/assets/**/*',
	levelEditor: 'src/levelEditor/**/*',
	libs: ['node_modules/phaser/build/phaser.min.js', 'node_modules/sortablejs/Sortable.min.js']
};

const dests = {
	base: 'build',
	libs: 'build/libs/',
	assets: 'build/assets/',
	scripts: 'build/scripts/',
	styles: 'build/styles/',
	levelEditor: 'build/levelEditor',
	githubPages: 'docs/'
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
        .pipe(tslint({
			formatter: 'verbose'
		}))
        .pipe(tslint.report({
			emitError: false
		}));
});

gulp.task('assets', () => {
	return gulp.src(srcs.assets)
		.pipe(changed(dests.assets))
		.pipe(gulp.dest(dests.assets))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', () => {
	const htmlDest = './build';

	return gulp.src(srcs.html)
		.pipe(changed(dests.base))
		.pipe(minifyHtml())
		.pipe(gulp.dest(htmlDest))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('scripts', () => {
	let tsProject = typescript.createProject('tsconfig.json');
	return tsProject.src()
		.pipe(tsProject())
		.pipe(uglify())
		.pipe(sourcemaps.write('build/maps'))
		.pipe(gulp.dest(dests.scripts))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', () => {
	return gulp.src(srcs.styles)
		.pipe(less())
		.pipe(concat('styles.min.css'))
		.pipe(autoprefix('last 2 versions'))
		.pipe(minifyCSS())
		.pipe(gulp.dest(dests.styles))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('cleanWebsite', () => {
	return del([dests.githubPages]);
});

gulp.task('copyWebsite', () => {
	gulp.src(srcs.buildArtefacts).pipe(gulp.dest(dests.githubPages));
});

gulp.task('levelEditor', () => {
	gulp.src(srcs.levelEditor).pipe(gulp.dest(dests.levelEditor));
});

gulp.task('ts-test', () => {
	return gulp.src('src/specs/**/*.spec.ts')
		.pipe(typescript({
			declarationFiles: true,
			target: 'es5'
		}))
		.pipe(gulp.dest('build/specs/'));
});

gulp.task('jasmine-browser', () => {
	return gulp.src([
		'node_modules/phaser/build/phaser.min.js',
		'build/scripts/**/*.js',
		'build/specs/**/*.spec.js'
	])
		.pipe(jasmineBrowser.specRunner())
		.pipe(jasmineBrowser.server({ port: 8888 }));
});

gulp.task('jasmine-karma', () => {
	gulp.src([
		'node_modules/phaser/build/phaser.min.js',
		'build/scripts/**/*.js',
		'build/specs/**/*.spec.js'
	], { 'read': false })
		.pipe(karma.server({
			'singleRun': true,
			'plugins': ['karma-jasmine', 'karma-phantomjs-launcher'],
			'frameworks': ['jasmine'],
			'browsers': ['PhantomJS'],
		})
	);
});

gulp.task('test', function (done) {
	runSequence('clean', 'copy', 'assets', 'scripts', 'ts-test', 'jasmine-karma', () => {
		done();
	});
});

gulp.task('build', ['tslint', 'copy', 'assets', 'html', 'scripts', 'styles']);

gulp.task('website', done => {
	runSequence('clean', 'build', 'cleanWebsite', 'copyWebsite', () => done());
});

gulp.task('default', function (done) {
    runSequence('clean', 'build', 'levelEditor', 'browserSync', () => {
		gulp.watch(srcs.html, ['html']);
		gulp.watch(srcs.assets, ['assets']);
		gulp.watch(srcs.scripts, ['scripts', 'tslint']);
		gulp.watch(srcs.styles, ['styles']);
		gulp.watch(srcs.levelEditor, ['levelEditor']);
        done();
    });
});
