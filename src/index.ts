import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import 'chart.js';
import 'angular-chart.js';
import * as Components from './components';

var app = angular.module('minerDashboard', ['chart.js']);

app.componentClass(Components.MinerStatusComponent);
app.componentClass(Components.DashboardComponent);
app.service('minerQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerQuery($http)]);
app.service('minerFileQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerFileQuery($http)]);