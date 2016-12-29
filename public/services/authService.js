/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
angular.module('helpDesk')
        .provider('AclService', [
            function () {
                /**
                 * Polyfill for IE8
                 *
                 * http://stackoverflow.com/a/1181586
                 */
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (needle) {
                        var l = this.length;
                        for (; l--; ) {
                            if (this[l] === needle) {
                                return l;
                            }
                        }
                        return -1;
                    };
                }

                var config = {
                    storage: 'localStorage',
                    storageKey: 'AclService'
                };

                var data = {
                    roles: [],
                    abilities: {}
                };

                /**
                 * Does the given role have abilities granted to it?
                 *
                 * @param role
                 * @returns {boolean}
                 */
                var roleHasAbilities = function (role) {
                    return (typeof data.abilities[role] === 'object');
                };

                /**
                 * Retrieve the abilities array for the given role
                 *
                 * @param role
                 * @returns {Array}
                 */
                var getRoleAbilities = function (role) {
                    return (roleHasAbilities(role)) ? data.abilities[role] : [];
                };

                /**
                 * Persist data to storage based on config
                 */
                var save = function () {
                    switch (config.storage) {
                        case 'sessionStorage':
                            saveToStorage('sessionStorage');
                            break;
                        case 'localStorage':
                            saveToStorage('localStorage');
                            break;
                        default:
                            // Don't save
                            return;
                    }
                };

                /**
                 * Persist data to web storage
                 */
                var saveToStorage = function (storagetype) {
                    window[storagetype].setItem(config.storageKey, JSON.stringify(data));
                };

                /**
                 * Retrieve data from web storage
                 */
                var fetchFromStorage = function (storagetype) {
                    var data = window[storagetype].getItem(config.storageKey);
                    return (data) ? JSON.parse(data) : false;
                };

                var AclService = {};
                AclService.resume = resume;


                /**
                 * Restore data from web storage.
                 *
                 * Returns true if web storage exists and false if it doesn't.
                 *
                 * @returns {boolean}
                 */
                function resume() {
                    var storedData;

                    switch (config.storage) {
                        case 'sessionStorage':
                            storedData = fetchFromStorage('sessionStorage');
                            break;
                        case 'localStorage':
                            storedData = fetchFromStorage('localStorage');
                            break;
                        default:
                            storedData = null;
                    }
                    if (storedData) {
                        angular.extend(data, storedData);
                        return true;
                    }

                    return false;
                }

                /**
                 * Attach a role to the current user
                 *
                 * @param role
                 */
                AclService.attachRole = function (role) {
                    if (data.roles.indexOf(role) === -1) {
                        data.roles.push(role);
                        save();
                    }
                };

                /**
                 * Remove role from current user
                 *
                 * @param role
                 */
                AclService.detachRole = function (role) {
                    var i = data.roles.indexOf(role);
                    if (i > -1) {
                        data.roles.splice(i, 1);
                        save();
                    }
                };

                /**
                 * Remove all roles from current user
                 */
                AclService.flushRoles = function () {
                    data.roles = [];
                    save();
                };

                /**
                 * Check if the current user has role(s) attached
                 *
                 * @param role
                 * @returns {boolean}
                 */
                AclService.hasRole = function (role) {
                    var roles = angular.isArray(role) ? role : [role];
                    for (var l = roles.length; l--; ) {
                        if (data.roles.indexOf(roles[l]) === -1) {
                            return false;
                        }
                    }
                    return !!roles.length;
                };

                /**
                 * Check if the current user any of the given roles
                 *
                 * @param roles
                 * @returns {boolean}
                 */
                AclService.hasAnyRole = function (roles) {
                    for (var l = roles.length; l--; ) {
                        if (AclService.hasRole(roles[l])) {
                            return true;
                        }
                    }
                    return false;
                };

                /**
                 * Returns the current user roles
                 * @returns {Array}
                 */
                AclService.getRoles = function () {
                    return data.roles;
                };

                /**
                 * Set the abilities object (overwriting previous abilities)
                 *
                 * Each property on the abilities object should be a role.
                 * Each role should have a value of an array. The array should contain
                 * a list of all of the roles abilities.
                 *
                 * Example:
                 *
                 *    {
                 *        guest: ['login'],
                 *        user: ['logout', 'view_content'],
                 *        admin: ['logout', 'view_content', 'manage_users']
                 *    }
                 *
                 * @param abilities
                 */
                AclService.setAbilities = function (abilities) {
                    data.abilities = abilities;
                    save();
//                    console.log('set abilities in provider',abilities);
//                    console.log('abilities saved',data.abilities);
                };

                /**
                 * Add an ability to a role
                 *
                 * @param role
                 * @param ability
                 */
                AclService.addAbility = function (role, ability) {
                    if (!data.abilities[role]) {
                        data.abilities[role] = [];
                    }
                    data.abilities[role].push(ability);
                    save();
                };

                /**
                 * Does current user have permission to do something?
                 *
                 * @param ability
                 * @returns {boolean}
                 */
                AclService.can = function (ability) {
                    var role, abilities;
                    // Loop through roles
                    var l = data.roles.length;
                    for (; l--; ) {
                        // Grab the the current role
                        role = data.roles[l];
                        abilities = getRoleAbilities(role);
                        if (abilities.indexOf(ability) > -1) {
                            // Ability is in role abilities
                            return true;
                        }
                    }
                    // We made it here, so the ability wasn't found in attached roles
                    return false;
                };

                /**
                 * Does current user have any of the required permission to do something?
                 *
                 * @param abilities [array]
                 * @returns {boolean}
                 */
                AclService.canAny = function (abilities) {
                    var role, roleAbilities;
                    // Loop through roles
                    var l = data.roles.length;
                    var j = abilities.length;

                    for (; l--; ) {
                        // Grab the the current role
                        role = data.roles[l];
                        roleAbilities = getRoleAbilities(role);

                        for (; j--; ) {
                            if (roleAbilities.indexOf(abilities[j]) > -1) {
                                // Ability is in role abilities
                                return true;
                            }
                        }
                    }
                    // We made it here, so the ability wasn't found in attached roles
                    return false;
                };

                return {
                    config: function (userConfig) {
                        angular.extend(config, userConfig);
                    },
                    resume: resume,
                    $get: function () {
                        return AclService;
                    }
                };

            }
        ])

        .service('AuthService', function ($q, $http, API_ENDPOINT, $rootScope, AclService) {
            var LOCAL_TOKEN_KEY = 'LOGINCREDENTIALS';
            var isAuthenticated = false;
            var authToken;
            var fromState;
            var toParams;
            var userObj = {};
            function loadUserCredentials() {
                //console.log('load credentials function called');
                var storedVal = window.localStorage.getItem(LOCAL_TOKEN_KEY);
                if (storedVal) {
                    userObj = JSON.parse(storedVal);
                    //console.log(userObj);
                    if (userObj && userObj.token) {
                        //console.log('entered if condition', userObj);
                        var aclData = {
                           user:userObj.privileges
                        } 
                        useCredentials(userObj);
                        //console.log(userObj);
                        AclService.setAbilities(aclData);
                        AclService.attachRole('user');
                    }
                }

            }

            function storeUserCredentials(user) {
                //console.log('user details stored',user);
                var userStrg = JSON.stringify(user);
                window.localStorage.setItem(LOCAL_TOKEN_KEY, userStrg);
                useCredentials(user);
            }

            function useCredentials(user) {
                isAuthenticated = true;
                authToken = user.token;
                $rootScope.userObj = user.user;
                $rootScope.userPrivileges = user.privileges;
                //console.log('user privileges :: ',$rootScope.userPrivileges);
                // Set the token as header for your requests!
                $http.defaults.headers.common.Authorization = authToken;
            }

            function destroyUserCredentials() {
                authToken = undefined;
                isAuthenticated = false;
                $http.defaults.headers.common.Authorization = undefined;
                window.localStorage.removeItem(LOCAL_TOKEN_KEY);
                AclService.flushRoles();
                //console.log('destroyed session now check for connection');
            }

            var register = function (user) {
                return $q(function (resolve, reject) {
                    $http.post('/api/signup', user).then(function (result) {
                        if (result.data.success) {
                            resolve(result.data.msg);
                        } else {
                            reject(result.data.msg);
                        }
                    });
                });
            };

            var login = function (user) {
                //console.log(user);
                var dfd = $q.defer();
                //console.log('login service called');
                //$http.post(API_ENDPOINT.url + '/user/authenticate', user).then(function (result) {
                $http.post('/api/user/authenticate', user).then(function (result) {
                    console.log(result);
                    if (result.data.success) {
                        //console.log(result.data);
                        storeUserCredentials(result.data);
                        //console.log(result.data.privileges);
                        var aclData = {
                            user:result.data.privileges
                        }   
                        //console.log(result.data.privileges);
                        
                        AclService.setAbilities(aclData);
                        AclService.attachRole('user');
                        dfd.resolve(result.data.msg);
                    } else {
                        //console.log(result.data.msg);
                        dfd.reject(result.data.msg);
                    }
                });
                //console.log(dfd.promise);
                return dfd.promise;
            };
            var resetPwd = function (email) {
                var dfd = $q.defer();
                $http.post('/api/user/reset-password', email).then(function (result) {
                    console.log(result.data);
                    if (result.data.success) {
                        //storeUserCredentials(result.data);
                        dfd.resolve(result.data.msg);
                    } else {
                        //console.log(result.data.msg);
                        dfd.reject(result.data.reason);
                    }
                });
                return dfd.promise;
            };
            var logout = function () {
                destroyUserCredentials();
            };

            loadUserCredentials();

            return {
                login: login,
                register: register,
                logout: logout,
                resetPwd: resetPwd,
                isAuthenticated: function () {
                    return isAuthenticated;
                },
            };
        })

        .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
            return {
                responseError: function (response) {
                    $rootScope.$broadcast({
                        401: AUTH_EVENTS.notAuthenticated,
                    }[response.status], response);
                    return $q.reject(response);
                }
            };
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        })
        