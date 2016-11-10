var app = angular.module('mainApp', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages']).run(function($rootScope, $http, $location) {
  $rootScope.authenticated = false;
  $rootScope.current_user = '';
  $rootScope.currentNavItem = 'login';
  $location.path('/login');

  $rootScope.signout = function(){
    $http.get('/auth/signout');
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    $rootScope.currentNavItem = 'login';
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
    .when('/request', {
      templateUrl: 'request.html',
      controller: 'requestController'
    });
});


app.controller('requestController', function($rootScope, $http, $scope){
  $rootScope.currentNavItem = 'request';

  $http.get('/api/finalList/'+$rootScope.current_user).success(function(data){
    $scope.friendList = data;
  });
  $http.get('/api/requestList/'+$rootScope.current_user).success(function(data){
    $scope.fromRequestList = data.fromList;
    $scope.room = data.room;
    _.forEach(data.toList, function(value){
      _.remove($scope.friendList, function(n){ return n.name==value.name})
    });
    _.forEach(data.fromList, function(value){
      _.remove($scope.friendList, function(n){ return n.name==value.name})
    });
  });
  
  $scope.request = function (item) {
    $http.get('/api/request/'+$rootScope.current_user+'/'+item.name+'/'+$scope.room)
    .success(function(data){
      console.log(data);
    })
  };

  $scope.accept = function (item) {
    $http.get('/api/accept/'+$rootScope.current_user+'/'+item.name+'/'+$scope.room)
    .success(function(data){
      console.log(data);
    })
  };
});
app.controller('adminController', function ($scope, $http, $rootScope, $location) {

  if (!$rootScope.authenticated) {
    $location.path('/login');
  }
  $rootScope.currentNavItem = 'logout';
  $scope.stable = function () {
    console.log('stable');
    $http.get('/api/stable').success(function (data) {
      console.log(data);
      $scope.tiles = buildGridModel({
        icon: "../avatar/avatar",
        title: ""
      });

      function buildGridModel(tileTmpl) {
        var it, results = [];
        var j = 1;
        _.forEach(data, function (value, key) {

          it = angular.extend({}, tileTmpl);
          it.icon = it.icon + j + ".png";
          it.title = key;
          it.span = { row: 1, col: 1 };
          results.push(it);
          j++;
        });
        j = 1;
        _.forEach(data, function (value, key) {

          it = angular.extend({}, tileTmpl);
          it.icon = it.icon + j + ".png";
          it.title = value;
          it.span = { row: 1, col: 1 };
          results.push(it);
          j++;
        });
        return results;
      }
    });
  }
  $scope.hung = function () {
    console.log('hung');
    $http.get('/api/hung').success(function (data) {
      console.log(data);
      _.forEach($scope.tiles, function(value){
        var name = value.title;
        value.title = name + " (" + data[name] + ")"; 
      });
    });
  }

});

app.controller('mainController', function($scope, $http, $rootScope, $location){
  if(!$rootScope.authenticated){
    $location.path('/login');
  }
  $rootScope.currentNavItem = 'pref';
  
  $http.get('/api/users/'+$rootScope.current_user).success(function(data){
    $scope.friendList = data;
  });
  $http.get('/api/rooms').success(function(data){
    $scope.roomList = data;
  });
  $scope.friendPriority = [];
  $scope.roomPriority = [];
  $scope.friendValue = 100;
  $scope.roomValue = 100;
  
  
  $http.post('/api/preference', { "username":$rootScope.current_user}).success(function(data){
      $scope.friendPriority = data.friendPriority;
      _.forEach($scope.friendPriority, function(value){
        _.remove($scope.friendList,function(n){ return n == value.friend });
      })
      $scope.roomPriority = data.roomPriority;
      _.forEach($scope.roomPriority, function(value){
        _.remove($scope.roomList,function(n){ return n == value.room });
      })
      $scope.noise = data.noise;
      if(data.light) { $scope.light = true; }
      else { $scope.light = false; }
  });

  $scope.addFriendPref = function(){
    $scope.friendPriority.push({ "value":$scope.friendValue, "friend":$scope.friend});
    _.remove($scope.friendList,function(n){ return n == $scope.friend });
  }
  
  $scope.deleteFriend = function(item){
    $scope.friendList.push(item.friend);
    _.remove($scope.friendPriority,function(n){ return n.friend == item.friend });
  }

  $scope.addRoomPref = function(){
    $scope.roomPriority.push({ "value":$scope.roomValue, "room":$scope.room});
    _.remove($scope.roomList,function(n){ return n == $scope.room });
  }

  $scope.deleteRoom = function(item){
    $scope.roomList.push(item.room);
    _.remove($scope.roomPriority,function(n){ return n.room == item.room });
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
      "roomPriority":$scope.roomPriority,
      "noise": $scope.noise,
      "light":$scope.light
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
        if ($rootScope.current_user == "admin"){ $location.path('/admin'); }
        else { $location.path('/'); }
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
