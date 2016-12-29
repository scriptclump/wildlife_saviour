/**
 * Created by CGI on 07/12/2016.
 */

angular.module('helpDesk').factory('httpService', function ($http, $q) {
    return {
        callRestApi: function (payload, url, method) {
            var dfd = $q.defer();
            var data,params;
            if(method=='GET'){
                params=payload;
                data='';
            }else if(method=='POST'){
                data=payload;
                params='';
            }
            $http({
                method: method,
                url: url,
                data: data,
                params: params
            }).success(function (data, status, headers, config) {
                var response = {};
                response.data = data;
                response.status = status;
                dfd.resolve(response);
            }).error(function (data, status, headers, config) {
                dfd.reject(data);
            });
            return dfd.promise;
        }
    }
});
