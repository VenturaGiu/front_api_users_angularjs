//PUXAR LISTA COM TODOS OS USUÁRIOS
var app = angular.module('myApp', ['ngResource', 'ngRoute']);

app.config(['$routeProvider',
function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'listar.html',
    controller: 'Usuario',
  })
  .when('/cadastrar', {
    templateUrl: 'cadastrar.html',
    controller: 'Usuario',
  })
  .when('/editar/:id', {
    templateUrl: 'editar.html',
    controller: 'Usuario',
  })
  .otherwise({
    redirectTo: '/'
  });
}
])

app.factory('User', ['$resource', function($resource) {
  return $resource('http://localhost:3001/users/:id?', {id: '@id'}, {
    get: {method: 'GET'},
    post: {method: 'POST'},
    put: {method: 'PUT'},
    delete: {method: 'DELETE'},
  });
}]);

app.factory('Teste', ['$resource', function($resource) {
  return $resource('http://localhost:3001/users/listAll/:id?', {id: '@id'}, {
    getA: {method: 'GET', isArray: true},
  });
}]);

app.controller('Usuario', function ($scope, User, Teste, $routeParams) {
  Teste.getA().$promise.then(function(data){
    $scope.usuario = data;
  })
  
  $scope.delete = function(id){
    User.delete({id:id}).$promise.then(function(data){
      alert('usuario removido')
      location.reload(); 
    }).catch(function(data){
      alert('usuario não removido')
    })
  }
  
  if ($routeParams.id){
    User.get({id: $routeParams.id}).$promise.then(function(data){
      $scope.usuario = data;
    })
  }
  
  $scope.saveData = function(){
    let obj = {
      name: $scope.name, 
      email: $scope.email,
      password: $scope.password
    }
    User.post(obj).$promise.then(function(usuariosalvo){
      console.log(usuariosalvo);
    })
  }
  
  $scope.postdata = function(){
    User.put({id:$scope.usuario._id}, $scope.usuario).$promise.then(function(usuariosalvo){
      console.log(usuariosalvo);
    })
  }
});