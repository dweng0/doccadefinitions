module.exports = function(grunt) {

  grunt.initConfig({
    exec:{
        compile:{
            command:"tsc",
            stdout:true,
            stderr:true
        }
    },
    watch: {
      scripts: {
        files: ['source/**/*.ts'],
        tasks: ['exec']
    },
    }
  });
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-contrib-watch');
};