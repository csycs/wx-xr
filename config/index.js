const config = {
  projectName: 'wx-xr-app',
  date: '2025-3-12',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [
      { from: 'src/assets/images', to: 'dist/assets/images' },
      { from: 'src/assets/videos', to: 'dist/assets/videos' },
      { from: 'src/assets/models', to: 'dist/assets/models' }
    ],
    options: {}
  },
  framework: 'vue3',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.alias
        .set('@', process.cwd() + '/src')
        .set('@/components', process.cwd() + '/src/components')
        .set('@/utils', process.cwd() + '/src/utils')
        .set('@/services', process.cwd() + '/src/services')
        .set('@/stores', process.cwd() + '/src/stores')
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
