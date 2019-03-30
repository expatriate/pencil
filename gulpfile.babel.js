import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import svgSprite from 'gulp-svg-sprite';
import del from 'del';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const compileStyles = () => {
    const AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 6',
        'opera >= 23',
        'ios >= 6',
        'android >= 4.4',
        'bb >= 10',
        'iOS 7'
    ];

    return gulp.src([
        'src/scss/styles.scss',
        ])
        .pipe($.sass())
        .pipe(gulp.src([
        'src/scss/helpers/*.css',
        'src/scss/*.css']))
        .pipe($.concat('main.css'))
        .pipe($.plumber({
            errorHandler: $.notify.onError({
                title: 'SASS',
                message: '<%= error.message %>'
            })
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('dist/css'))
        .pipe(gulp.dest('src/css'))
        .pipe($.size({title: 'Styles'}))
        .pipe(browserSync.stream());

}

const compileSvgIconsSrc = () => {

    return gulp.src(['src/img/svg/*.svg', 'src/img/icons/*.svg'])
        .pipe($.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe($.cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe($.replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg',
                    render: {
                        scss: {
                            dest: 'sprite.scss',
                            template: 'src/scss/helpers/_sprite_template.scss'
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest('src/svg/'))
}

const compileSvgIconsDist = () => {
    return gulp.src('src/svg/*.svg')
        .pipe(gulp.dest('dist/svg'))
}

const compileSvgSass = () => {
    return gulp.src('src/svg/symbol/sprite.scss')
        .pipe($.sass())
        .pipe(gulp.dest('dist/css'))
        .pipe(gulp.dest('src/css'))
        .pipe($.size({title: 'SVG scss'}))
        .pipe(browserSync.stream());
}

const compileSvg = gulp.series(compileSvgIconsSrc, compileSvgIconsDist, compileSvgSass)

const compileScripts = () => {
    const babelOptions = {
        presets: ['@babel/preset-env'],
    };
    gulp.src('./src/js/vendor.min.js')
        .pipe(gulp.dest('dist/js'));
    return gulp.src([
        'vendor/*.js', './src/js/*.js'])
        //.pipe($.concat('main.js'))
        .pipe($.babel(babelOptions))
        //.pipe(terser())
        .pipe(gulp.dest('dist/js'))
        .pipe($.size({title: 'Scripts'}))
        .pipe(browserSync.stream());
}

const optimizeImages = () => {
    return gulp.src('./src/img/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img'))
        .pipe($.size({title: 'Images'}))
}

// BrowserSync Reload
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
    gulp.watch(['./src/scss/*.{scss, css}', './src/scss/**/*.{scss, css}'], compileStyles);
    gulp.watch('./src/js/*.js', compileScripts);
    gulp.watch('./src/img/svg/*', compileSvg);
    gulp.watch('./src/*.html', browserSyncReload);
}


const startServer = (done) => {
    browserSync({
        //notify: false,
        //logPrefix: 'WSK',
        //scrollElementMapping: ['main', '.mdl-layout'],
        server: './src',
        //watch: true,
        port: 3000
    });

    done();
}

const clear = (done) => {
    del.sync(['dist/*'])
    done()
}

const copy = (done) => {
    gulp.src(['./src/*.html']).pipe(gulp.dest('dist'));
    gulp.src(['./src/*.png', './src/*.png']).pipe(gulp.dest('dist/'));
    gulp.src(['./src/fonts/*']).pipe(gulp.dest('dist/fonts'));
    done()
}

const compile = gulp.series(compileStyles, compileScripts)
compile.description = 'compile all sources'

const serve = gulp.series(clear, compile, optimizeImages, copy, compileSvg, startServer)
serve.description = 'serve compiled source on local server at port 3000'

/*const watch = gulp.parallel(watchScripts, watchStyles, watchSvg)
watch.description = 'watch for changes to all source'*/

const build = gulp.series(clear, compile, optimizeImages, copy, compileSvg)
build.description = 'craft build'

const defaultTasks = gulp.series(serve, watchFiles)


export {
  compile,
  compileScripts,
  compileStyles,
  compileSvg,
  compileSvgIconsSrc,
  compileSvgIconsDist,
  compileSvgSass,
  serve,
  copy,
  optimizeImages,
  //watch,
  build,
  clear
}

export default defaultTasks