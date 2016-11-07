var app = angular.module('mainApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
  $rootScope.authenticated = false;
  $rootScope.current_user = '';

  $rootScope.signout = function(){
    $http.get('auth/signout');
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
  };
});

app.config(function($routeProvider){
  $routeProvider
    //the timeline display
    .when('/', {
      templateUrl: 'login.html',
      controller: 'mainController'
    })
    //the login display
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'authController'
    })
    //the signup display
    .when('/register', {
      templateUrl: 'register.html',
      controller: 'authController'
    })
    //the signup display
    .when('/pref', {
      templateUrl: 'pref.html',
      controller: 'mainController'
    });
});

app.controller('mainController', function($scope){
  $scope.roomList = ["A212","A213","A214","A215","A216"];
  
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/pref');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/pref');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});