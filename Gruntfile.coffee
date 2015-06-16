module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
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

  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-connect"

  grunt.registerTask "default", [
    "connect"
    "watch"
  ]