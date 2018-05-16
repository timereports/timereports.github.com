module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      '../../js/bower_components/jquery/dist/jquery.js',
      '../../js/bower_components/angular/angular.js',
      '../../timedata.js',
      '../../js/app.js',
      '../../test/qunit/**/*.js'
    ],

    exclude : [
      '../../test/qunit/main.js'
    ],

    autoWatch : true,

    frameworks: ['qunit'],

    browsers: ['ChromeHeadlessNoSandbox'],
    
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    plugins : [
            'karma-chrome-launcher',
            'karma-qunit',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
