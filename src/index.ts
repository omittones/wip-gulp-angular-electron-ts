import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import 'chart.js';
import 'angular-chart.js';
import * as Components from './components';

var app = angular.module('minerDashboard', ['chart.js']);

function registerComponentClass(app: ng.IModule, klass: any) {
    app.component(klass.$name, {
        templateUrl: klass.$templateUrl,
        bindings: klass.$bindings,
        controller: klass
    });
}

registerComponentClass(app, Components.MinerStatusComponent);

app.service('minerQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerQuery($http)]);
app.service('minerFileQuery', ['$http', ($http: ng.IHttpService) => new Core.MinerFileQuery($http)]);

app.component('dashboard', {
    templateUrl: 'dashboard.html',
    controller: ['minerQuery', 'minerFileQuery', '$interval', function(
        miners: Core.ISimpleQuery<Core.IMiner>,
        minerFile: Core.IQuery<any, Core.MinerFileRequest>,
        $interval: angular.IIntervalService) {

        var intervals: angular.IPromise<any>[] = [];
        var self = this;
        function loadMiners() {
            miners.get().then(function(response: any) {

                _.each(intervals, (p: angular.IPromise<any>) => {
                    $interval.cancel(p);
                });
                intervals.length = 0;

                self.miners = response.data;
                _.each(self.miners, function(miner: Core.IMiner) {
                    if (miner.status === 'active') {
                        var bound = loadMiner.bind(null, miner);
                        intervals.push($interval(bound, 5000));
                        bound();
                    }
                });
            });
        }

        function loadMiner(miner: Core.IMiner) {
            if (miner.loading)
                return;

            miner.loading = true;

            var i = 5;
            function toggleFlagIfDone() {
                i--;
                if (i === 0) {
                    miner.loading = false;
                }
            }

            loadMinerFile(miner, 'history.json', function(body: any) {
                miner.history = (body ? _.sortBy(body, ['timestamp']) : []) as Core.IWalletInfo[];
                var ago24h = moment('now').milliseconds() - (24 * 60 * 60 * 1000);
                miner.history = _.filter(miner.history, (i: Core.IWalletInfo) => i.timestamp > ago24h);
                toggleFlagIfDone();
            });

            loadMinerFile(miner, 'info.json', function(body: any) {
                miner.info = body;
                toggleFlagIfDone();
            });

            loadMinerFile(miner, 'walletinfo.json', function(body: any) {
                miner.walletinfo = body;
                toggleFlagIfDone();
            });

            loadMinerFile(miner, 'ps.log', function(body: any) {
                miner.ps = body;
                toggleFlagIfDone();
            });

            loadMinerFile(miner, 'last.log', function(body: any) {
                miner.last = body;
                toggleFlagIfDone();
            });

            function loadMinerFile(miner: Core.IMiner, path: string, callback: (body: any) => void) {
                minerFile.get({
                    id: miner.id,
                    path: path
                }).then(callback);
            }
        }

        function getError(response: any) {
            if (response.statusCode <= 0)
                return "ERROR: Cannot connect to miner!";
            else
                return "ERROR: " + response.statusText;
        }

        loadMiners();
    }]
});