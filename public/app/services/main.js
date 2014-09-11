app.factory('APIService', function ($http, $localStorage, UtilsService, APISchemaService) {
  var api = {
    url   : ($localStorage.api && $localStorage.api.url)
      ? $localStorage.api.url
      : '',
    schema: ($localStorage.api && $localStorage.api.schema)
      ? $localStorage.api.schema
      : {}
  };

  function getURL() {
    return api.url;
  }

  function setURL(url) {
    api.url = url;

    if ($localStorage.api) {
      $localStorage.api.url = url;
    }
    else {
      $localStorage.api = {
        url: url
      }
    }
  }

  function getSchemaFromServer() {
    var http_promise = $http({
      method: 'GET',
      url   : api.url
    });

    http_promise.success(function (data) {
      api.schema = $localStorage.api.schema = APISchemaService.resolveSchema(data);
    });

    return http_promise;
  }

  function getCachedSchema() {
    return api.schema;
  }

  return {
    getURL             : getURL,
    setURL             : setURL,
    getSchemaFromServer: getSchemaFromServer,
    getCachedSchema    : getCachedSchema
  };
});

app.factory('UtilsService', function () {
  /**
   * Iterate recursively over an object.
   *
   * @param {Object}      object
   * @param {Array}       stack
   * @param {Function}    cb
   */
  function iterate(object, stack, cb) {
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        if (typeof object[property] == 'object') {
          /*
           * An inner object was found. Iterate recursively over it.
           */
          var new_stack = stack.concat(property);

          if (typeof cb == 'function') {
            cb(object[property], new_stack);
          }

          iterate(object[property], new_stack, cb);
        }
        else {
          // Not an inner object, so noop.
        }
      }
    }
  }

  /**
   * Find an inner property using a path within an object and return it.
   *
   * @param   {Object}    object
   * @param   {String}    path        A path to the object: 'a.path.to.the.object'
   * @param   {String}    sep         The separator between nested properties. Default '.'
   * @returns {Object|null}
   */
  function findProp(object, path, sep) {
    var sep = sep || '.';
    var args = path.split(sep);
    var i;
    var l;

    for (i = 0, l = args.length; i < l; i++) {
      if (!object.hasOwnProperty(args[i]))
        return;
      object = object[args[i]];
    }
    return object;
  }

  /**
   * Set a value from a string path.
   * Usage: `set('a.b.c', 2, root_object)`
   *
   * @param path
   * @param value
   * @param root
   * @param sep
   * @returns {*}
   */
  function setProp(path, value, root, sep) {
    var sep = sep || '.';
    var segments = path.split(sep);
    var cursor = root || window;
    var segment;
    var i;

    for (i = 0; i < segments.length - 1; ++i) {
      segment = segments[i];
      cursor = cursor[segment] = cursor[segment] || {};
    }
    return cursor[segments[i]] = value;
  }

  return {
    iterate : iterate,
    findProp: findProp,
    setProp : setProp
  };
});

app.factory('APISchemaService', function (UtilsService) {
  function resolveSchema(schema) {
    var resolved_schema = JSON.parse(JSON.stringify(schema));

    UtilsService.iterate(schema, [], function (object, stack) {
      /*
       * Process $ref.
       * Algorithm: replace parent with referenced object.
       */
      if (object.hasOwnProperty('$ref')) {
        // Resolve $ref path.
        var ref = object.$ref
          .replace('#/', '')
          .replace(/\//g, '/');

        var new_object = UtilsService.findProp(resolved_schema, ref, '/');
        UtilsService.setProp(stack.join('/'), new_object, resolved_schema, '/');
      }
      /*
       * TODO: Process allOf.
       * Algorithm:
       * 1- Merge objects in the array with increasing level of priority as array progresses.
       * 2- Merge parent object with the result of step 1.
       */
      else if (object.hasOwnProperty('allOf')) {
      }
    });

    return resolved_schema;
  }

  return {
    resolveSchema: resolveSchema
  };
});