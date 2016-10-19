import * as request from 'request';
import * as https from 'https';
import * as URL from 'url';
import * as angular from 'angular';
import * as _ from 'lodash';

declare module 'angular' {

    type HttpResponseCallback = (status:number, response:any, headersString:string, statusText:string) => void;

    interface ComponentConstructor {
        new (...args: any[]): angular.IComponentController;
        $inject?: string[];
        $name: string;
        $bindings?: any;
        $templateUrl?: string;
        $template?: string;
        $transclude?: boolean;
    }

    interface IModule {
        componentClass(factory: ComponentConstructor): angular.IModule;
    }
}

(function(angular: angular.IAngularStatic, baseModule: any) {
    baseModule = baseModule.bind(angular);
    angular.module = function(name, requires, config): angular.IModule {
        let modInstance = baseModule(name, requires, config);
        if (!modInstance.componentClass) {
            modInstance.componentClass = function(factory: angular.ComponentConstructor) {
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

export function acceptSelfSignedHttpsCalls($delegate: angular.IHttpBackendService) {

    function $unsecuredHttps(method: string, url: string, post?:any, callback?:angular.HttpResponseCallback):void {

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

    let decorator: angular.IHttpBackendService = function(
        method: string,
        url: string,
        post?: any,
        callback?: angular.HttpResponseCallback,
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