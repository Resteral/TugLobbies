/**
 * Build script for TUG Lobbies application
 * Uses esbuild for bundling and development server
 */

import * as esbuild from 'esbuild'
import { stylePlugin } from 'esbuild-style-plugin'
import { rimrafSync } from 'rimraf'

const isProduction = process.argv.includes('--production')

// Clean dist directory
rimrafSync('dist')

// Common build options
const buildOptions = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  minify: isProduction,
  sourcemap: !isProduction,
  target: 'es2020',
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic',
  external: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg'],
  plugins: [
    stylePlugin({
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')]
      }
    })
  ],
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.css': 'css'
  },
  define: {
    'process.env.NODE_ENV': isProduction ? '"production"' : '"development"'
  }
}

// Development server
if (!isProduction) {
  const ctx = await esbuild.context({
    ...buildOptions,
    write: false
  })

  await ctx.serve({
    servedir: '.',
    port: 3000,
    host: 'localhost'
  })

  console.log('🚀 Development server running at http://localhost:3000')
} else {
  // Production build
  await esbuild.build(buildOptions)
  console.log('✅ Production build completed!')
}
