let app = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies']);

app.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'listar.html',
        controller: 'Usuario as vm',
      })
      .when('/cadastrar', {
        templateUrl: 'cadastrar.html',
        controller: 'Usuario as vm',
      })
      .when('/editar/:id', {
        templateUrl: 'editar.html',
        controller: 'Usuario as vm',
      })
      .when('/', {
        templateUrl: './login.html',
        controller: 'Usuario as vm',
      })
      .otherwise({
        redirectTo: '/'
      });
  }
])

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('myHttpInterceptor');
  $httpProvider.interceptors.push('TokenInterceptor');
}]);

app.factory('TokenInterceptor', ['$q',
  '$cookies',
  function ($q, $cookies) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookies.get('bolinho')) {
          config.headers.Authorization = $cookies.get('bolinho').trim();
        }
        return config;
      },
      requestError: function (rejection) {
        window.location.href = '#!/';
        return $q.reject(rejection);
      },
      /*
      * Set Authentication.isAuthenticated to true if 200
      * received
      */
      response: function (response) {
        return response || $q.when(response);
      },
      /*
      * Revoke client authentication if 401 is received
      */
      responseError: function (rejection) {
        if (rejection != null && rejection.status === 401) {
          window.location.href = '#!/';
          $cookies.remove('bolinho');
        }

        return $q.reject(rejection);
      }
    };
  }
]);

app.factory('myHttpInterceptor', ['$q', '$rootScope', '$timeout',
  function ($q, $rootScope, $timeout) {
    return {
      request: function (config) {
        console.info('requisição iniciada ' + new Date())
        return config;
      },
      response: function (response) {
        console.info('requisição finalizada ' + new Date())
        var msg = response && response.data && response.data.customMsg ? response.data.customMsg :
          response && response.data && response.data.msg ? response.data.msg : undefined;
        if (msg) {
          console.log(msg + ' msg vinda da api')
        }

        return response;
      },
      responseError: function (response) {
        console.info('requisição com falha finalizada ' + new Date())
        if (response && response.status == 401) {
          window.location.href = '#!/';
          return $q.reject(response);
        }

        var msg = response && response.data && response.data.customMsg ? response.data.customMsg :
          response && response.data && response.data.msg ? response.data.msg : undefined;

        var customMsg = response && response.data && response.data.customMsg;

        if (response && response.status == 403 || response.status == 401) {
          msg = customMsg || 'Você não está autorizado a executar esta solicitação';
          console.error(msg)
          window.location.href = '#!/';
          return $q.reject(response);
        }
        if (response && response.status == 404) {
          msg = 'Pagina nao encontrada ou Recurso Inacessivel. Confira sua url ou tente novamente mais tarde.'
        } else if (response && response.status == 400 &&
          (response.data && (response.data[0] && response.data[0].message || response.data.msg))) {
          // msg = customMsg || response && response.data && response.data[0] && response.data[0].message ? response.data[0].message : response && response.data && response.data.msg ? response.data.msg : 'Dados invalidos';
          window.location.href = '#!/';
        } else {
          msg = customMsg ? customMsg : msg ? msg : 'Nao foi possivel executar a solicitacao. Contacte o Administrator e tente novamente mais tarde'
          console.error(msg)
          window.location.href = '#!/';
          return $q.reject(response);
        }
        window.location.href = '#!/';
        console.error(msg);
        return $q.reject(response);
      }
    };
  }
]);

app.factory('User', ['$resource', '$cookies', function ($resource) {
  return $resource('http://localhost:3001/users/:id?', { id: '@id' }, {
    get: { method: 'GET' },
    post: { method: 'POST' },
    put: { method: 'PUT' },
    delete: { method: 'DELETE' },
  });
}]);

app.factory('LoginPost', ['$resource', '$cookies', function ($resource) {
  return $resource('http://localhost:3001/users/login', { id: '@id' }, {
    post: { method: 'POST' },
  });
}]);

app.factory('emailGet', ['$resource', '$cookies', function ($resource) {
  return $resource('http://localhost:3001/users/email/:email', { email: '@email' }, {
    get: { method: 'GET' },
  });
}]);

app.factory('Teste', ['$resource', '$cookies', function ($resource) {
  return $resource('http://localhost:3001/users/listAll', {}, {
    getA: { method: 'GET', isArray: true },
  });
}]);

app.service('serviceAdmin', function ($cookies) {
  this.isAdmin = function () {
    return $cookies.get('admin') == "true";
  }
})

app.controller('Usuario', function ($scope, User, Teste, LoginPost, emailGet, $routeParams, $cookies, serviceAdmin, $location) {
  var vm = this;

  $scope.statusAdmin = serviceAdmin.isAdmin();
  console.log($cookies.get('bolinho'), $location.url())
  if ($cookies.get('bolinho')) {
    Teste.getA().$promise.then(function (data) {
      $scope.usuario = data;
    })
  }

  $scope.delete = function (id) {
    User.delete({ id: id }).$promise.then(function (data) {
      alert('usuario removido')
      location.reload();
    }).catch(function (data) {
      alert('usuario não removido')
    })
  }

  if ($routeParams.id) {
    User.get({ id: $routeParams.id }).$promise.then(function (data) {
      $scope.usuario = data;
    })
  }

  $scope.saveData = function () {
    let obj = {
      name: $scope.name,
      email: $scope.email,
      password: $scope.password,
      admin: $scope.admin
    }
    User.post(obj).$promise.then(function (usuariosalvo) {
      console.log(usuariosalvo);
    })
  }

  $scope.postdata = function () {
    User.put({ id: $scope.usuario._id }, $scope.usuario).$promise.then(function (usuariosalvo) {
      console.log(usuariosalvo);
    })
  }

  $scope.login = function () {
    let obj = {
      email: $scope.email,
      password: $scope.password
    }
    LoginPost.post(obj).$promise.then(function (data) {
      if (data.message) {
        alert('Login ou senha errado! Tente novamente')
      } else {
        emailGet.get({ email: $scope.email }).$promise.then(function (data2) {
          console.log(data2)
          $cookies.put('admin', data2.admin)
          $cookies.put('bolinho', data.token)
          window.location.href = '#!/login';
        })
      }
    })
  }

  $scope.removeCookie = function () {
    $cookies.remove('bolinho');
    $cookies.remove('admin');
    window.location.href = '#!/';
  }
});