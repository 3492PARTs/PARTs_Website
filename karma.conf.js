// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    // Removed '@angular-devkit/build-angular' from frameworks
    frameworks: ['jasmine'], 
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      // CRITICAL FIX: The old path is replaced by the necessary plugin line
      // which is now part of the @angular/build package structure.
      // This resolves the "Cannot find module '@angular-devkit/build-angular/plugins/karma'" error.
      require('@angular/build/plugins/karma') 
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      // Changed 'parts-website' to 'test-out' to match the directory you had permission issues with, 
      // ensuring all outputs go to a writable location.
      dir: require('path').join(__dirname, './dist/test-out'), 
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeNoSandbox'],
    restartOnFileChange: true,
    customLaunchers: {
      ChromeNoSandbox: {
        // base: 'ChromeHeadless' is correct for CI
        base: 'ChromeHeadless', 
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--disable-dev-shm-usage', // Critical fix for Docker/Jenkins
          '--remote-debugging-port=9222' // Good flag to keep for debugging
        ]
      },
    },
    // Increased timeouts from your original file (good for slow CI runners)
    captureTimeout: 300000, 
    browserDisconnectTolerance: 3, 
    browserNoActivityTimeout: 300000,
  });
};