app.controller('NavBarController', function ($scope, APIService, $state, $modal) {
  $scope.url = APIService.getURL();
  $scope.processing = false;

  $scope.getAPIDocs = function () {
    // Update the API URL.
    APIService.setURL($scope.url);

    $scope.processing = true;

    APIService.getSchemaFromServer()
      .success(function () {

        $scope.processing = false;
        $state.go('docs');

      }).error(function (data, status) {
        $modal.open({
          backdrop   : 'static',
          size       : 'sm',
          templateUrl: 'app/partials/modal.html',
          controller : function ($scope, $modalInstance) {
            $scope.title = 'You hit an error';
            $scope.message = 'ERROR!!! Status Code: ' + status;

            $scope.ok = function () {
              $modalInstance.close();
            };
          }
        });

        $scope.processing = false;
      });
  }
});