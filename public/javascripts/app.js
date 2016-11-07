var app = angular.module('mainApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http, $location) {
  $rootScope.authenticated = false;
  $rootScope.current_user = '';
  $location.path('/login');

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
      templateUrl: 'pref.html',
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
});

app.controller('mainController', function($scope, $http, $rootScope, $location){
  if(!$rootScope.authenticated){
    $location.path('/login');
  }
  $scope.roomList = ["A212","A213","A214","A215","A216","A217","A218","A219","A220","A221"];
  $scope.friendList = ["Tom","Dick","Harry","Jedi","Luke","Darth","Voldemort","Dumbledore","Strange","Pikachu"];
  $scope.priority = [];
  $scope.value = 1;
  
  
  $http.post('/api/preference', { "username":$rootScope.current_user}).success(function(data){
      $scope.err = data;
  });

  $scope.addPref = function(){
    $scope.priority.push({ "value":$scope.value, "room":$scope.room});
    _.remove($scope.roomList,function(n){ return n == $scope.room });
  }


  $scope.submit = function(){
    $http.put('/api/preference', { "username":$rootScope.current_user,"priority":$scope.priority}).success(function(data){
      $scope.err = data;
    })
  }
  
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
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
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});