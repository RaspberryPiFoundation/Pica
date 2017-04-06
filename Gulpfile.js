/*eslint-env node*/

'use strict'

// Load Fractal
const fractal       = require('@frctl/fractal').create()

// Load generic node stuff
// const exec          = require('child_process').exec
// const fs            = require('fs');
const logger        = fractal.cli.console
// const reload        = require('require-reload')(require)

// Load package.json as JSON object
let pkg             = require('./package.json')

// Load Gulp and its dependencies
const gulp          = require('gulp')
const autoprefixer  = require('gulp-autoprefixer')
const babel         = require('gulp-babel')
// const bump          = require('gulp-bump')
const cssnano       = require('gulp-cssnano')
const header        = require('gulp-header')
const imagemin      = require('gulp-imagemin')
// const notify        = require('gulp-notify')
// const plumber       = require('gulp-plumber')
const rename        = require('gulp-rename')
const sass          = require('gulp-sass')
const sass_glob     = require('gulp-sass-glob')
const sourcemaps    = require('gulp-sourcemaps')
const uglify        = require('gulp-uglify')
// const util          = require('gulp-util')

// Set banner template
const banner = [
  '/**',
  ' * <%= dest_file %>',
  ' * ',
  ' * <%= pkg.friendly_name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' */',
  '',
  ''
].join('\n')

// Get configuration files
const assets_config = require('./config/assets.json')
// const dist_config   = require('./config/dist.json')

let process_images = () => {
  let config = assets_config.images

  return gulp.src(config.source + '/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(config.dest_dir))
}

let process_javascripts = () => {
  let config     = assets_config.javascripts
  const main     = config.main
  const dest_dir = config.dest_dir

  return gulp.src(config.source + '/' + main)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(header(banner, {
      dest_file: config.dest_file,
      pkg:       pkg
    }))
    .pipe(gulp.dest(dest_dir))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(header(banner, {
      dest_file: config.min_file,
      pkg:       pkg
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest_dir))
}

let process_main_stylesheet = () => {
  let config   = assets_config.stylesheets
  let main     = config.main
  let dest_dir = config.dest_dir

  return gulp.src(config.source + '/' + main)
    .pipe(sourcemaps.init())
    .pipe(sass_glob())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(header(banner, {
      dest_file: config.dest_file,
      pkg:       pkg
    }))
    .pipe(gulp.dest(dest_dir))
    .pipe(cssnano())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(header(banner, {
      dest_file: config.min_file,
      pkg:       pkg
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest_dir))
}

let process_component_stylesheet = (event) => {
  let file_path = event.path
  let dest_dir  = file_path.match(/^(.*[\\\/])/)[0]

  gulp.src(file_path)
    .pipe(sass_glob())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(dest_dir))

  return process_main_stylesheet()
}

gulp.task('images',      () => { return process_images()          })
gulp.task('javascripts', () => { return process_javascripts()     })
gulp.task('stylesheets', () => { return process_main_stylesheet() })

gulp.task('all', ['images', 'javascripts', 'stylesheets'])

gulp.task('watch', () => {
  gulp.watch(assets_config.images.source      + '/**',        ['images'])
  gulp.watch(assets_config.javascripts.source + '/**/*.js',   ['javascripts'])
  gulp.watch(assets_config.stylesheets.source + '/**/*.scss', ['stylesheets'])
  gulp.watch('./components/**/*.scss', (callback) => { return process_component_stylesheet(callback) })
})

gulp.task('fractal:start', () => {
  const server = fractal.web.server({
    sync: true
  })

  server.on('error', err => logger.error(err.message))

  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`)
  })
})

gulp.task('default', ['all', 'watch'])
