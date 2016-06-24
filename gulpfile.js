require('es6-promise').polyfill();

var gulp = require('gulp');

// plug-ins
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
var jasmine = require('gulp-jasmine');

// definition of source paths
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

// browser sychnoization
gulp.task('browserSync', function () {
	browserSync({
		server: {
			baseDir: dests.base
		}
	});
});

// clean
gulp.task('clean', function () {
	return del([dests.base]);
});

// copy files needed
gulp.task('copy', function () {
	return gulp.src(srcs.libs)
		.pipe(gulp.dest(dests.libs))
		.pipe(browserSync.reload({ stream: true }));
});

// TS lint task
gulp.task('tslint', function () {
	return gulp.src(srcs.scripts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

// copy assets
gulp.task('assets', function () {
	return gulp.src(srcs.assets)
		.pipe(changed(dests.assets))
		.pipe(gulp.dest(dests.assets))
		.pipe(browserSync.reload({ stream: true }));
});

// minify html
gulp.task('html', function () {
	var htmlDest = './build';

	return gulp.src(srcs.html)
		.pipe(changed(dests.base))
		.pipe(minifyHtml())
		.pipe(gulp.dest(htmlDest))
		.pipe(browserSync.reload({ stream: true }));
});

// JS concat, strip debugging and minify
gulp.task('scripts', function () {
	return gulp.src(srcs.scripts)
		.pipe(sourcemaps.init())
		.pipe(typescript({
			declarationFiles: true,
			noExternalResolve: false,
			sortOutput: true
		}))
		.pipe(concat('script.min.js'))
		// .pipe(stripDebug())
		.pipe(uglify())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dests.scripts))
		.pipe(browserSync.reload({ stream: true }));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function () {
	return gulp.src(srcs.styles)
		.pipe(sass())
		.pipe(concat('styles.min.css'))
		.pipe(autoprefix('last 2 versions'))
		.pipe(minifyCSS())
		.pipe(gulp.dest(dests.styles))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('copy-test-results-html', function () {
	return gulp.src('src/specs/SpecRunner.html')
		.pipe(gulp.dest('build/specs/'));
});

gulp.task('ts-to-be-tested', function () {
	return gulp.src('src/scripts/coordinates.ts')
		.pipe(typescript({
			declarationFiles: true,
			noExternalResolve: false,
			sortOutput: true
		}))
		.pipe(gulp.dest('build/scripts/'))
});

gulp.task('ts-test', function () {
	return gulp.src('src/specs/coordinates.spec.ts')
		.pipe(typescript({
			declarationFiles: true,
			noExternalResolve: false,
			sortOutput: true
		}))
		.pipe(gulp.dest('build/specs/'));
});

gulp.task('test', function (done) {
	runSequence('clean', 'copy', 'copy-test-results-html', 'ts-to-be-tested', 'ts-test', 'browserSync', function() { 
		done();
	});
});

// build only
gulp.task('build', ['tslint', 'copy', 'assets', 'html', 'scripts', 'styles', 'browserSync'], function () {
});

// default task
gulp.task('default', function (done) {
    runSequence('clean', 'build', function () {
		gulp.watch(srcs.html, ['html']);
		gulp.watch(srcs.assets, ['assets']);
		gulp.watch(srcs.scripts, ['scripts']);
		gulp.watch(srcs.styles, ['styles']);
        done();
    });
});


