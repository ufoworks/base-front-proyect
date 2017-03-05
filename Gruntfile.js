var autoprefixer  = require('autoprefixer');
var cssnano       = require('cssnano');
var webpack       = require('webpack');
var path          = require('path');
var merge         = require('webpack-merge');

module.exports = function(grunt) {
  // Project configuration.
  var config = grunt.file.readJSON('package.json');

  var webpack_config_main = {
    context: path.resolve(__dirname, '<%= pkg.src_folder %>/js'),
    entry: './base.js',
    output: {
      path: path.resolve(__dirname, '<%= pkg.public_folder %>/assets/js/'),
      filename: "bundle.js",
      chunkFilename: "[id].chunk.js",
      publicPath: '/assets/js/'
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        _: "underscore"
      })
    ],
    module: {
      rules: [
        { test: /[\\\/]bower_components[\\\/]modernizr[\\\/]modernizr\.js$/, use: "imports?this=>window!exports?window.Modernizr" },
        { test: /\.css$/, use: ["style-loader","css-loader"] },
        {
          test: /\.scss$/,
          use: [
            "style-loader", 
            "css-loader",
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  return [autoprefixer({browsers: config.browsersSupport })];
                }
              }
            },
            "sass-loader"
          ]
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, '<%= pkg.src_folder %>/js'),
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                ['es2015', { modules: false }]
              ]
            }
          }]
        }
      ]
    }
  };

  var webpack_config_pro = {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: true,
        }
      })
    ]
  };

  grunt.initConfig({
    pkg: config,
    watch: {
      scss: {
        files: [
          '<%= pkg.src_folder %>/scss/**/*.scss'
        ],
        tasks:['sass', 'postcss'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      js: {
        files: [
          '<%= pkg.src_folder %>/js/**/*.js'
        ],
        tasks:['webpack:main'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      html: {
        files: [
          '<%= pkg.src_folder %>/templates/**/*.hbs',
          '<%= pkg.src_folder %>/data/**/*.json'
        ],
        tasks: ['assemble'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      images: {
        files: [
          '<%= pkg.src_folder %>/images/**/*.{jpg,png,svg,gif}'
        ],
        tasks:['newer:imagemin'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },
    sass:{
      dev: {
        options:{
          includePaths: ['node_modules/'],
          sourceMap: true
        },
        files:{
          '<%= pkg.public_folder %>/assets/css/main.css':'<%= pkg.src_folder %>/scss/main.scss'
        }
      }
    },
    svgstore: {
      options: {
        prefix: 'icon-',
        svg: {
          style: 'display: none;'
        },
        cleanup: ['fill','stroke']
      },
      default: {
        files: {
          '<%= pkg.src_folder %>/templates/partials/icons.hbs': ['<%= pkg.src_folder %>/icons/*.svg']
        }
      }
    },
    postcss: {
      options: {
        processors: [
          autoprefixer({browsers: config.browsersSupport })
          //cssnano({safe: true})
        ]
      },
      dev: {
        src: '<%= pkg.public_folder %>/assets/css/main.css'
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
            src : [
                '<%= pkg.public_folder %>/assets/css/*.css',
                '<%= pkg.public_folder %>/assets/js/*.js',
                '<%= pkg.public_folder %>/**/*.html'
            ]
        },
        options: {
            watchTask: true,
            injectChanges: true,
            server: './public'
        }
      }
    },
    imagemin: {
      main: {
        files: [{
          expand: true,
          cwd: '<%= pkg.src_folder %>/images/',
          src: ['**/*.{jpg,png,svg,gif}'],
          dest: '<%= pkg.public_folder %>/assets/images/'
        }]
      }
    },
    webpack: {
      main: webpack_config_main,
      pro: merge(webpack_config_main, webpack_config_pro)
    },
    clean: {
      assets: ['<%= pkg.public_folder %>/assets/**/*'],
      html: ['<%= pkg.public_folder %>/**/*.html']
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: '<%= pkg.src_folder %>/fonts/', src: ['**'], dest: '<%= pkg.public_folder %>/assets/fonts/'}
        ]
      }
    },
    assemble: {
      options: {
        assets: '<%= pkg.public_folder %>/assets',
        layoutdir: '<%= pkg.src_folder %>/templates/layouts/',
        layout: 'default.hbs',
        partials: '<%= pkg.src_folder %>/templates/partials/*.hbs',
      },
      es: {
        options: {
          data: ['<%= pkg.src_folder %>/data/es/*.json'],
          lang: 'es'
        },
        files: [
          {expand: true, cwd: '<%= pkg.src_folder %>/templates/pages/', src: ['*.hbs'], dest: '<%= pkg.public_folder %>/'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-svgstore');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-assemble');
  // User tasks
  grunt.registerTask('dev',['clean','sass','postcss','svgstore','imagemin','webpack:main','copy','assemble']);
  grunt.registerTask('build',['dev','webpack:pro']);
  // Default task(s).
  grunt.registerTask('default', ['browserSync','watch']);
};