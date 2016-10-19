import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import * as Components from './components';
import * as Queries from './queries';
import * as Decorators from './decorators';
import 'chart.js';
import 'angular-chart.js';

var app = angular.module('minerDashboard', ['chart.js']);

app.componentClass(Components.MinerStatusComponent);
app.componentClass(Components.DashboardComponent);
app.service('minerQuery', ['$http', '$q', ($http: angular.IHttpService, $q: angular.IQService) => new Queries.MinerQuery($http, $q)]);
app.service('minerFileQuery', ['$http', ($http: angular.IHttpService) => new Queries.MinerFileQuery($http)]);
app.decorator('$httpBackend', ['$delegate', Decorators.acceptSelfSignedHttpsCalls]);