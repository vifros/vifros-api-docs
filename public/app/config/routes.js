app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url        : '/',
      templateUrl: 'app/partials/home.html'
    })
    .state('docs', {
      url        : '/docs',
      templateUrl: 'app/partials/docs.html',
      controller : 'DocsController'
    });
});