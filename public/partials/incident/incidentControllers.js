/**
 * Created by Pkp on 5/10/2016.
 */
angular.module('helpDesk')
        .controller('incidentCtrl', ['$scope', '$window', 'httpService', '$routeParams', '$filter',
            '$location', function ($scope, $window, httpService, $routeParams, $filter, $location) {

                $scope.createIncident = function (incidentDetails) {
                    //if (incidentDetails.incidentType && incidentDetails.application && incidentDetails.priority) {
                    $scope.submitButtonClass = true;
                    $scope.resetButtonClass = true;
                    var url = "/api/members/add"
                    $("#loader").show();
                    httpService.callRestApi(incidentDetails, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                $scope.incidentID = response.data.incidentID;
                                $("#success-alert").show();
                                $scope.createNewButtonClass = true;
                            },
                                    function (reason) {
                                        $("#loader").hide();
                                        $scope.errorMsg = reason;
                                        $("#danger-alert").show();

                                        $scope.createNewButtonClass = true;
                                        console.log(reason);
                                    });
//                    } else {
//                        alert("Please fill out all fields");
//                    }
                }

                $scope.resetForm = function () {
                    $window.location.reload();
                }

                $scope.newIncident = function () {
                    $window.location.reload();
                }


                $scope.getIncidentDetail = function () {
                    $scope.isVisible = false;
                    $scope.incId = $routeParams.incidentID;
                    $("#loader").show();
                    findIncidentById($scope.incId);

                }

                $scope.updateIncident = function (data) {
                    $("#loader").show();
                    $scope.newData = {};
                    $scope.newData.incidentID = data.incidentID;
                    $scope.newData.application = data.application;
                    $scope.newData.incidentType = data.incidentType;
                    $scope.newData.priority = data.priority;
                    $scope.newData.releaseDate = data.releaseDate;
                    $scope.newData.resolutionType = data.resolutionType;
                    $scope.newData.site = data.site;
                    $scope.newData.status = data.status;
                    $scope.newData.title = data.title;
                    $scope.newData.version = data.version;
                    $scope.newData.description = addUpdate(data.update, data.description);

                    var url = "/api/incident/update";

                    httpService.callRestApi($scope.newData, url, "POST")
                            .then(function (response) {
                                findIncidentById(response.data.incidentID);
                                $("#success-alert").show();



                            },
                                    function (reason) {
                                        $("#loader").hide();
                                        $scope.errorMsg = reason;
                                        $("#danger-alert").show();

                                    });



                }

                var addUpdate = function (update, desc) {
                    var date = new Date();
                    var updateDT = (date.getMonth() + 1).toString() + "/" + date.getDate().toString() + "/" + date.getFullYear().toString() + "  " + date.getHours().toString() + ":" + date.getMinutes().toString();
                    var updateString = "------ Status : " + $scope.newData.status + " | Last Updated by user at " + updateDT + " ------" + "\n";
                    desc = desc + "\n" + updateString + update;

                    return desc;
                }

                var findIncidentById = function (incId) {

                    var url = "/api/incident/incident-detail";
                    $scope.data = {};
                    httpService.callRestApi({incidentID: incId}, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                if (response.data.incidentID != undefined) {
                                    $scope.isVisible = true;
                                    if ((response.data.status == 'Closed') || (response.data.status == 'Rejected')) {
                                        $scope.isClosed = true;
                                    }

                                    $scope.data = response.data;
                                    $scope.data.reportedDate = $filter("date")(response.data.reportedDate, 'MM/dd/yyyy HH:mm:ss');
                                    $scope.data.releaseDate = $filter("date")(response.data.releaseDate, 'yyyy-MM-dd');


                                } else {
                                    $("#loader").hide();
                                    $location.path('/damn-it/');
                                }


                            },
                                    function (reason) {
                                        $("#loader").hide();
                                        $location.path('/oops/');
                                    });
                }


            }]);
