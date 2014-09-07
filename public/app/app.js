var app = angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'ngStorage',
    'treeControl',
    'treeGrid'
  ])
  .run(function ($rootScope, $localStorage) {
    $rootScope.themes = [
      'cerulean',
      'cosmo',
      'cyborg',
      'darkly',
      'flatly',
      'journal',
      'lumen',
      'paper',
      'readable',
      'sandstone',
      'simplex',
      'slate',
      'spacelab',
      'superhero',
      'united',
      'yeti'
    ];

    $rootScope.selected_theme = $localStorage.selected_theme || 'slate';

    $rootScope.changeTheme = function (theme) {
      $rootScope.selected_theme = $localStorage.selected_theme = theme;
    };

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      $rootScope.current_state = toState.name;
    })
  });