angular.module('helpDesk')
        .controller('ticketCtrl', ['$scope', '$window', 'httpService', '$stateParams', '$filter', '$location', '$sce', '$rootScope', '$timeout', 'DTOptionsBuilder', '$modal', 'Upload', 'AclService',
            function ($scope, $window, httpService, $stateParams, $filter, $location, $sce, $rootScope, $timeout, DTOptionsBuilder, $modal, Upload, AclService) {
                $scope.commentsList = {};
                $scope.ticketsList = [];
                var host = $location.host();
                host = location.host;
                var protocol = $location.protocol();
                $rootScope.appUrl = protocol + "://" + host + "/";
                $scope.loadTicketsFrom = function (data) {
                    console.log("data", data)
                    var url = "/api/ticketsRelated/ticket";
                    if (data != undefined) {
                        httpService.callRestApi({status: data}, url, "GET").then(function (response) {
                            $scope.ticketsList = response.data;
                            for (i = 0; i < response.data.length; i++) {
                                $scope.ticketsList[i].spent_duration = $scope.convertMinsToHrs($scope.ticketsList[i].total_mins_spent | $scope.ticketsList[i].total_hrs_spent);
                            }
                        });
                    } else {
                        httpService.callRestApi({status: 'Open'}, url, "GET").then(function (response) {
                            $scope.ticketsList = response.data;
                            for (i = 0; i < response.data.length; i++) {
                                $scope.ticketsList[i].spent_duration = $scope.convertMinsToHrs($scope.ticketsList[i].total_mins_spent | $scope.ticketsList[i].total_hrs_spent);
                            }
                        });
                    }
                }

                $scope.newTicketSubmit = function (data) {
                    if (data.subject.toString().length == 0) {
                        $scope.errorMsg = 'Please Enter Issue/Request Subject';
                        $("#danger-alert").show();
                    } else if (data.description.toString().length == 0) {
                        $scope.errorMsg = 'Please Enter Issue/Request Description';
                        $("#danger-alert").show();
                    } else {
                        var email = $rootScope.userObj.email;
                        var name = $rootScope.userObj.fName;
                        var ticketID = Date.now();
                        var values = {
                            ticketID: ticketID,
                            email: email,
                            name: name,
                            desc: data.description,
                            subject: data.subject
                        }
                        /*files:ticketDetails.files,*/
                        var url = "/api/ticketsRelated/new-ticket";
                        Upload.upload({
                            url: url, //webAPI exposed to upload the file
                            data: {
                                file: data.files,
                                params: values
                            }
                        }).then(function (resp) { //upload function returns a promise
                            console.log('inside response', resp.data);
                            if (resp.data.error_code === 0) { //validate success
                                $scope.data = '';
                                $("#success-alert").show();
                            } else {
                                $("danger-alert").show();
                                console.log('Error while create ticket :: ', resp.data.err_desc);
                            }
                        }
                        )


                    }
                }

                $scope.loadTicketsForApproval = function () {
                    console.log('Inside loadTicketsForApproval');
                    $("#loader").show();
                    var url = "/api/ticketsRelated/approvertickets";
                    $scope.ticketsList = {};
                    var params = {
                        memberID: $rootScope.userObj._id
                    }
                    console.log($rootScope.userObj, ' :: params');
                    httpService.callRestApi(params, url, "GET").then(function (response) {
                        $("#loader").hide();
                        console.log('response', response.data.data);
                        $scope.ticketsList = response.data.data;
                        console.log($scope.ticketsList, ' :: after for loop');
                    }, function (reason) {
                        $("#loader").hide();
                        $location.path("/oops/");
                    });
                };

                $scope.getTicketDetail = function () {
                    $scope.isVisible = false;
                    $scope.ticeketID = $stateParams.ticketID;
                    $scope.loggedInUserObj = $rootScope.userObj;
                    $("#loader").show();
                    console.log($scope.ticeketID);
                    if ($scope.ticeketID) {
                        findTicketById($scope.ticeketID);
                        $scope.loadTicketComments($scope.ticeketID);
                        $scope.loadItTeamMemberslist();
                        $scope.loadApproverTable();
                    }
                }

               /*
                * Function For Calculating Total time spent on ticket
                */ 
                $scope.convertMinsToHrs = function (min) {
                    if (min > 0) {
                        var hours = Math.floor(min / 60);
                        var minutes = (min % 60);
                        var hrsObj = {
                            hrs: hours,
                            min: minutes
                        }
                    } else {
                        var hrsObj = {
                            hrs: 0,
                            min: 0
                        }
                    }
                    return hrsObj;
                }
                $scope.loadTicketsTable = function () {
                    $("#loader").show();
                    var url = "/api/ticketsRelated/ticket";
                    var params = {};
                    $scope.ticketsList = {};
                    if ($stateParams.searchField === 'issues') {
                        $scope.title = 'Issues';
                        params = {
                            issue_type_cat_1: 'issue'
                        }
                    } else if ($stateParams.searchField === 'requests') {
                        $scope.title = 'Requests';
                        params = {
                            issue_type_cat_1: 'request'
                        }
                    } else if ($stateParams.searchField === 'unsolved_tickets') {
                        $scope.title = 'UnSolved tickets';
                        params = {
                            status: 'UnClosed'
                        }
                    } else if ($stateParams.searchField === 'tat_tickets') {
                        $scope.title = 'TAT tickets';
                        params = {
                            tat_tickets: 'true'
                        }
                    } else {
                        $scope.title = 'Tickets';
                    }
                    httpService.callRestApi(params, url, "GET").then(function (response) {
                        $("#loader").hide();
                        $scope.TimeExceededTickets = [];
                        $scope.ticketsList = response.data;
                        for (var i = 0; i < response.data.length; i++) {
                            $scope.ticketsList[i].spent_duration = $scope.convertMinsToHrs($scope.ticketsList[i].total_mins_spent);
                        };
                    }, function (reason) {
                        $("#loader").hide();
                        $location.path("/oops/");
                    });
                };

                $scope.loadMyTicketsTable = function () {
                    $("#loader").show();
                    var url = "/api/ticketsRelated/mytickets";
                    $scope.ticketsList = {};
                    var email = $rootScope.userObj.email;
                    if (email != "" && email != undefined) {
                        httpService.callRestApi({email: email}, url, "POST").then(function (response) {
                            $("#loader").hide();
                            var tickets = response.data;
                            $scope.ticketsList = tickets.data;
                        }, function (reason) {
                            $("#loader").hide();
                            $location.path("/oops/");
                        });
                    }
                };
                $scope.loadItTeamMemberslist = function () {
                    $("#loader").show();
                    var url = "/api/ticketsRelated/itteammemberslist";
                    $scope.membersList = {};
                    httpService.callRestApi(null, url, "GET")
                            .then(function (response) {
                                $("#loader").hide();
                                $scope.membersList = response.data;
                                console.log($scope.membersList, 'membersList after');
                                var membersList = $scope.membersList;

                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }
                $scope.loadApproverTable = function () {
                    $("#loader").show();
                    var url = "/api/ticketsRelated/approvers";
                    $scope.approverList = {};
                    httpService.callRestApi(null, url, "GET")
                            .then(function (response) {
                                $("#loader").hide();
                                $scope.approverList = response.data;
                                var approverList = $scope.approverList;
                            }, function (reason) {
                                $("#loader").hide();
                                $location.path('/oops/');
                            });
                }
                $scope.getHrsSpent = function (data, i) {
                    if (data[i].hrs_spent_start > 0) {
                        var seconds = Math.floor((Date.now() - (data[i].hrs_spent_start)) / 1000);
                        var minutes = Math.floor(seconds / 60);
                        var hours = Math.floor(minutes / 60);
                        var days = Math.floor(hours / 24);
                        hours = hours - (days * 24);
                        minutes = minutes - (days * 24 * 60) - (hours * 60);
                        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
                        $scope.hours_spent = hours + "hr" + " " + minutes + "min" + " " + seconds + "sec";
                        return $scope.hours_spent;
                    } else {
                        $scope.hours_spent = "0 hrs";
                        return $scope.hours_spent;
                    }
                }
                $scope.IsHidden = true;
                $scope.ShowHide = function () {
                    $scope.IsHidden = $scope.IsHidden ? false : true;
                }

                $scope.sendEmailToApprover = function (ticketDetail) {
                    if ($.inArray(ticketDetail.approver, ticketDetail.approved_list) == -1) {
                        var approvername = $('#approvetList option:selected').text();
                        //alert(approvername);
                        var link = $rootScope.appUrl + "dashboard/tickets/ticket-detail/" + ticketDetail.ticketID;
                        var ticketOwner = ticketDetail.ownerid.fName + "  " + ticketDetail.ownerid.lName;
                        var subject = ticketDetail.ticketID + " " + ticketDetail.empName + " " + "Need Approval to the Ticket";
                        var status_old = ticketDetail.status;
                        var params = {
                            tid: ticketDetail.ticketID,
                            approver: ticketDetail.approver,
                            ticketOwner: ticketOwner,
                            subject: subject,
                            description: ticketDetail.description,
                            empName: ticketDetail.empName,
                            link: link,
                            
                        }

                        var url = "/api/ticketsRelated/sendEmail-approval";
                        
                        httpService.callRestApi(params, url, "GET")
                                .then(function (response) {
                                    console.log(response);
                                   
                                    $scope.data.status = 'Pending for Approval'; // Update UI for update on Status
                                    TrackTimeAutomate('Pending for Approval'); // Set Timer Off
                                    $("#success-alert").show();
                                    
                                }, function (reason) {
                                    $("#loader").hide();
                                    $scope.errorMsg = reason;
                                    $("#danger-alert").show();
                                });
                      
                        
                        var urll = "/api/ticketsRelated/activityLogs-approval";
                       
                        var actapmsg = "  " + ticketDetail.empName + " Need Approval from " + approvername;
                         var actmsg = " "  + " Status has been changed from " + status_old + " to Pending for Approval on " + $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        httpService.callRestApi({tid: ticketDetail.ticketID, approver: ticketDetail.approver, msg1: actapmsg, msg: actmsg}, urll, "POST")
                                .then(function (response) {
                                    console.log(response);
                                    //$scope.data.status = 'Pending for Approval'; // Update UI for update on Status
                                    //TrackTimeAutomate('Pending for Approval'); // Set Timer Off
                                    //$("#success-alert").show();
                                    if (response.status == 200) {
                                    console.log("Status updated ...", response);
                                    $scope.data.activityLogs.push(actapmsg);
                                    if(status_old!="Pending for Approval"){
                                    $scope.data.activityLogs.push(actmsg);
                                  }
                                }
                                }, function (reason) {
                                    //$("#loader").hide();
                                    $scope.errorMsg = reason;
                                    //$("#danger-alert").show();
                                    console.log("Error----",reason);
                                });


                    } else {
                        alert("Approver already tagged to the ticket.");
                        ticketDetail.approver = '';
                    }
                }

                $scope.updateApprovalStatus = function (statusValue, data) {
                    console.log("assign email", data.ownerid.fName);
                    var ticketOwner = data.ownerid.fName + "  " + data.ownerid.lName;
                    var host = $location.host();
                    host = location.host;
                    var protocol = $location.protocol();
                    var link = protocol + "://" + host + "/" + "dashboard/tickets/ticket-detail/" + data.ticketID;
                    var values = {
                        approvalStatus: statusValue,
                        ticketID: data.ticketID,
                        ticketOwner: ticketOwner,
                        ticketOwnerEmail: data.ownerid.email,
                        link: link
                    }
                    var url = "/api/ticketsRelated/ticket-approval-status";
                    httpService.callRestApi(values, url, "POST")
                            .then(function (response) {
                                if (response) {
                                    $scope.approvalStatus = response.data.approvalStatus;
                                    console.log(response.data.approvalStatus, "status of the ticket");
                                }
                            }, function (reason) {
                            });
                }


                $scope.ticketHrsTracking = function (data) {
                    var url = "/api/ticketsRelated/ticket-time-tracker";
                    httpService.callRestApi(data.ticketID, url, "POST")
                            .then(function (response) {
                                $("#success-alert").show();
                            }, function (reason) {
                                $("#loader").hide();
                                $scope.errorMsg = reason;
                                $("#danger-alert").show();
                            });
                };

                $scope.loadTicketComments = function (ticket_ID) {
                    console.log("from", ticket_ID)
                    $("#loader").show();
                    var url = "/api/ticketsRelated/comment";
                    var params = {
                        tid: ticket_ID
                    }
                    httpService.callRestApi(params, url, "GET").then(function (response) {
                        $("#loader").hide();
                        $scope.commentsList = response.data;
                        console.log("coments", $scope.commentsList)
                    }, function (reason) {
                        $("#loader").hide();
                        $location.path("/oops/");
                    });
                };
                var findTicketById = function (ticID) {
                    var url = "/api/ticketsRelated/ticket-detail";
                    $scope.data = {};
                    $scope.attachments = {};
                    $scope.ticketApproverList = [];
                    httpService.callRestApi({
                        ticketID: ticID
                    }, url, "GET").then(function (response) {
                        $("#loader").hide();
                        if (response.data[0].ticketID != undefined) {

                            $scope.isVisible = true;
                            var ticketDetails = response.data[0];
                            var fileattachments = [];
                            if (ticketDetails.img_Path != undefined && ticketDetails.img_Path.length > 0) {
                                for (var i = 0; i < ticketDetails.img_Path.length; i++) {
                                    var fileExts = ticketDetails.img_Path[i].split(/[\s.]+/);
                                    var fileExt = fileExts[fileExts.length - 1];
                                    var fieType = "";
                                    if (fileExt.match(/^(jpg|jpeg|gif|png)$/)) {
                                        fieType = "Image";
                                    } else if (fileExt.match(/^(doc|docx)$/)) {
                                        fieType = "Docs";
                                    } else if (fileExt.match(/^(xls|xlsx)$/)) {
                                        fieType = "Excel";
                                    } else if (fileExt.match(/^(pdf)$/)) {
                                        fieType = "Pdf";
                                    } else if (fileExt.match(/^(txt)$/)) {
                                        fieType = "Txt";
                                    } else {
                                        fieType = "Other";
                                    }
                                    var filedata = {
                                        type: fieType,
                                        path: $rootScope.appUrl + ticketDetails.img_Path[i]
                                    };
                                    fileattachments.push(filedata);
                                    console.log("filedata :: ", filedata);
                                }
                            }
                            $scope.data = response.data[0];
                            $scope.attachments = fileattachments;
                            var ticketApproverList = response.data[0].approved_list;
                            console.log("ticketApproverList :: ", ticketApproverList);
                            if (ticketApproverList != undefined && ticketApproverList.length > 0) {
                                console.log("Inside If");
                                var memberurl = "/api/team/member-detail";
                                for (var i = 0; i < ticketApproverList.length; i++) {
                                    var memberId = ticketApproverList[i];
                                    console.log("memberId :: ", memberId);
                                    httpService.callRestApi({memberID: memberId}, memberurl, "POST").then(function (response) {
                                        console.log("Member Response :: ", response.data);
                                        if (response.data._id != undefined) {
                                            $scope.ticketApproverList.push(response.data);
                                        }
                                    });
                                }
                            }
                            console.log("ticketApproverList :: ", $scope.ticketApproverList);
                            if (response.data[0].status == "New" && AclService.can('14764455')) {
                                updateTicketOwnership(response.data[0]._id);
                            }

                            if ($scope.data.assign_to != undefined) {
                                $scope.data.assign_to = $scope.data.assign_to._id;
                            }
                            $scope.data.reportedDate = $filter("date")(response.data[0].reportedDate, 'MM/dd/yyyy HH:mm:ss');
                        } else {
                            $("#loader").hide();
                        }
                    }, function (reason) {
                        $("#loader").hide();
                        $location.path('/oops/');
                    });
                }
                $scope.formatedHTML = function (descriptionData) {
                    return $sce.trustAsHtml(descriptionData);
                };
                var updateTicketOwnership = function (recID) {

                    console.log("updateTicketOwnership ............");
                    var url = "/api/ticketsRelated/ticket-Ownership";
                    var actmsg = " " + $rootScope.userObj.fName + " " + $rootScope.userObj.lName + " has ownership for this ticket on " + $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    httpService.callRestApi({
                        recID: recID, ownerid: $rootScope.userObj._id, msg: actmsg
                    }, url, "POST").then(function (response) {
                        console.log(response.status);
                        if (response.status == 200) {
                            console.log("Status updated ...", response);
                            $scope.data.status = 'Open';
                            $scope.data.ownerid = $rootScope.userObj;
                            $scope.data.activityLogs.push(actmsg);
                        }
                    });
                }

                $scope.addComment = function (data) {
                    $("#loader").show();
                    var cmodel = {
                        ticketID: $scope.data.ticketID,
                        tid: $scope.data._id,
                        reportedby: $scope.data.empName,
                        reportedbyemail: $scope.data.empEmail,
                        comment: data.comment,
                        userid: $rootScope.userObj._id,
                        username: $rootScope.userObj.fName + " " + $rootScope.userObj.lName,
                        name:$scope.data.empName,
                        notify: false
                    };
                    var url = "/api/ticketsRelated/add-comment";
                    httpService.callRestApi(cmodel, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                data.comment = '';
                                data.notify = null;
                                var totalComments = $scope.commentsList.length;
                                $scope.commentsList[totalComments] = response.data;
                            }, function (reason) {
                                $("#loader").hide();
                                $scope.errorMsg = reason;
                                $("#danger-alert").show();
                            });
                }

                $scope.addApproverComment = function (data) {
                    $("#loader").show();
                    var cmodel = {
                        ticketID: $scope.data.ticketID,
                        tid: $scope.data._id,
                        reportedby: $scope.data.empName,
                        reportedbyemail: $scope.data.empEmail,
                        comment: data.comment,
                        userid: $rootScope.userObj._id,
                        username: $rootScope.userObj.fName + $rootScope.userObj.lName,
                        notify: false
                    };
                    var url = "/api/ticketsRelated/add-comment-approver";
                    httpService.callRestApi(cmodel, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                data.comment = '';
                                data.notify = null;
                                var totalComments = $scope.commentsList.length;
                                $scope.commentsList[totalComments] = response.data;
                                console.log("after adding", response.data)
                            }, function (reason) {
                                $("#loader").hide();
                                $scope.errorMsg = reason;
                                $("#danger-alert").show();
                            });
                }

                $scope.sendCommentToEmp = function (empComment) {
                    $("#loader").show();
                    var cmodel = {
                        ticketID: $scope.data.ticketID,
                        reportedby: $scope.data.empName,
                        reportedbyemail: $scope.data.empEmail,
                        comment: empComment.comment,
                        userid: $rootScope.userObj._id,
                        username: $rootScope.userObj.fName + $rootScope.userObj.lName,
                        name:$scope.data.empName,
                        notifyEmp: true
                    };
                    var url = "/api/ticketsRelated/add-comment-emp";
                    console.log('data passed between data', cmodel);
                    httpService.callRestApi(cmodel, url, "POST")
                            .then(function (response) {
                                $("#loader").hide();
                                empComment.comment = '';
                                var totalComments = $scope.commentsList.length;
                                $scope.commentsList[totalComments] = response.data;
                            }, function (reason) {
                                $("#loader").hide();
                                $scope.errorMsg = reason;
                                $("#danger-alert").show();
                            });
                }
                $scope.focusCallback = function ($event) {
                    $scope.attributeName = $event.target.id;
                }

                $scope.tracktime = function (ticketID, status) {
                    var params = {
                        ticketID: ticketID,
                        service_type: status
                    }

                    var url = "/api/ticketsRelated/ticket-time-tracker";
                    httpService.callRestApi(params, url, "POST").then(function (response) {
                        console.log('responce received', response);
                        $scope.data.track_button = status;
                        $("#loader").hide();
                    }, function (reason) {
                        $("#loader").hide();
                        console.log('Error Occured while turning on Track Time', reason);
                    });
                }

                var TrackTimeAutomate = function (toVal) {
                    var params = $scope.data.ticketID;  
                    switch (toVal) {
                        case 'Pending for Approval' :
                            $scope.tracktime(params, false); // Turn off when status is pending for approval
                            break;
                        case 'Working with Vendor' :
                            $scope.tracktime(params, false); // Turn off when status is Working with Vendor
                            break;
                        case 'Close' :
                            $scope.tracktime(params, false); // Turn off when status is Closed
                            break;
                        case 'Work in Progress' :
                            $scope.tracktime(params, true); // Turn off when status is Work in Progress
                            break;
                        case 'New' :
                            $scope.tracktime(params, true); // Turn off when status is New
                            break;
                        case 'Re-Open' :
                            $scope.tracktime(params, true); // Turn on when status is Re Open
                            break;
                        case 'Open' :
                            $scope.tracktime(params, true); // Turn off when status is Open
                            break;
                        default:
                            $scope.tracktime(params, true);
                    }
                }


                $scope.updateActivityAndTicket = function (prameter, fromVal, toVal) {
                    $scope.FromDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    var activityLogtitle = '';
                    var logText, toValText, fromValText = '';
                    if (prameter == 'status') {
                        activityLogtitle = 'status';
                    } else if (prameter == 'tat_time') {
                        activityLogtitle = 'Tat time';
                    } else if (prameter == 'priority') {
                        activityLogtitle = 'priority';
                    } else if (prameter == 'assign_to') {
                        activityLogtitle = 'assigned to';
                        angular.forEach($scope.membersList, function (value) {
                            if (value._id === toVal) {
                                toValText = value.fName + ' ' + value.lName;
                            }
                            if (fromVal && value._id === fromVal) {
                                fromValText = value.fName + ' ' + value.lName;
                            }
                        });
                    } else if (prameter == 'issue_type_cat_1' || prameter == 'issue_type_cat_2' || prameter == 'issue_type_cat_3') {
                        activityLogtitle = 'category';
                    } else {
                        activityLogtitle = prameter;
                    }

                    var userName = $rootScope.userObj.fName + " " + $rootScope.userObj.lName;
                    if (fromVal == null) {
                        fromVal = "none";
                    }
                    if (prameter == 'assign_to') {
                        logText = "  " + userName + " has changed " + activityLogtitle + "  from  " + fromValText + " to " + toValText + " on " + $scope.FromDate;
                    } else {
                        logText = "  " + userName + " has changed " + activityLogtitle + "  from  " + fromVal + " to " + toVal + " on " + $scope.FromDate;
                    }
                    var values = {
                        parameter: prameter,
                        fromVal: fromVal,
                        toVal: toVal,
                        activityLog: logText,
                        ticketID: $scope.data.ticketID,
                        master_st: $scope.data.master_st,
                        changed_status_time:Date.now()
                    }
                    var url = "/api/ticketsRelated/ticket-details-update";
                    httpService.callRestApi(values, url, "POST")
                            .then(function (response) {
                                if (response) {
                                    console.log(response);
                                    $scope.data[prameter] = toVal;
                                    $scope.data.activityLogs.push(logText);
                                    if (prameter === 'status') {
                                        if (!(fromVal == 'Pending for Approval' && toVal == 'Working with Vendor') || !(toVal == 'Pending for Approval' && fromVal == 'Working with Vendor')) {
                                            TrackTimeAutomate(toVal);
                                        } else {
                                            console.log('requested for timer change', toVal, fromVal);
                                        }
                                    }

                                }
                            }, function (reason) {
                                console.log(reason);
                                $scope.errorMsg = reason;
                                console.log($scope.errorMsg, "error message");
                            });
                }
                $scope.issueTypeCat2 = {
                    'request': {
                        'hardware': {
                            'Desktop': 'Desktop',
                            'Laptop': 'Laptop',
                            'Server': 'Server',
                            'RAM': 'RAM',
                            'HDD': 'HDD',
                            'KB': 'KB',
                            'SMPS': 'SMPS',
                            'VOIP Device': 'VOIP Device',
                            'Monitor': 'Monitor',
                            'Internet Dongle': 'Internet Dongle',
                            'Printer': 'Printer',
                            'Mouse': 'Mouse',
                            'Others': 'Others'
                        },
                        'software': {
                            'OS Windows': {
                                'Windows Desktop': 'Windows Desktop',
                                'Windows Server': 'Windows Server'
                            },
                            'OS Linux': {
                                'Linux Server': 'Linux Server',
                                'Linux Desktop': 'Linux Desktop'

                            },
                            'MS Office': 'MS Office',
                            'VPN Client': 'VPN Client',
                            'Adobe': {
                                'Adobe Pro': 'Adobe Pro',
                                'Adobe Reader': 'Adobe Reader',
                                'Adobe Suite': 'Adobe Suite'
                            },
                            'Virtual Machine': 'Virtual Machine',
                            'Messenger': 'Messenger',
                            'Others': 'Others'


                        },
                        'Backup & Restore': {
                            'Data Backup': {
                                'Email DATA': 'Email DATA',
                                'Server DATA': 'Server DATA',
                                'User DATA': 'User DATA'

                            },
                            'Restore': {
                                'Email DATA': 'Email DATA',
                                'Server DATA': 'Server DATA',
                                'User DATA': 'User DATA'

                            },
                            'Others': 'Others'

                        },
                        'Network': {
                            'Network Security': {
                                'Allow access': 'Allow access',
                                'Deny Access': 'Deny Access'

                            },
                            'Network Connectivity': {
                                'IP Address': 'IP Address',
                                'Patch Cable': 'Patch Cable',
                                'Port': 'Port',
                                'Wi-Fi': 'Wi-Fi'
                            },
                            'Access': 'Access',
                            'Others': 'Others'
                        },
                        'VOIP': {
                            'Extension': 'Extension',
                            'VOIP Device': 'VOIP Device',
                            'User Credentials': 'User Credentials',
                            'Others': 'Others'
                        },
                        'User Credentials': {
                            'System Credentials': 'System Credentials',
                            'Email': 'Email',
                            'Internal IM': 'Internal IM',
                            'VPN Credential': 'VPN Credential',
                            'Others': 'Others'
                        }
                    },
                    'issue': {
                        'hardware': {
                            'Desktop': 'Desktop',
                            'Laptop': 'Laptop',
                            'Server': 'Server',
                            'RAM': 'RAM',
                            'HDD': 'HDD',
                            'KB': 'KB',
                            'SMPS': 'SMPS',
                            'VOIP Device': 'VOIP Device',
                            'Monitor': 'Monitor',
                            'Internet Dongle': 'Internet Dongle',
                            'Printer': 'Printer',
                            'Mouse': 'Mouse',
                            'Others': 'Others'
                        },
                        'software': {
                            'OS Windows': {
                                'Windows Desktop': 'Windows Desktop',
                                'Windows Server': 'Windows Server'
                            },
                            'OS Linux': {
                                'Linux Server': 'Linux Server',
                                'Linux Desktop': 'Linux Desktop'

                            },
                            'MS Office': 'MS Office',
                            'VPN Client': 'VPN Client',
                            'Adobe': {
                                'Adobe Pro': 'Adobe Pro',
                                'Adobe Reader': 'Adobe Reader',
                                'Adobe Suite': 'Adobe Suite'
                            },
                            'Virtual Machine': 'Virtual Machine',
                            'Messenger': 'Messenger',
                            'Others': 'Others'


                        },
                        'Backup & Restore': {
                            'Data Backup': {
                                'Email DATA': 'Email DATA',
                                'Server DATA': 'Server DATA',
                                'User DATA': 'User DATA'

                            },
                            'Restore': {
                                'Email DATA': 'Email DATA',
                                'Server DATA': 'Server DATA',
                                'User DATA': 'User DATA'

                            },
                            'Others': 'Others'

                        },
                        'Network': {
                            'Network Security': {
                                'Allow access': 'Allow access',
                                'Deny Access': 'Deny Access'

                            },
                            'Network Connectivity': {
                                'IP Address': 'IP Address',
                                'Patch Cable': 'Patch Cable',
                                'Port': 'Port',
                                'Wi-Fi': 'Wi-Fi'
                            },
                            'Access': 'Access',
                            'Others': 'Others'
                        },
                        'VOIP': {
                            'Extension': 'Extension',
                            'VOIP Device': 'VOIP Device',
                            'User Credentials': 'User Credentials',
                            'Others': 'Others'
                        },
                        'User Credentials': {
                            'System Credentials': 'System Credentials',
                            'Email': 'Email',
                            'Internal IM': 'Internal IM',
                            'VPN Credential': 'VPN Credential',
                            'Others': 'Others'
                        }
                    }
                }
                $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [[0, 'desc']]);
                $scope.open = function (description) {
                    $scope.descrip = description;
                    var modalInstance = $modal.open({
                        templateUrl: 'modal.html',
                        resolve: {
                            descrip: function () {
                                return $scope.descrip;
                            }
                        },
                        controller: function ($scope, descrip) {
                            $scope.descrip = descrip;
                            $scope.close = function () {
                                modalInstance.close();
                            };
                        }
                    });
                    modalInstance.result.then(function (descrip) {
                        $scope.selected = descrip;
                    });
                }

                $scope.$on('NewTicket', function (event, ticket) {
                    console.log('realtime message', ticket);
                    $scope.ticketsList.push(ticket);
                });
            }])
        .filter('renderHtml', ['$sce', function ($sce) {
                return function (text) {
                    return $sce.trustAsHtml(text);
                };
            }])
        .directive('bootstrapSwitch', [
            function () {
                return {
                    restrict: 'A',
                    require: '?ngModel',
                    link: function (scope, element, attrs, ngModel) {
                        element.bootstrapSwitch();
                        element.on('switchChange.bootstrapSwitch', function (event, state) {
                            if (ngModel) {
                                scope.$apply(function () {
                                    ngModel.$setViewValue(state);
                                });
                            }
                        });
                        scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                            if (newValue) {
                                element.bootstrapSwitch('state', true, true);
                            } else {
                                element.bootstrapSwitch('state', false, true);
                            }
                        });
                    }
                };
            }
        ])
        .directive('ngHtml', ['$compile', function ($compile) {
                return function (scope, elem, attrs) {
                    if (attrs.ngHtml) {
                        elem.html(scope.$eval(attrs.ngHtml));
                        $compile(elem.contents())(scope);
                    }
                    scope.$watch(attrs.ngHtml, function (newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            elem.html(newValue);
                            $compile(elem.contents())(scope);
                        }
                    });
                };
            }]);