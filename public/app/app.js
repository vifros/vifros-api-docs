var app = angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'ngStorage',
    'treeControl',
    'treeGrid'
  ])
  .run(function ($rootScope) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      $rootScope.current_state = toState.name;
    })
  });