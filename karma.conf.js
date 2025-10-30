// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    // CRITICAL FIX: Add this back. This is what tells Karma to load the Angular plugin.
    frameworks: ['jasmine', '@angular-devkit/build-angular'], 
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      // CRITICAL FIX: REMOVED the "require('...')" line entirely,
      // as the module is now loaded implicitly via the 'frameworks' array.
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
      // Adjusted path as per our previous step
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
        base: 'ChromeHeadless', 
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--disable-dev-shm-usage', // Critical fix for Docker/Jenkins
          '--remote-debugging-port=9222' 
        ]
      },
    },
    // Increased timeouts from your original file (good for slow CI runners)
    captureTimeout: 300000, 
    browserDisconnectTolerance: 3, 
    browserNoActivityTimeout: 300000,
  });
};