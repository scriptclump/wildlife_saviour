/**
 * Created by Pkp on 5/15/2016.
 */

angular.module('helpDesk')
    .controller('searchIncident',['$scope', '$window', 'httpService',  function($scope, $window, httpService) {

                $scope.searchbyId = function(incidentId){
                    $("#loader").show();
                    var url = "/api/incident/incident-detail";
                    $scope.incidentData = {};
                    httpService.callRestApi({incidentID : incidentId}, url, "POST")
                        .then(function(response){
                            if(response.data.incidentID != undefined) {
                                $("#loader").hide();
                                $scope.incidentData = response.data;
                                $scope.incidentResult = true;
                            }else{
                                $("#loader").hide();
                                $("#danger-alert").show();
                            }
                        } ,
                        function(reason){
                            $("#loader").hide();
                            alert("Internal Server Error");

                        });
                }


        }]);
