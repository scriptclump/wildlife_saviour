angular.module('helpDesk')
        .controller('rolesCtrl', ['$scope', '$window', 'httpService', '$stateParams', '$filter', '$location','$timeout',
            function ($scope, $window, httpService, $stateParams, $filter, $location,$timeout) {
                $scope.udata = {};
	              $scope.selectedprivileges = [];
                $scope.createRole = function (roleDetails) {
                    console.log("In Create Role :: ",roleDetails);
                    $("#success-alert").hide();
                	if(roleDetails.editrole != undefined && roleDetails.editrole != ""){
                		$scope.updateRolePrivileges(roleDetails);
                	}else{
	                    var $priv_selected = $('input[name=privilegeslist]:checked');
	                    for(var i=0; i<$priv_selected.length; i++){
	                    	$scope.selectedprivileges.push($priv_selected[i].id);
	                    }
	                    var privilegesList = $scope.selectedprivileges;
	                    if (roleDetails.rolename.toString().length == 0) {
	                        $scope.errorMsg = 'Please Enter valid Role Name';
	                        $("#danger-alert").show();
	                    }else if (roleDetails.roledesc.toString().length == 0) {
	                        $scope.errorMsg = 'Please Enter valid Role Description';
	                        $("#danger-alert").show();
	                    }else if (privilegesList.length == 0) {
	                        $scope.errorMsg = 'Please Select atleast one privilege';
	                        $("#danger-alert").show();
	                    } else {
	                        $("#danger-alert").hide();
	                       var randomNum = $scope.generateroleID();  // generating Random ID for Each Role
	                        var newRole = {
	                            id: randomNum,
	                            rolename: roleDetails.rolename,
	                            roledesc: roleDetails.roledesc,
	                            privileges: privilegesList
	                        };
	                        var url = "/api/roles/create-role";
	                        $("#loader").show();
	                        httpService.callRestApi(newRole, url, "POST")
	                                .then(function (response) {
	                                    console.log("Role response :: ",response.data);
	                                    $("#loader").hide();
	                                    $("#success-alert").show();
	                                    $("#danger-alert").hide();
	                                    $("#role_name").val('');
	                                    $("#role_desc").val('');
	                                    $scope.selectedprivileges = [];
	                                    $(".privilege_item").prop("checked", false);
	                                }, function (reason) {
	                                    $("#loader").hide();
	                                    $scope.errorMsg = reason.msg;
	                                    $("#danger-alert").show();
	                                    console.log(reason);
	                                });
	                    }
                		
                	}
                }
                
                 // for pagination
                 $scope.list = [];
                 $scope.currentPage = 1; // keeps track of the current page
                 $scope.pageSize = 10; // holds the number of items per page


                $scope.updateRolePrivileges = function (roleDetails) {
                    $("#success-alert").hide();
                    console.log("In Update Role Privileges :: ",roleDetails);
                    var role_id = roleDetails.editrole;
                    console.log("role_id :: ",role_id);
                    var $priv_selected = $('input[name=privilegeslist]:checked');
                    for(var i=0; i<$priv_selected.length; i++){
                    	$scope.selectedprivileges.push($priv_selected[i].id);
                    }
                    var privilegesList = $scope.selectedprivileges;
                    console.log("privilegesList :: ",privilegesList);
                    if (privilegesList.length == 0) {
                        $scope.errorMsg = 'Please Select atleast one privilege';
                        $("#danger-alert").show();
                    } else {
                        $("#danger-alert").hide();
                        var updateRole = {
                            id: role_id,
                            privileges: privilegesList
                        };
                        console.log("Role Object :: ",updateRole);
                        var url = "/api/roles/update-role";
                        $("#loader").show();
                        httpService.callRestApi(updateRole, url, "POST")
                                .then(function (response) {
                                    console.log("Role response :: ",response.data);
                                    $("#loader").hide();
                                    $("#success-alert").show();
                                    $("#danger-alert").hide();
                                    $("#role_name").val('');
                                    $("#role_desc").val('');
                                    $scope.selectedprivileges = '';
                                    $(".privilege_item").prop("checked", false);
                                }, function (reason) {
                                    $("#loader").hide();
                                    $scope.errorMsg = reason.msg;
                                    $("#danger-alert").show();
                                    console.log(reason);
                                });
                    }
                }

                $scope.generateroleID = function () {
                    var IDnum = chance.integer({min: 10000000, max: 99999999});
                    return(IDnum);
                };
                
                $scope.selectedPriv = {
                	ids: {"50d5ad": true}
                };

                // Getting Permissions Details
                $scope.getPrivileges = function () {
            		var url = "/api/roles/privileges";
        			$scope.data = {};
                    httpService.callRestApi(null, url, "GET")
                        .then(function (response) {
                            console.log('Privileges :: '+response);
                            $("#loader").hide();
                            var test = response.data;
                            $scope.data = response.data;
                        },function (reason) {
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
                            $("#loader").hide();
                            $scope.roles = response.data;
                            console.log('Roles List Scope :: '+$scope.roles);
                        },function (reason) {
                            $("#loader").hide();
                            $location.path('/oops/');
                        });
                }
                
                $scope.updateRoleInfo = function (roleDetails) {
                    $("#role_name").val('');
                    $("#role_desc").val('');
                    $(".privilege_item").prop("checked", false);
                	if(roleDetails.editrole == ""){
                        $("#role_name").prop( "disabled", false );
                        $("#role_desc").prop( "disabled", false );
                	}else{
                        $("#role_name").prop( "disabled", true );
                        $("#role_desc").prop( "disabled", true );
                        if(roleDetails.editrole != undefined){
                            var privilegesurl = "/api/roles/get-role-privileges";
                            var privilegesList = [];
	                        httpService.callRestApi({role_id: roleDetails.editrole}, 
	                        		privilegesurl, "POST").then(function (res) {
	                            var privilegesList = res.data;
	                            for (var i = 0; i < privilegesList.length; i++) {
	                            	var uiId = privilegesList[i].privilege_ref._id;
	                            	$("#"+uiId).prop('checked', true);
	                            };
	                        }, function (reason) {
	                            $("#loader").hide();
	                            $location.path("/oops/");
	                        });
	                	}
                	}
                }
                
                $scope.updateUserRoleInfo = function (authuser) {
                    console.log("Inside updateUserRoleInfo :: ",authuser);
                    if(authuser.username != undefined && authuser.username != ""){
                		var url = "/api/roles/get-user-roles";
                        httpService.callRestApi({email: authuser.username}, url, "POST")
                            .then(function (response) {
                                console.log('Roles List :: '+response.data);
                                var user_roles = response.data;
                    			var roles = [];
                                console.log('Roles List user_roles :: '+user_roles);
                        		console.log('Total roles :: ',user_roles.length);
                            	for (var i = 0; i < user_roles.length; i++) {
                            		var roleref = user_roles[i].role_id._id;
                            		roles.push(roleref);
                            	}
                            	if(roles.length > 0){
                            		$("#roles").val('');
                            		for(var i = 0; i < roles.length; i++){
                            			$("#roles option").filter('[value="'+roles[i]+'"]').prop('selected', true);
                            		}
                            	}else{
                            		$("#roles").val('');
                            	}
                            },function (reason) {
                                console.log('Error :: '+reason);
                                $location.path('/oops/');
                            });
                	}else{
                		$("#roles").val('');
                	}
                }
                
                $scope.loadRoles = function () {
                    $("#loader").show();
                    var url = "/api/roles/view-roles";
                    $scope.data = [];
                    httpService.callRestApi(null, url, "GET")
                            .then(function (response) {
                                $("#loader").hide();
                                var roles = [];
                                var resData = response.data;
                                roles = response.data;
                                var privilegesurl = "/api/roles/get-role-privileges";
                                var privilegesList = [];
                                for (var i = 0; i < roles.length; i++) {
                                    httpService.callRestApi({role_id: roles[i].role_id}, 
                                    		privilegesurl, "POST").then(function (res) {
                                        var privilegesList = res.data;
                                        var roleid = res.data[0].role_id;
                                    	var selectedRole;
                                    	for (var i = 0; i < roles.length; i++) {
                                    		if(privilegesList[0].role_id ==  roles[i].role_id){
                                    			selectedRole = roles[i];
                                    			break;
                                    		}
                                    	}
                                        var roleprivileges = [];
	                                    for (var i = 0; i < privilegesList.length; i++) {
	                                    	roleprivileges.push(privilegesList[i].privilege_ref.name);
	                                    };
	                                    var roledata = {
                                    		role_id: selectedRole.role_id,
                                            name: selectedRole.name,
                                            desc: selectedRole.desc,
                                            privileges: roleprivileges
                                        };
                                        	$scope.data.push(roledata);
	                                }, function (reason) {
	                                    $("#loader").hide();
	                                    $location.path("/oops/");
	                                });
                                }
                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }

                // Getting Permissions Details
                $scope.saveRolePrivileges = function (rolePrivileges) {
                    console.log('saveRolePrivileges :: '+rolePrivileges);
            		var url = "/api/roles/role-privileges";
        			$scope.data = {};
                    httpService.callRestApi(rolePrivileges, url, "POST")
                        .then(function (response) {
                            console.log('rolePrivileges :: '+response);
                            $("#loader").hide();
                            $scope.data = response.data;
                            console.log('rolePrivileges Scope :: '+$scope.data);
                        },function (reason) {
                            $("#loader").hide();
                            $location.path('/oops/');
                        });
                }
                
                $scope.loadMembersTable = function () {
                    $("#loader").show();
                    var url = "/api/team/members";
                    $scope.members = {};
                    httpService.callRestApi(null, url, "GET")
                            .then(function (response) {
                                $("#loader").hide();
                                $scope.members = response.data;
                                console.log("loadMembersTable :: ",$scope.members);
                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }
                
                $scope.assignUserRoles = function (auth) {
                    if (auth.username === undefined || auth.username === "") {
                        $scope.errorMsg = 'Please Select User';
                        $("#success-alert").hide();
                        $("#danger-alert").show();
                    }else if (auth.roles === undefined) {
                        $scope.errorMsg = 'No changes found. Please Select/Deselect roles';
                        $("#success-alert").hide();
                        $("#danger-alert").show();
                    } else {
                        $("#danger-alert").hide();
                        var assignRole = {
                            email: auth.username,
                            roles: auth.roles
                        };
                        var url = "/api/roles/assign-roles";
                        $("#loader").show();
                        httpService.callRestApi(assignRole, url, "POST")
                                .then(function (response) {
                                    $("#loader").hide();
                                    $("#success-alert").show();
                                    $scope.auth = '';
                                    $("#danger-alert").hide();
                                }, function (reason) {
                                    $("#loader").hide();
                                    $scope.errorMsg = reason.msg;
                                    $("#danger-alert").show();
                                    console.log(reason);
                                });
                    }
                }

                $scope.resetCreateRoleForm = function () {
                	angular.copy({}, role);
                	angular.copy({}, checked);
                }
    	}]);

// for pagination
angular.module('helpDesk').filter('start', function () {
                    return function (input, start) {
                        if (!input || !input.length) { return; }
 
                        start = +start;
                        return input.slice(start);
                       };
                 });