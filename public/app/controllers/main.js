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

app.controller('DocsController', function ($scope, APIService, UtilsService) {
  $scope.treeOptions = {
    nodeChildren : 'children',
    dirSelectable: true,
    injectClasses: {
      ul           : 'a1',
      li           : 'a2',
      liSelected   : 'a7',
      iExpanded    : 'a3',
      iCollapsed   : 'a4',
      iLeaf        : 'a5',
      label        : 'a6',
      labelSelected: 'a8'
    }
  };

  var cached_schema = APIService.getCachedSchema();

  UtilsService.iterate(cached_schema, [], function (object, stack) {
    if (stack[stack.length - 2] == 'children') {
      // Inject shortcut handy properties that can be inferred.
      object.path = stack.slice(-1)[0];

      var cached_path = stack.join('');
      var methods_map = {
        GET   : 'show',
        POST  : 'create',
        PUT   : 'update',
        DELETE: 'delete'
      };

      for (var method in object.methods) {
        if (object.methods.hasOwnProperty(method)) {
          object.methods[method].usage = {
            CLI : 'vifros ' + methods_map[method] + cached_path.replace(/children/g, ' '),
            HTTP: method + ' ' + cached_path.replace(/children/g, '/')
          }
        }
      }
    }
  });

  $scope.schema = cached_schema;
  $scope.selected_node = null;

  $scope.onSelectTreeItem = function (node) {
    $scope.selected_node = node;

    var tabs = [];
    for (var method in node.methods) {
      if (node.methods.hasOwnProperty(method)) {
        tabs.push({
          title  : method,
          content: node.methods[method]
        });
      }
    }

    $scope.tabs = tabs;
  };

  $scope.onSelectTab = function (tab) {
    $scope.tree_data = [
      {
        name      : "USA",
        type      : 9826675,
        required: true,
        TimeZone  : "UTC -5 to -10",
        children  : [
          {
            Name      : "California",
            Area      : 423970,
            Population: 38340000,
            TimeZone  : "Pacific Time",
            children  : [
              {
                Name      : "San Francisco",
                Area      : 231,
                Population: 837442,
                TimeZone  : "PST"},
              {
                Name      : "Los Angeles",
                Area      : 503,
                Population: 3904657,
                TimeZone  : "PST"}
            ]
          },
          {
            Name      : "Illinois",
            Area      : 57914,
            Population: 12882135,
            TimeZone  : "Central Time Zone",
            children  : [
              {
                Name      : "Chicago",
                Area      : 234,
                Population: 2695598,
                TimeZone  : "CST"}
            ]
          }
        ]
      },
      {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"}
    ];

    console.log(compatibilizeSchemaForTreeGrid(tab.content.request))

    $scope.treegrid_data = {
      response: (tab.content.response) ? compatibilizeSchemaForTreeGrid(tab.content.response) : null,
      request : (tab.content.request) ? compatibilizeSchemaForTreeGrid(tab.content.request) : null
    };
  };

  function compatibilizeSchemaForTreeGrid(root_schema) {
    var params_collection = [];

    if (root_schema.type == 'object') {
      for (var prop in root_schema.properties) {
        var param = {};

        if (root_schema.properties.hasOwnProperty(prop)) {
          param.name = prop;

          if (root_schema.properties[prop].type == 'object') {
            // Further process the object by nesting the function call since it has children properties.
//            if (!param.children) {
//              param.children = [];
//            }
//
//            for (var nested_prop in root_schema.properties[prop].properties) {
//              if (root_schema.properties[prop].properties.hasOwnProperty(nested_prop)) {
//                param.children = compatibilizeSchemaForTreeGrid(root_schema.properties[prop].properties[nested_prop]);
//              }
//            }
          }
          else {
            for (var attribute in root_schema.properties[prop]) {
              if (root_schema.properties[prop].hasOwnProperty(attribute)) {
                param[attribute] = root_schema.properties[prop][attribute]
              }
            }
          }
        }

        params_collection.push(param);
      }
    }
    else if (root_schema.type == 'array') {
      console.log('TODO: IS ARRAY TYPE')
    }

    return params_collection;
  }
});