module.exports = function (config) {
    config.set({
        basePath: './',
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/lodash/lodash.min.js',
            'bower_components/jquery/dist/jquery.min.js',
            'src/**/*.js',
            'src/**/*.html'
        ],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: [
            'Chrome'
            //'PhantomJS'
        ],
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-ng-html2js-preprocessor'
        ],

        reporters: ['progress', 'coverage', 'junit'],

        // generate js files from html templates
        preprocessors: {
            'src/autocomplete/*.html': ['ng-html2js'],
            'src/autocomplete/*.js': ['coverage']
        },
        ngHtml2JsPreprocessor: {
        //    // If your build process changes the path to your templates,
        //    // use stripPrefix and prependPrefix to adjust it.
        //    stripPrefix: "src/autocomplete/",
        //    prependPrefix: "web/path/to/templates/",
            // the name of the Angular module to create
            moduleName: "my.templates"
        },

        junitReporter: {
            outputFile: 'test-results/unit.xml',
            suite: 'unit'
        },

        // add plugin settings
        coverageReporter: {
            // type of file to output, use text to output to console
            type: 'text',
            // directory where coverage results are saved
            dir: 'test-results/coverage/'
            // if type is text or text-summary, you can set the file name
            // file: 'coverage.txt'
        }

    });
};
