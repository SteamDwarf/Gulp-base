//import { deleteAsync } from "del";
const {src, dest, watch, series, parallel} = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const browsersync = require('browser-sync');
const ts = require('gulp-typescript');
const newer = require('gulp-newer');

const paths = {
    html: {
        src: './src/**/*.html',
        dest: './dist/'
    },
    fonts: {
        src: [
            './src/assets/fonts/**/*.ttf',
            './src/assets/fonts/**/*.woff',
            './src/assets/fonts/**/*.woff2',
            './src/assets/fonts/**/*.eot'
        ], 
        dest: './dist/assets/fonts/'
    },
    styles: {
        src: ['./src/styles/**/*.sass', './src/styles/**/*.scss'],
        dest: './dist/css/'
    },
    scripts: {
        src: './src/scripts/**/*.js',
        dest: './dist/scripts/'
    },
    ts: {
        src: './src/scripts/**/*.ts',
        dest: './dist/scripts/'
    },
    images: {
        src: './src/assets/images/**/*',
        dest: './dist/assets/images/'
    }
}

const html = () => {
    return src(paths.html.src)
            .pipe(htmlmin({ collapseWhitespace: true }))
            .pipe(dest(paths.html.dest))
            .pipe(browsersync.stream());
}

const fonts = () => {
    return src(paths.fonts.src)
            .pipe(newer(paths.fonts.dest))
            .pipe(dest(paths.fonts.dest))
            .pipe(browsersync.stream());
}

const styles = () => {
    return src(paths.styles.src)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(autoprefixer({cascade: false}))
            .pipe(cleanCSS({
                level: 2
            }))
            .pipe(concat('styles.min.css'))
            .pipe(sourcemaps.write('.'))
            .pipe(dest(paths.styles.dest))
            .pipe(browsersync.stream())
}

const scripts = () => {
    return src(paths.scripts.src)
            .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(concat('scripts.min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(dest(paths.scripts.dest))
            .pipe(browsersync.stream())
}

const typescript = () => {
    return src(paths.ts.src)
            .pipe(sourcemaps.init())
            .pipe(ts({
                "noImplicitAny": true,
                "strict": true,
                "target": "es5",
            }))
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(concat('scripts.min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(dest(paths.scripts.dest))
            .pipe(browsersync.stream())
}

const img = () => {
    return src(paths.images.src)
            .pipe(newer(paths.images.dest))
            .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 1}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]))
            .pipe(dest(paths.images.dest))
}

const watchFiles = () => {
    browsersync.init({
        server: {
            baseDir: './dist/'
        }
    })

    watch(paths.html.src, html);
    watch(paths.fonts.src, fonts);
    watch(paths.styles.src, styles);
    watch(paths.images.src, img);
    watch(paths.scripts.src, scripts);
}

const watchFilesTS = () => {
    browsersync.init({
        server: {
            baseDir: './dist/'
        }
    })

    watch(paths.html.src, html);
    watch(paths.fonts.src, fonts);
    watch(paths.styles.src, styles);
    watch(paths.images.src, img);
    watch(paths.ts.src, typescript);
}


const cleanDist = () => src('dist').pipe(clean());

const dev = series(cleanDist, fonts, img, html, parallel(styles, scripts), watchFiles);
const build = series(cleanDist, fonts, img, html, parallel(styles, scripts));

const devTS = series(cleanDist, fonts, img, html, parallel(styles, typescript), watchFilesTS);
const buildTS = series(cleanDist, fonts, img, html, parallel(styles, typescript));

exports.cleanDist = cleanDist;
exports.html = html;
exports.fonts = fonts;
exports.styles = styles;
exports.scripts = scripts;
exports.typescript = typescript;
exports.img = img;

exports.build = build;
exports.dev = dev;
exports.buildTS = buildTS;
exports.devTS = devTS;




