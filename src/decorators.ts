import * as request from 'request';
import * as https from 'https';
import * as URL from 'url';
import * as angular from 'angular';
import * as _ from 'lodash';

(function(angular: ng.IAngularStatic, baseModule: any) {
    baseModule = baseModule.bind(angular);
    angular.module = function(name, requires, config): ng.IModule {
        let modInstance = baseModule(name, requires, config);
        if (!modInstance.componentClass) {
            modInstance.componentClass = function(factory: ng.ComponentConstructor) {
                let controller: any = factory;
                if (factory.$inject && factory.$inject.length > 0) {
                    controller = factory.$inject.slice();
                    controller.push(factory);
                }
                this.component(factory.$name, {
                    templateUrl: factory.$templateUrl,
                    template: factory.$template,
                    bindings: factory.$bindings,
                    transclude: factory.$transclude,
                    controller: controller
                });
                return this;
            };
        }
        return modInstance;
    };
})(angular, angular.module);

export function acceptSelfSignedHttpsCalls($delegate: ng.IHttpBackendService) {

    function $unsecuredHttps(method: string, url: string, post?:any, callback?:ng.HttpResponseCallback):void {

        let uri = URL.parse(url, false, true);
        let agentOptions = {
            host: uri.host,
            port: uri.port || 443,
            path: '/' + uri.path,
            rejectUnauthorized: false
        };

        let agent = new https.Agent(agentOptions);

        request({
            url: url,
            method: method,
            agent: agent,
            body: post
        }, function(error, response, body) {
            if (!error && response) {
                callback(response.statusCode, body, response.headers, response.statusMessage);
            } else {
                callback(0, null, null, error.toString());
            }
        });
    }

    let decorator: ng.IHttpBackendService = function(
        method: string,
        url: string,
        post?: any,
        callback?: ng.HttpResponseCallback,
        headers?: any,
        timeout?: number,
        withCredentials?: boolean): void {

        if (_.startsWith(url, 'https://')) {
            $unsecuredHttps(method, url, post, callback);
        } else {
            $delegate(method, url, post, callback, headers, timeout, withCredentials);
        }
    }

    return decorator;
}