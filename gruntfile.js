module.exports = function(grunt) {

  grunt.initConfig({
   tsc: {
        options: {
            // global options 
        },
        task_name: {
            options: {
                // task options 
            },
            files: [{
                expand : true,
                dest   : "dist/out-tsc",
                cwd    : "source",
                ext    : ".js",
                src    : [
                    "*.ts",
                    "!*.d.ts"
                ]
            }]
        }
    },
    watch: {
      files: ['source/**/*.ts'],
      tasks: ['tsc']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-tsc");

};