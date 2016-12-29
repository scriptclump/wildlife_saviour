/**
 * Dashboard Controller
 */
angular.module('helpDesk')
        .controller('dashboardCtrl', ['$scope', '$window', 'httpService', '$filter', '$location',  'DTOptionsBuilder', 'ticketsManager',
            function ($scope, $window, httpService, $filter, $location, DTOptionsBuilder, ticketsManager) {
            	$scope.newTickets = DTOptionsBuilder.newOptions().withOption('order', [[0, 'desc']]);
                $scope.pendingTickets = DTOptionsBuilder.newOptions().withOption('order', [[3, 'desc']]);
                $scope.WorkinProgressTicket = DTOptionsBuilder.newOptions().withOption('order', [[3, 'desc']]);
                $scope.MyAssignedTickets = DTOptionsBuilder.newOptions().withOption('order', [[0, 'desc']]);
                $scope.TATExceededTickets = DTOptionsBuilder.newOptions().withOption('order', [[0, 'desc']]);
                $scope.initProcess = function () {
                    $scope.loadTickets();
                }
                $scope.loadTickets = function () {
                    var url                          = "/api/ticketsRelated/ticket";
                    var countUrl                     = "/api/ticketsRelated/ticketCount";
                    var params                       = {};
                    $scope.TimeExceededTicketsCounts = 0;
                    $scope.IssueTicketsCount         = 0;
                    $scope.RequestTicketsCount       = 0;
                    $scope.SolvedCount               = 0;
                    $scope.TotalTickets              = 0;
                    $scope.TimeExceededTickets       = [];
                    $scope.PendingTickets            = [];
                    $scope.WorkinProgressTickets     = [];
                    $scope.NewTickets                = [];
                    $scope.MyTickets                 = [];
                    $scope.ticketsList               = [];
                    
                    //get tickets count
                    httpService.callRestApi(null, "/api/ticketsRelated/ticketCount", "GET").then(function (response) {
                        $scope.TotalTickets = response.data;
                    });
                    
                    httpService.callRestApi({tat_tickets : 'true'}, url, "GET").then(function (response) {
                    	$scope.TimeExceededTickets = response.data;
                    	$scope.TimeExceededTicketsCounts = response.data.length;
                    });
                    
                    httpService.callRestApi({issue_type_cat_1: 'issue'}, countUrl, "GET").then(function (response) {
                    	 $scope.IssueTicketsCount = response.data;
                    });
                    
                    httpService.callRestApi({issue_type_cat_1: 'request'}, countUrl, "GET").then(function (response) {
                    	$scope.RequestTicketsCount = response.data;
                    });
                    
                    httpService.callRestApi({status: 'Close'}, countUrl, "GET").then(function (response) {
                    	$scope.SolvedCount = response.data;
                    });
                    
                    httpService.callRestApi(null,url, "GET").then(function (response) {
                    	$scope.ticketsList = response.data;                  
                    });
                    
                    httpService.callRestApi({status: 'New'}, url, "GET").then(function (response) {
                    	$scope.NewTickets = response.data;
                    });
                   
                    httpService.callRestApi({status: 'Work in Progress'}, url, "GET").then(function (response) {
                	   $scope.WorkinProgressTickets = response.data;
                    });

                    httpService.callRestApi({status: 'Pending for Approval'}, url, "GET").then(function (response) {
                       $scope.PendingTickets = response.data;
                    });

                    httpService.callRestApi({assign_to:$scope.userObj._id}, url, "GET").then(function (response) {
                	   $scope.MyTickets = response.data;
                    });
                }	
                  $scope.$on('NewTicket', function (event, ticket) {
                      console.log('realtime message dashboard',ticket);
                      $scope.NewTickets.push(ticket);
                      $scope.TotalTickets=parseInt($scope.TotalTickets) + 1;
                  });
            }])

        .factory('Ticket', ['$http', function ($http) {
                function Ticket(ticketData) {
                    if (ticketData) {
                        this.setData(ticketData);
                    }
                }
                ;
                Ticket.prototype = {
                    setData: function (ticketData) {
                        angular.extend(this, ticketData);
                    }
                };
                return Ticket;
            }])

        .factory('ticketsManager', ['$http', '$q', 'Ticket', function ($http, $q, Ticket) {
                var ticketsManager = {
                    _pool: {},
                    _retrieveInstance: function (ticketId, ticketData) {
                        var instance = this._pool[ticketId];
                        if (instance) {
                            instance.setData(ticketData);
                        } else {
                            instance = new Ticket(ticketData);
                            this._pool[ticketId] = instance;
                        }
                        return instance;
                    },
                    _search: function (ticketId) {
                        return this._pool[ticketId];
                    },
                    _load: function (ticketId, deferred) {
                        console.log('retrive data is called', ticketId);
                        var scope = this;
                        $http.get('/api/ticketsRelated/ticket-detail', {params: {ticketID: ticketId}}).success(function (ticketData) {
                            deferred.resolve(ticketData[0]);
                        }).error(function () {
                            deferred.reject();
                        });
                    },
                    /* Public Methods */
                    /* Use this function in order to get a ticket instance by it's id */
                    getTicket: function (ticketId) {
                        var deferred = $q.defer();
                        var ticket = this._search(ticketId);
                        if (ticket) {
                            deferred.resolve(ticket);
                        } else {
                            this._load(ticketId, deferred);
                        }
                        return deferred.promise;
                    },
                    /* Use this function in order to get instances of all the tickets */
                    loadAllTickets: function () {
                        var deferred = $q.defer();
                        var scope = this;
                        $http.get('/api/ticketsRelated/ticket').success(function (ticketsArray) {
                            var tickets = [];
                         
                            ticketsArray.forEach(function (ticeketData) {
                                var ticket = scope._retrieveInstance(ticeketData.ticketID, ticeketData);
                                tickets.push(ticket);
                            });
                            deferred.resolve(ticketsArray);
                        }).error(function () {
                            deferred.reject();
                        });                        
                        return deferred.promise;
                    },
                    loadMytickets: function () {

                    },
                    /*  This function is useful when we got somehow the ticket data and we wish to store it or update the pool and get a ticket instance in return */
                    setTicket: function (ticketData) {
                        var scope = this;
                        var ticket = this._search(ticketData.id);
                        if (ticket) {
                            ticket.setData(ticketData);
                        } else {
                            ticket = scope._retrieveInstance(ticketData);
                        }
                        return ticket;
                    }
                };
                return ticketsManager;
            }])
                    /*ticketsManager.loadAllTickets().then(function (tickets) {
                        $scope.data = tickets;
                        //console.log($scope.data);
                        $scope.TotalTickets = tickets.length;
                        $scope.loadSolvedTickets(tickets);
                        //$scope.loadTatExceededTickets(tickets);
                        //console.log('total Count',$scope.TotalTickets);
                    }, function (error) {
                        console.log(error);
                    })
                }
                $scope.SolvedCount = 0;
                $scope.TimeExceededTicketsCounts = 0;
                $scope.TimeExceededTickets = [];
                $scope.PendingTickets = [];
                $scope.RequestTicketsCount = 0;
                $scope.IssueTicketsCount = 0;
                $scope.loadSolvedTickets = function (tickets) {
                    if (tickets) {
                        //console.log(tickets);
                        angular.forEach(tickets, function (value, key) {
                            //console.log(value);
//                            console.log(value.status);
                            if (value.status == 'Closed') {
                                $scope.SolvedCount = $scope.SolvedCount + 1;
                            }
                            //console.log(value.issue_type_cat_1);
                            if (value.issue_type_cat_1 == 'issue') {
                                $scope.IssueTicketsCount = $scope.IssueTicketsCount + 1;
                            }
                            if (value.issue_type_cat_1 == 'request') {
                                $scope.RequestTicketsCount = $scope.RequestTicketsCount + 1;
                            }
                            if (value.status !== 'New' && value.status !== 'Open' && value.status !== 'Closed') {
                                //console.log(value.status);
                                $scope.PendingTickets.push(value);
                            }
                            if (value.master_st !== 0 && value.status !== 'Closed'&&value.status !== 'New') {
                                //console.log('value.master_st',value.master_st);
                                //$scope.TatExceeededTicketsCount = $scope.TatExceeededTicketsCount + 1;
                                //console.log();
                                var StartedAt = value.master_st;
                                var Current_Date = Date.now();
                                var tat_time = value.tat_time || 1;
                                //console.log('tat time set/default', tat_time);
                                var startDateFormated = new Date(StartedAt);
                                //console.log('actually started at', startDateFormated);
                                var shouldEndAt=startDateFormated.setHours(startDateFormated.getHours() + tat_time);
                                var shouldEndAtFormated=new Date(shouldEndAt);
//                                console.log('it should End at', shouldEndAtFormated);
//                                console.log('current time ',Date(Current_Date));
                                if (Current_Date>shouldEndAt) {
                                    $scope.TimeExceededTicketsCounts = $scope.TimeExceededTicketsCounts + 1;
                                    $scope.TimeExceededTickets.push(value);
                                    //console.log('warning exceeded! ticket ID',value.ticketID);
                                } else {
                                    console.log('Not Exceeded!');
                                }
//                                var deadLineAt =
//                                        console.log(Math.floor(Date.now()));
                            }
                            //this.push(key + ': ' + value);
                        });
                    }
                }
                */

