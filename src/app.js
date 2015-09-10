requirejs.config({
    'baseUrl': './src',
    'paths': {
      'jquery': 'https://code.jquery.com/jquery-1.11.3.min',
      'lodash': 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min'
    }
});

// Load the main app module to start the app
requirejs(['./main']);
