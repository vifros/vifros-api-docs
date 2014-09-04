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

  $scope.col_defs = [
    {
      field      : 'type',
      displayName: 'type'
    },
    {
      field      : 'flags',
      displayName: 'flags'
    },
    {
      field      : 'enum',
      displayName: 'enum'
    },
    {
      field      : 'title',
      displayName: 'description'
    }
  ];

  $scope.onSelectTreeItem = function (node) {
    $scope.selected_node = node;

    var tabs = [];
    for (var method in node.methods) {
      if (node.methods.hasOwnProperty(method)) {
        var content = JSON.parse(JSON.stringify(node.methods[method]));

        if (node.methods[method].request) {
          content.request = {
            title   : node.methods[method].request.title,
            treegrid: compatibilizeSchemaForTreeGrid(node.methods[method].request)
          };
        }
        if (node.methods[method].response) {
          content.response = {
            title   : node.methods[method].response.title,
            treegrid: compatibilizeSchemaForTreeGrid(node.methods[method].response)
          };
        }
        if (node.instances) {
          content.instances = {};
          for (var instance in node.instances) {
            if (node.instances.hasOwnProperty(instance)) {
              content.instances[instance] = compatibilizeSchemaForTreeGrid(node.instances[instance]);
            }
          }
        }

        tabs.push({
          title  : method,
          content: content
        });
      }
    }

    $scope.tabs = tabs;
  };

  function compatibilizeSchemaForTreeGrid(root_schema) {
    var params_collection = [];

    if (root_schema.type == 'object') {
      for (var prop in root_schema.properties) {
        var param = {};

        if (root_schema.properties.hasOwnProperty(prop)) {
          param.name = prop;

          if (root_schema.properties[prop].type == 'object'
            || root_schema.properties[prop].type == 'array') {

            param.type = root_schema.properties[prop].type;

            // Further process the object by nesting the function call since it has children properties.
            if (!param.children) {
              param.children = [];
            }

            param.children = compatibilizeSchemaForTreeGrid(root_schema.properties[prop]);
          }
          else {
            var flags = [];

            for (var attribute in root_schema.properties[prop]) {
              if (root_schema.properties[prop].hasOwnProperty(attribute)) {
                if (attribute == 'readonly'
                  || attribute == 'required'
                  || attribute == 'unique') {

                  flags.push(attribute);
                  continue;
                }

                if (attribute == 'enum') {
                  param[attribute] = root_schema.properties[prop][attribute].join('<br />');
                  continue;
                }
                param[attribute] = root_schema.properties[prop][attribute];
              }
            }

            param.flags = flags.join('<br />');
          }
        }

        params_collection.push(param);
      }
    }
    else if (root_schema.type == 'array') {
      if (root_schema.items instanceof Array) {
        // Variant: items is an array.
        for (var i = 0, j = root_schema.items.length;
             i < j;
             i++) {

          var buffer = {
            name: i
          };

          angular.extend(buffer, root_schema.items[i]);
          params_collection.push(buffer);
        }
      }
      else {
        // Variant: items is an object.
        params_collection = compatibilizeSchemaForTreeGrid(root_schema.items);
      }
    }

    return params_collection;
  }
});