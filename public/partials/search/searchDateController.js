/**
 * Created by CGI on 07/12/2016.
 */

angular.module('helpDesk')
       
    .controller('searchDateCtrl',['$scope', '$window', '$filter', 'httpService',  function($scope, $window, $filter,httpService) {
        $scope.data = {};

                  // Datepicker functionality @ 07-10-2016 
                        $scope.beginDate = new Date();
                        $scope.beginDatePickerOpen = false;
                        $scope.endDate = new Date();
                        $scope.endDatePickerOpen = false;

                        $scope.openFromDatePicker = function ($event) {
                              $event.preventDefault();
                              $event.stopPropagation();
                              $scope.beginDatePickerOpen = !$scope.beginDatePickerOpen;
                        };

                        $scope.openToDatePicker = function ($event) {
                              $event.preventDefault();
                              $event.stopPropagation();
                              $scope.endDatePickerOpen = !$scope.endDatePickerOpen;
                        };
                  // EOF Datepicker functionality @ 07-10-2016 

        $scope.searchByDate = function(dateObj){
        	$("#danger-alert").hide();
        	$("#no-records").hide();
          // changing date format
          dateObj.toDate    =   $filter('date')(dateObj.toDate, "MM/dd/yyyy");
          dateObj.fromDate  =   $filter('date')(dateObj.fromDate, "MM/dd/yyyy");
          
          if(dateObj.fromDate>dateObj.toDate){
        	  $scope.errorMsg="To Date should be greater than From Date";
        	  $("#danger-alert").show();
        	  $scope.dateRangeResult = false;
        	  $scope.data=null;
        	  return false;
          }else{
        	  $("#danger-alert").hide();
          }
          
          	$scope.dateRangeResult = true;
            var url = "/api/search/search-range";
            
            httpService.callRestApi(dateObj, url, "POST")
                .then(function(response){
                      
                      if(response.data.length == 0){

                         $("#no-records").show();
                      }else{
                    	  $("#no-records").hide();
                      }

                    if(response.data.length > 0) {
                        $scope.data  = response.data;

                        
                    }else{
                        $scope.data = null;
                    }
                } ,
                function(reason){
                    alert("Internal Server Error");

                });
        }

          // For Date Format
        //$scope.format  = 'MM/dd/yyyy';

        $scope.exportData=function(){
        	 var tableId='searchData2';
        	 var uri = 'data:application/vnd.ms-excel;base64,'
                 , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
                 , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
                 , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }

                 var table = document.getElementById(tableId);
                 //console.log(table);
                 var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML};
                 var url = uri + base64(format(template, ctx));
                 
                 
        	var filename = "Tickets_List.xls";
        	var element = angular.element('<a/>');    
        	element.attr({
        	   href: url,
        	   target: '_blank',
        	   download: filename
        	});
        	if (document.createEvent) {
        	var ev = document.createEvent("MouseEvent");
        	  ev.initMouseEvent(
        	    "click",
        	    true /* bubble */, true /* cancelable */,
        	    window, null,
        	    0, 0, 0, 0, /* coordinates */
        	    false, false, false, false, /* modifier keys */
        	    0 /*left*/, null
        	  );
        	  element[0].dispatchEvent(ev);
        	}
        	else {
        	  element[0].fireEvent("onclick");
        	}
        }
       
    }])
    ;

