var app = angular.module('mainApp', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages']).run(function($rootScope, $http, $location) {
  $rootScope.authenticated = false;
  $rootScope.current_user = '';
  $rootScope.currentNavItem = 'login';
  $location.path('/login');

  $rootScope.signout = function(){
    $http.get('/auth/signout');
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

    //the signup display
    .when('/admin', {
      templateUrl: 'admin.html',
      controller: 'adminController'
    })
});

app.controller('adminController',function ($scope, $http) {

  $scope.stable = function () {
    console.log('stable');
  }
  $scope.hung = function () {
    console.log('hung');
  }
  
});

app.controller('mainController', function($scope, $http, $rootScope, $location){
  if(!$rootScope.authenticated){
    $location.path('/login');
  }
  
  $http.get('/api/users/'+$rootScope.current_user).success(function(data){
    $scope.friendList = data;
  });
  $http.get('/api/rooms').success(function(data){
    $scope.roomList = data;
  });
  $scope.friendPriority = [];
  $scope.roomPriority = [];
  $scope.value = 1;
  
  
  $http.post('/api/preference', { "username":$rootScope.current_user}).success(function(data){
      $scope.err = data;
  });

  $scope.addFriendPref = function(){
    $scope.friendPriority.push({ "value":$scope.friendValue, "friend":$scope.friend});
    _.remove($scope.friendList,function(n){ return n == $scope.friend });
  }

  $scope.addRoomPref = function(){
    $scope.roomPriority.push({ "value":$scope.roomValue, "room":$scope.room});
    _.remove($scope.roomList,function(n){ return n == $scope.room });
  }

  $scope.submit = function(){
    _.forEach($scope.friendList,function (value) {
      $scope.friendPriority.push({ "value":100, "friend":value});
    });
     _.forEach($scope.roomList,function (value) {
      $scope.roomPriority.push({ "value":100, "room":value});
    });
    $http.put('/api/preference', { 
      "username":$rootScope.current_user,
      "friendPriority":$scope.friendPriority,
      "roomPriority":$scope.roomPriority
    }).success(function(data){
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