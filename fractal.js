'use strict'

/*
* Require the path module
*/
const path = require('path')

/*
 * Require the Fractal module
 */
const fractal = module.exports = require('@frctl/fractal').create()

/*
 * Give your project a title.
 */
fractal.set('project.title', 'Pica - The Raspberry Pi Website Pattern Library')

/*
 * Tell Fractal where to look for components.
 */
fractal.components.set('path', path.join(__dirname, 'components'))
fractal.components.set('label', 'Patterns')

/*
 * Tell Fractal where to look for documentation pages.
 */
fractal.docs.set('path', path.join(__dirname, 'pages'))

/*
 * Tell the Fractal web preview plugin where to look for static assets.
 */
fractal.web.set('static.path', path.join(__dirname, 'public'))

/*
 * Tell the Fractal where to build the static HTML version.
 */
fractal.web.set('builder.dest', __dirname + '/docs')

/*
* Customise the default Mandelbrot theme
*/
const pica_theme = require('@frctl/mandelbrot')({
  nav:  [
    'docs',
    'components'
  ],
  skin: 'red'
})

pica_theme.addLoadPath(__dirname + '/lib/pica-theme')

fractal.web.theme(pica_theme)
