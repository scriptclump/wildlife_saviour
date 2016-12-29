angular.module('helpDesk', ['ngResource', 'ui.router', 'datatables', 'ui.bootstrap', 'yaru22.angular-timeago', 'ngFileUpload', 'checklist-model'])
        .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise('login');
            $stateProvider
                    .state('login', {
                        url: "/login",
                        templateUrl: '/partials/user/login',
                        resolve: {
                            'acl': ['$q', 'AuthService', function ($q, AuthService) {
                                    //console.log(AuthService.isAuthenticated());
                                    if (!AuthService.isAuthenticated()) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('userLogedIn');
                                    }
                                }]
                        }

                    })
                    .state('forgot-password', {
                        url: "/forgot-password",
                        templateUrl: '/partials/user/forgot-password',
                    })
                    .state('dashboard', {
                        url: "/dashboard",
                        abstract: true,
                        templateUrl: '/partials/main/dashboard-frame',
                        resolve : {
                        	'acl' : ['$q','AclService','AuthService', function ($q,AclService,AuthService) {
                        		if(!AuthService.isAuthenticated()){
                            		return $q.reject('NotLoggedIn');
                            	}
                        	}]
                        }
                    })
                    .state('dashboard.main', {
                        url: "/main",
                        templateUrl: '/partials/main/dashboard',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    //console.log(AclService.can('97696981'));
                                    if (AclService.can('14764455')) {
                                        // Has proper permissions
                                        console.log('can view dashboard');
                                        return true;
                                    } else {
                                        //console.log('cannot view dashboard')
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.welcome', {
                        url: "/main/welcome",
                        templateUrl: '/partials/main/welcome',
                    })
                    .state('dashboard.member-profile', {
                        url: "/team/member-profile/:memberID",
                        templateUrl: '/partials/team/member-profile',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    //console.log(AclService.can('97696981'));
                                    if (AclService.can('80028564')) {
                                        // Has proper permissions
                                        console.log('van view dashboard');
                                        return true;
                                    } else {
                                        //console.log('cannot view dashboard')
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.my-profile', {
                        url: "/team/my-profile/:memberID",
                        templateUrl: "/partials/team/my-profile",
                    })
                    .state('dashboard.team', {
                        url: "/team/members",
                        templateUrl: '/partials/team/members',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('94498023')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    ///dashboard/team/member/
                    .state('dashboard.member-detail', {
                        url: "/team/member/:memberID",
                        templateUrl: '/partials/team/member-detail',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    //console.log(AclService);
                                    if (AclService.can('71521952')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.addmember', {
                        url: "/team/addmember",
                        templateUrl: '/partials/team/new-member',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('97696981')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.import-members', {
                        url: "/team/import-members",
                        templateUrl: '/partials/team/import-members',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('22797888')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.createnewticket', {
                        url: "/newticket",
                        templateUrl: '/partials/tickets/new-ticket',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('78894315')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }

                    })
                    .state('dashboard.mytickets', {
                        url: "/mytickets",
                        templateUrl: '/partials/tickets/mytickets',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('78894315')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.tickets', {
                        url: "/tickets/:searchField",
                        templateUrl: '/partials/tickets/tickets',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('54235796') || AclService.can('14764455')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                 .state('dashboard.alltickets', {
                        url: "/alltickets",
                        templateUrl: '/partials/tickets/alltickets',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('54235796') || AclService.can('14764455')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.ticket-details', {
                        url: "/tickets/ticket-detail/:ticketID",
                        templateUrl: '/partials/tickets/ticket-detail',
                        resolve: {
                            'acl': ['$q', 'AclService','AuthService', function ($q, AclService,AuthService) {
                                    if (AclService.can('14764455') || AclService.can('64159294') || AclService.can('37810236') || AclService.can('78894315')) {
                                        // Has proper permissions
                                    	console.log('AclService')
                                        return true;
                                    } 
                                    else {
                                    	if(!AuthService.isAuthenticated()){
                                    	
                                    		return $q.reject('NotLoggedIn');
                                    	}else{
                                             return $q.reject('Unauthorized');
                                            
                                          }
                                    	}
                                       
                                    
                                }]
                        }
                    })
                    .state('dashboard.searchByDate', {
                        url: "/search-date",
                        templateUrl: '/partials/search/search-date',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('99978328')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }

                    })
                    .state("otherwise", {
                        url: '/otherwise',
                        templateUrl: '/utilities/error',
                    })
                    .state('dashboard.approvals', {
                        url: "/my-approvals",
                        templateUrl: '/partials/tickets/ticketApproval',
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('37810236')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.change-password', {
                        url: "/change-password",
                        templateUrl: "/partials/user/change-password",
                    })
                    .state('dashboard.createrole', {
                        url: "/create-role",
                        templateUrl: "/partials/roles/create-role",
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('16194391')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.viewroles', {
                        url: "/view-roles",
                        templateUrl: "/partials/roles/view-roles",
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('97696980')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.assignroles', {
                        url: "/assign-roles",
                        templateUrl: "/partials/roles/assign-roles",
                        resolve: {
                            'acl': ['$q', 'AclService', function ($q, AclService) {
                                    if (AclService.can('76996988')) {
                                        // Has proper permissions
                                        return true;
                                    } else {
                                        // Does not have permission
                                        return $q.reject('Unauthorized');
                                    }
                                }]
                        }
                    })
                    .state('dashboard.Unauthorized', {
                        url: "/Unauthorized",
                        templateUrl: '/partials/main/unauthorized',
                    })

        })
        .run(function ($rootScope, $location, $window, AuthService, $state, $rootScope, AclService) {
            // $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {
            //     console.log(toState.name);    
            // })
            $rootScope.$on('$stateChangeError', function (evt, toState, toParams, fromState, fromParams, error) {
                if (error === 'Unauthorized') {
                    //console.log('state go to unauthorized triggered');
                    $state.go('dashboard.Unauthorized');
                }
                //console.log("from state",evt, "toState",toState,"toParams", toParams, fromState, fromParams, error);
                if (error === 'NotLoggedIn') {                
                	AuthService.fromState = toState.name;
                	AuthService.toParams = toParams;
                    $state.go('login');
                }
                
               
                //console.log(rejection);
                if (error === 'userLogedIn') {
                    //console.log('user already logged in',fromState);
                    //$state.go('dashboard.main');
                    if (AclService.can('14764455')) {
                        $state.go('dashboard.main');                        
                    } else {
                        $state.go('dashboard.welcome');
                    }
                }
            })

        })

        .run(function ($rootScope) {
            if (!Notification) {
                alert('Desktop notifications not available in your browser. Try Chromium.');
                return;
            }
            //console.log(Notification.permission, "permission");
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        })
        .controller('indexCtrl', ['$scope', '$state', 'AuthService', '$rootScope', '$location', 'AclService', function ($scope, $state, AuthService, $rootScope, $location, AclService) {
                //console.log($state.current.name);
                //console.log('triggered');
                $scope.isActive = function (viewLocation) {
                    return viewLocation === $state.current.name;
                    //return false;
                }

                $scope.can = AclService.can;
                //console.log(AclService.can('97696981'));

                $scope.logoutSubmit = function (condition) {
                    //console.log('logout submitted');
                    AuthService.logout();
                    //show message while updating password
                    if (condition === 'show_relogin_message') {
                        $rootScope.showreloginMsg = true;
                    }
                    $state.go('login');
                }


                $scope.NotificationSocket = function (ticket) {
                    var protocol = $location.protocol();
                    var host = $location.host();
                    var port = $location.port();
                    if (!Notification) {
                        alert('Desktop notifications not available in your browser. Try Chromium.');
                        return;
                    }
                    //console.log(Notification.permission, "permission");
                    if (Notification.permission !== "granted")
                        Notification.requestPermission();
                    else {
                        console.log('$scope.NotifictaionCustom is called');
                        console.log('Notifictaion is called');
                        var notification = new Notification(ticket.title, {
                            icon: 'https://s3-us-west-2.amazonaws.com/it-helpdesk-cgi/clogo.PNG',
                            body: 'New ticket raised by' + ' ' + ticket.empName,
                        });
                        var urlString = protocol + "://" + host + ":" + port + "/dashboard/tickets/ticket-detail/" + ticket.ticketID;
                        notification.onclick = function () {
                            window.open(urlString);
                        };
                    }
                }

                var socket = io.connect();
                socket.on('connect', function () {
                    console.log('connected for ticket notification');
                })
                socket.on('ticket', function (ticket) {
                    //console.log(ticket, 'realtime message');
                    $scope.NotificationSocket(ticket);
                    //$scope.ticketsList.push(ticket);
                    $rootScope.$broadcast('NewTicket', ticket);
                });

                // $('.side-menu').hover(
                //        function(){ $(".container-fluid").addClass('container-fluid-hover') },
                //        function(){ $(".container-fluid").removeClass('container-fluid-hover') }
                // )

                
            }])
        .constant('AUTH_EVENTS', {
            notAuthenticated: 'auth-not-authenticated'
        })
        .constant('API_ENDPOINT', {
            //url: 'http://52.91.202.36:5000/api'
        url: 'http://localhost:5000/api'
        });


//         .run(function ($rootScope, $location, $window, AuthService, $state, $rootScope) {
//             $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {
//                 //console.log(toState.name);
// //                console.log(toState.role.indexOf($rootScope.userObj.accessRole));
// //                console.log(toState.role);
// //                console.log($rootScope.userObj.accessRole);
//                 if (toState.authRequired === true && AuthService.isAuthenticated() && toState.role.indexOf($rootScope.userObj.accessRole) !== -1) {
// //                    if (toState.name === 'login' || toState.name === 'forget-password') {
// //                        e.preventDefault();
// //                        $state.go('dashboard.main');
// //                        //console.log('user Authenticated');
// //                    }
//                 } else if (toState.name === 'login' || toState.name === 'forget-password') {
//                     if (AuthService.isAuthenticated()) {
//                         //console.log('login or forget page now redirect to dashboard');
//                         e.preventDefault();
//                         $state.go('dashboard.main');
//                     }
//                 } else if (toState.name !== 'login') {
//                     // If logged in and transitioning to a logged out page:
//                     //console.log('user not authenticated');
//                     e.preventDefault();
//                     $state.go('login');
//                 }
//             });
//         })

//        .config(['AclServiceProvider', function (AclServiceProvider) {
//                var myConfig = {
//                    storage: 'localStorage',
//                    storageKey: 'AppAcl'
//                };
//                AclServiceProvider.config(myConfig);
//            }])
//        .run(['AclService', function (AclService) {
//                // Set the ACL data. Normally, you'd fetch this from an API or something.
//                // The data should have the roles as the property names,
//                // with arrays listing their permissions as their value.
//                var aclData = {
//                    user: ['login']
//                };
//                AclService.setAbilities(aclData);
//                // Attach the member role to the current user
//                AclService.attachRole('user');
//                console.log('set acl service error');
//            }])