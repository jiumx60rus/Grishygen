module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    # stylus
    stylus:
      compile:
        files:
          "ready/css/stylus.css": "src/stylus/main.styl"

    # concat
    concat:
      css:
        src: "ready/css/*.css"
        dest: "assets/style.css"

      js:
        src: "ready/js/*.js"
        dest: "assets/main.js"

    # connect
    connect:
      server:
        options:
          hostname: "localhost"
          port: 3000
          base: "public"

    # watch
    watch:
      livereload:
        options:
          livereload: on
        files: ["public/**/*"]
      js:
        files: ["ready/js/**/*.js"]
        tasks: ["concat:js"]
      css:
        files: ["ready/css/**/*.css"]
        tasks: ["concat:css"]
      stylus:
        files: ["src/stylus/**/*.styl"]
        tasks: ["stylus"]


  grunt.loadNpmTasks "grunt-contrib-stylus"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-connect"

  grunt.registerTask "default", [
    "stylus"
    "concat:css"
    "concat:js"
    "connect"
    "watch"
  ]