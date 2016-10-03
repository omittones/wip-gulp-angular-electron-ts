import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import 'chart.js';
import 'angular-chart.js';
import * as Components from './components';
import * as Queries from './queries';

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

var app = angular.module('minerDashboard', ['chart.js']);

app.componentClass(Components.MinerStatusComponent);
app.componentClass(Components.DashboardComponent);
app.service('minerQuery', ['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => new Queries.MinerQuery($http, $q)]);
app.service('minerFileQuery', ['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => new Queries.MinerFileQuery($http, $q)]);