/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
angular.module('helpDesk')
        .controller('loginAppCtrl', ['$scope', '$window', 'httpService', 'AuthService', '$state', '$rootScope', 'AclService','$stateParams',
            function ($scope, $window, httpService, AuthService, $state, $rootScope, AclService,$stateParams) {
                $scope.loginSubmit = function (cred) {
                    $scope.loginProgress = true;
                    AuthService.login(cred).then(function (msg) {
                        $scope.loginProgress = true;
                        if(AclService.can('14764455')){
                           $state.go('dashboard.main'); 
                        }else if(AclService.can('37810236')){
                        	if(AuthService.fromState=='dashboard.ticket-details'){
                        		$state.go('dashboard.ticket-details',{'ticketID':AuthService.toParams.ticketID}); 
                        	}else{
                        		$state.go('dashboard.approvals'); 
                        	}
                           
                        }else if(AclService.can('78894315')){
                           $state.go('dashboard.mytickets'); 
                        }else{
                           $state.go('dashboard.welcome');   
                        }
                    }, function (errMsg) {
                        console.log(errMsg);
                        $scope.errorMsg = errMsg;
                        $scope.loginProgress = false;
                        $("#danger-alert").show();
                    });

                }
                
                $scope.forgetpwdSubmit = function (email) {
                    //console.log('email received', email);
                    $scope.loginProgress = true;
                    AuthService.resetPwd(email).then(function (msg) {
                        $scope.loginProgress = false;
                        $scope.successMsg = msg;
                        $scope.frgtpwd.email = '';
                        $("#danger-alert").hide();
                        $("#success-alert").show();
                    }).catch(function (e) {
                        $scope.errorMsg = e;
                        $scope.loginProgress = false;
                        $("#danger-alert").show();
                    })
                }

                
                $scope.changePassword = function (data) {
                    var email = $rootScope.userObj.email;
                     if (data.newPwd !== data.oldPwd) {
                        if (data.newPwd === data.confPwd) {
                        var udata = {
                            currPwd: data.oldPwd,
                            newPwd: data.newPwd,
                            email: email
                        };
                        var url = "/api/user/change-Password";
                        httpService.callRestApi(udata, url, "POST")
                                .then(function (response) {
                                    if (response.data.success) {
                                        $scope.logoutSubmit('show_relogin_message');
                                    } else {
                                        $scope.errorMsg = "Invalid Current Password";
                                        $("#danger-alert").show();
                                    }
                                });

                    } else {
                        $scope.errorMsg = "New Password and Confirm Password should match";
                        $("#danger-alert").show();
                    }
                    }else {
                        $scope.errorMsg = "Current and new password should not be same";
                        $("#danger-alert").show();
                    }
            }
                    $('#old_password,#new_pwd,#conf_pwd').on('keypress', function(e) {
                    if (e.which == 32)
                    return false;
                    });

            }]);