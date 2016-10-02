import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import 'chart.js';
import 'angular-chart.js';
import * as Components from './components';

(function(angular: ng.IAngularStatic, baseModule: any) {
    baseModule = baseModule.bind(angular);
    angular.module = function(name, requires, config): ng.IModule {
        let module = baseModule(name, requires, config);
        module.componentClass = function(factory: ng.ComponentConstructor) {
            var controller: any = factory;
            if (factory.$inject && factory.$inject.length > 0) {
                controller = factory.$inject.slice();
                controller.push(factory);
            }
            app.component(factory.$name, {
                templateUrl: factory.$templateUrl,
                template: factory.$template,
                bindings: factory.$bindings,
                controller: controller,
                transclude: factory.$transclude
            });
            return app;
        }
        return module;
    };
})(angular, angular.module);

var app = angular.module('minerDashboard', ['chart.js']);

app.componentClass(Components.MinerStatusComponent);
app.componentClass(Components.DashboardComponent);
app.service('minerQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerQuery($http)]);
app.service('minerFileQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerFileQuery($http)]);