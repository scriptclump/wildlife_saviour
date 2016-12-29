/**
 * Created by Pkp on 5/10/2016.
 */
angular.module('helpDesk')
        .controller('teamCtrl', ['$scope', '$window', 'httpService', '$stateParams', '$filter', '$location', 'AclService','Upload',
            function ($scope, $window, httpService, $stateParams, $filter, $location, AclService,Upload) {
                $scope.udata = {};
                $scope.can = AclService.can;
                
                $scope.addMember = function (memberDetails) {
                    console.log("memberDetails :: ",memberDetails);
                    $("#success-alert").hide();
                    $("#danger-alert").hide();
                    if(memberDetails.accessRole === undefined || memberDetails.accessRole === ""){
                        $scope.errorMsg = 'Please Select Role';
                        $("#danger-alert").show();
                   }else if (memberDetails.mNum != undefined && memberDetails.mNum.toString().length > 0 && memberDetails.mNum.toString().length !== 10) {
                        $scope.errorMsg = 'Please Enter valid 10 digit Mobile Number';
                        $("#danger-alert").show();
                	}else if(memberDetails.aNum != undefined && memberDetails.aNum.toString().length > 0 && memberDetails.aNum.toString().length !== 10){
                        $scope.errorMsg = 'Please Enter valid 10 digit Alternative Number';
                         $("#danger-alert").show();
                    }else {
                        //console.log(memberDetails.aNum)
                        $scope.submitButtonClass = false;
                        $scope.resetButtonClass = false;
                        var url = "/api/team/add-member";
                        $("#loader").show();
                        httpService.callRestApi(memberDetails, url, "POST")
                                .then(function (response) {
                                    console.log(response.data);
                                    $scope.membermailid = response.data;
                                    $("#loader").hide();
                                    //$scope.incidentID = response.data.incidentID;
                                    $("#success-alert").show();
                                    $("#danger-alert").hide();
                                    //$scope.createNewButtonClass = true;
                                    $("#emp_ID").val("");
                                    $("#emp_dsign").val("");
                                    $("#emp_fname").val("");
                                    $("#emp_lname").val("");
                                    $("#emp_mno").val("");
                                    $("#emp_ano").val("");
                                    $("#emp_email").val("");
                                    $("#emp_location").val("");
                                    $("#emp_role").val("");
                                }, function (reason) {
                                    $("#loader").hide();
                                    $scope.errorMsg = reason.msg;
                                    $("#danger-alert").show();
                                    console.log(reason);
                                    //$scope.createNewButtonClass = true;
                                    $scope.submitButtonClass = false;
                                });
                    }

                    //} else {
                    //  alert("Please fill out all fields");
                    //}
                }

                $scope.resetForm = function () {
                    $window.location.reload();
                }

                $scope.newMember = function () {
                    $window.location.reload();
                }

                $scope.importFormData={};
                $scope.getMemberDetail = function () {
                    //console.log('get detail Loaded');
                    $scope.isVisible = false;
                    //console.log($stateParams);
                    $scope.memberID = $stateParams.memberID;
                    //console.log($scope.incId);
                    $("#loader").show();
                    findIncidentById($scope.memberID);
                }

                   // importing Members through Excel Sheet

                   $scope.importMember = function(data){
                        console.log(data);    
                        console.log('Coming'+data);

                        var url = "/api/team/import-members";
                        //console.log(values);    
                        Upload.upload({
                            url: url, //webAPI exposed to upload the file
                            data: {
                                file: data.file
                            }
                        }).then(function (resp) { //upload function returns a promise
                            console.log('inside response', resp.data.data);
                            if (resp.data.error_code === 0) { //validate success
                                //console.log()
                                //$scope.data = '';
                                //$("#success-alert").show();
                                $("#danger-alert").hide();
                                $scope.UsersListToUpload=resp.data.data;
                                 $(".form-horizontal")[0].reset();
                            } else {
                                $scope.errorMsg = "Please enter xls or xlsx files.";
                                $("#danger-alert").show();
                                console.log('Error while create ticket :: ', resp.data.err_desc);
                                 $(".form-horizontal")[0].reset();
                            }
                        })
                    }

                    $scope.CreateUsers=function(){
                        angular.forEach($scope.UsersListToUpload, function(value, key) {
                           console.log('some value',value,key);
                           if(value){
                             var userObj={
                                email: value.email,
                                fName: value.fname,
                                lName: value.lname,
                                mNum: value.mnum,
                                aNum: value.anum,
                                empID: value.empid,
                                location: value.location,
                                designation:value.designation                              
                           }
                            var url = "/api/team/add-member";
                            $("#loader").show();
                            console.log('Get Details', value);
                            httpService.callRestApi(userObj, url, "POST")
                                .then(function (response) {
                                    console.log(response.data);
                                    $("#loader").hide();
                                    $scope.UsersListToUpload[key].status='success';
                                }, function (reason) {
                                    console.log(reason);
                                    $("#loader").hide();
                                    $scope.UsersListToUpload[key].status='error';
                                    //$scope.createNewButtonClass = true;
                                    //$scope.submitButtonClass = false;
                                });
                           }
                        });
                    }
                    
                $scope.updateProfile = function (data) {
                    if (data.npwd && (data.npwd === data.renterpwd && data.email)) {
                        $("#loader").show();
                        var udata = {
                            npwd: data.npwd,
                            email: data.email
                        };
                        var url = "/api/user/update-password";
                        httpService.callRestApi(udata, url, "POST")
                                .then(function (response) {
                                    console.log(response);
                                    $("#success-alert").show();
                                    $("#danger-alert").hide();
                                    $("#loader").hide();
                                    $scope.data.npwd = '';
                                    $scope.data.renterpwd = '';
                                    $scope.isClosed = true;
                                }, function (reason) {
                                    $scope.errorMsg = reason;
                                    $("#danger-alert").show();
                                    $("#loader").hide();
                                    $scope.isClosed = false;
                                });
                    }

                    if ($scope.OldAccessRole !== data.accessRole) {
                        $("#loader").show();
                        var udata = {
                            email: data.email,
                            accessRole: data.accessRole
                        };
                        var url = "/api/team/update-memberinfo";
                        httpService.callRestApi(udata, url, "POST")
                                .then(function (response) {
                                    //console.log(response);
                                    $("#danger-alert").hide();
                                    $("#success-alert").show();
                                    $("#loader").hide();
                                    $scope.isClosed = true;
                                }, function (reason) {
                                    $scope.errorMsg = reason;
                                    $("#danger-alert").show();
                                    $("#loader").hide();
                                    $scope.isClosed = false;
                                });
                    }
                    if (!data.npwd && $scope.OldAccessRole == data.accessRole) {
                        $("#danger-alert").show();
                        $("#loader").hide();
                        $scope.errorMsg = 'Nothing changed to update!';
                        $scope.isClosed = false;
                    }
                }
                        // updating all informations of user  | updateProfiledetails

                $scope.updateProfiledetails = function (data) {
                	//console.log("Data :: ",data);
                	$("#success-alert").hide();
                	$("#danger-alert").hide();
                	if (data.mNum != null && data.mNum.toString().length > 0 && data.mNum.toString().length !== 10) {
                		$scope.errorMsg = 'Please Enter valid 10 digit Mobile Number';
                		$("#danger-alert").show();
                  	}else if(data.aNum != null && data.aNum.toString().length > 0 && data.aNum.toString().length !== 10){
              			$scope.errorMsg = 'Please Enter valid 10 digit Alternative Number';
                      	$("#danger-alert").show();
                    }else {
                    	//console.log("Inside Else");
                        $("#loader").show();
                        var udata = {
                            id: data._id,   // updating information by _id of database
                            fName: data.fName,
                            lName: data.lName,
                            mNum : data.mNum,
                            aNum: data.aNum,
                            email: data.email,
                            empID: data.empID,
                            location: data.location,
                            designation: data.designation
	                    };
	
                        //console.log('Coming');
                        console.log("udata :: ",udata);
                        var url = "/api/user/update-info";
                        httpService.callRestApi(udata, url, "POST")
                                .then(function (response) {
                                    console.log("Success :: ",response);
                                    $("#success-alert").show();
                                    $("#danger-alert").hide();
                                    $("#loader").hide();
                                    $scope.data = '';
                                    $scope.isClosed = true;
                                    $window.location.href = '/dashboard/team/member-profile/'+udata.id;
                                }, function (reason) {
                                    console.log("Error :: ",reason);
                                    $scope.errorMsg = reason;
                                    $("#danger-alert").show();
                                    $("#loader").hide();
                                    $scope.isClosed = false;
                                });
	                    if (!data.npwd && $scope.OldAccessRole == data.accessRole) {
	                        $("#danger-alert").show();
	                        $("#loader").hide();
	                        $scope.errorMsg = 'Nothing changed to update!';
	                        $scope.isClosed = false;
	                    }
                    }
                }

             // Location List For The DropDown @ 05/10/2016
             $scope.locations =  ['Hyderabad','Noida','Pune', 'Atlanta USA'];

           
            // Email Validation 
               $scope.emailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


            





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
                            }, function (reason) {
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

                var findIncidentById = function (memID) {
                    var url = "/api/team/member-detail";
                    $scope.data = {};
                    httpService.callRestApi({memberID: memID}, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                if (response.data._id != undefined) {
                                    $scope.isVisible = true;
                                    console.log("memberData :: ",response.data);
                                    //$scope.data = response.data;
                                    var memberData = response.data;
                                    $scope.OldAccessRole = $scope.data.accessRole;
                                    //console.log($scope.OldAccessRole);
                            		var url = "/api/roles/get-user-roles";
                                    httpService.callRestApi({email: memberData.email}, url, "POST")
                                        .then(function (response) {
                                            console.log('Roles List :: '+response.data);
                                            var user_roles = response.data;
                                			var roles = [];
                                            console.log('Roles List Scope :: '+response.data);
                                        	for (var i = 0; i < user_roles.length; i++) {
                                        		var rolename = user_roles[i].role_id.name;
                                        		roles.push(rolename);
                                        		console.log('roleid :: ',rolename);
                                        	}
                                            console.log('roles :: '+roles);

    	                                    var memberdetails = {
    	                                    	_id: memberData._id,
    	                                    	aNum: memberData.aNum,
    	                                    	created: memberData.created,
    	                                    	designation: memberData.designation,
    	                                    	email: memberData.email,
    	                                    	empID: memberData.empID,
    	                                    	fName: memberData.fName,
    	                                    	lName: memberData.lName,
    	                                    	location: memberData.location,
    	                                    	mNum: memberData.mNum,
    	                                    	roles : roles
                                            };
    	                                    $scope.data = memberdetails;
    	                                    /*if($("#member_location") !== null){
                                                console.log('member_location :: '+memberdetails.location);
        	                                    $("#member_location").val(memberdetails.location);
    	                                    }*/
                                        },function (reason) {
                                            //$("#loader").hide();
                                            console.log('Error :: '+reason);
                                            $location.path('/oops/');
                                        });
                                } else {
                                    $("#loader").hide();
                                    //$location.path('/damn-it/');
                                }
                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }


                $scope.loadMembersTable = function () {
                    $("#loader").show();
                    var url = "/api/team/members";
                    $scope.data = {};
                    httpService.callRestApi(null, url, "GET")
                            .then(function (response) {
                                //console.log($scope.data);
                                $("#loader").hide();
                                $scope.data = response.data;
                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }

                // Getting Permissions Details
                $scope.getRolesList = function () {
            		var url = "/api/roles/get-roles";
        			$scope.roles = {};
                    httpService.callRestApi(null, url, "GET")
                        .then(function (response) {
                            console.log('Roles List :: '+response);
                            //$("#loader").hide();
                            $scope.roles = response.data;
                            console.log('Roles List Scope :: '+$scope.roles);
                        },function (reason) {
                            //$("#loader").hide();
                            console.log('Error :: '+reason);
                            $location.path('/oops/');
                        });
                }

                //$scope.phoneNumbr = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;
            }]);


//console.log('$scope.data assigned as ', $scope.data);
//$scope.data.reportedDate = $filter("date")(response.data.reportedDate, 'MM/dd/yyyy HH:mm:ss');
//$scope.data.releaseDate = $filter("date")(response.data.releaseDate, 'yyyy-MM-dd');
//console.log('AAAAA-' + response.data.accessRole);
//                                    if (response.data.accessRole == "member")
//                                    {
//                                        $("#roleDiv").disable;
//                                        console.log('BBBBBB-' + response.data.accessRole);
//                                    } else {
//                                        // $("#roleDiv").enable();
//                                    }


//                $scope.updatePwd = function (data) {
//                    //console.log(data.npwd);
//                    $("#loader").show();
//                    if (data.npwd && (data.npwd !== data.renterpwd || !data.email)) {
//                        $scope.errorMsg = 'Password did not match & email is not valid';
//                        $("#danger-alert").show();
//                        $("#loader").hide();
//                    } else {
//
//                        if ($scope.OldAccessRole !== data.accessRole) {
//                            var udata = {
//                                npwd: data.npwd,
//                                email: data.email,
//                                accessRole: data.accessRole
//                            };
//                        } else {
//                            var udata = {
//                                npwd: data.npwd,
//                                email: data.email
//                            };
//                        }
//                        console.log(udata);
//
//                        console.log('update AccessRole : ' + data.accessRole);
//
//                        var url = "/api/user/update-password";
//                        httpService.callRestApi(udata, url, "POST")
//                                .then(function (response) {
//                                    console.log(response);
//                                    $("#success-alert").show();
//                                    $("#loader").hide();
//                                    if (data.data.npwd) {
//                                        $scope.data.data.npwd = '';
//                                        $scope.data.data.renterpwd = '';
//                                    }
//                                    $scope.isClosed = true;
//                                }, function (reason) {
//                                    $("#loader").hide();
//                                    $scope.errorMsg = reason;
//                                    $("#danger-alert").show();
//                                    $("#loader").hide();
//                                    $scope.isClosed = false;
//                                });
//                    }
//
//                }