// angular.module('helpDesk').factory('socketio', ['$rootScope', function ($rootScope) {
//        'use strict';
//        
//        var socket = io.connect('');
//        return {
//            on: function (eventName, callback) {
//                socket.on(eventName, function () {
//                    var args = arguments;
//                    $rootScope.$apply(function () {
//                        callback.apply(socket, args);
//                        console.log(args,'from factory');
//                    });
//                });
//            },
//            emit: function (eventName, data, callback) {
//                socket.emit(eventName, data, function () {
//                    var args = arguments;
//                    $rootScope.$apply(function () {
//                        if (callback) {
//                            callback.apply(socket, args);
//                        }
//                    });
//                });
//            }
//        };
//    }])