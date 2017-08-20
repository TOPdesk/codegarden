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
const karma = require('karma');
//Texture atlas dependencies
const spritesmith = require('gulp.spritesmith');
const texturePacker = require('spritesmith-texturepacker');

const srcs = {
	buildArtefacts: 'build/**/*',
	scripts: 'src/scripts/**/*.ts',
	html: ['src/*.html', 'src/templates/*.html'],
	styles: 'src/styles/**/*.less',
	sprites: 'src/assets/sprites/**/*.png',
	assets: ['src/assets/**/*', '!src/assets/sprites/**/*'],
	levelEditor: 'src/levelEditor/**/*',
	libs: ['node_modules/phaser/build/phaser.min.js', 'node_modules/sortablejs/Sortable.min.js']
};

const dests = {
	base: 'build',
	libs: 'build/libs/',
	sprites: 'build/assets/sprites',
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

gulp.task('sprites', () => {
	return gulp.src(srcs.sprites)
		.pipe(spritesmith({
			imgName: 'sprites.png',
			cssName: 'sprites.json',
			algorithm: 'binary-tree',
			padding: 2,
			cssTemplate: texturePacker
		})).pipe(gulp.dest(dests.sprites))
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

gulp.task('watchAll', () => {
	gulp.watch(srcs.html, ['html']);
	gulp.watch(srcs.sprites, ['sprites']);
	gulp.watch(srcs.assets, ['assets']);
	gulp.watch(srcs.scripts, ['scripts', 'tslint']);
	gulp.watch(srcs.styles, ['styles']);
	gulp.watch(srcs.levelEditor, ['levelEditor']);
});

function startKarma(done, singleRun) {
	new karma.Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun
	}, done).start();
}

gulp.task('test', function (done) {
	runSequence('clean', 'build', () => startKarma(done, true));
});

gulp.task('test-watch', function (done) {
	runSequence('clean', 'build', 'watchAll', () => startKarma(done, false));
});

gulp.task('dev', ['default'], (done) => startKarma(done, false));

gulp.task('build', ['tslint', 'copy', 'sprites', 'assets', 'html', 'scripts', 'styles']);

gulp.task('website', () => runSequence('clean', 'build', 'cleanWebsite', 'copyWebsite'));

gulp.task('default', (done) => runSequence('clean', 'build', 'levelEditor', 'browserSync', 'watchAll', done));
