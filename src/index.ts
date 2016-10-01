import * as moment from 'moment'
import * as _ from 'lodash'
import * as angular from 'angular';
import 'chart.js';
import 'angular-chart.js';

var app = angular.module('minerDashboard', ['chart.js']);

var logVisible: any = {};

function ago(milis: number): string {
    var now = moment('now').milliseconds();
    var dur = moment.duration(now - milis);
    return dur.humanize() + ' ago';
}

interface IWalletInfo {
    timestamp: number;
    balance: number;
    immature_balance: number;
    unconfirmed_balance: number;
}

interface IMiner {
    id: string;
    status: string;
    chart?: any;
    history?: IWalletInfo[];
    loading?: boolean;
    last?: string;
    ps?: string;
    walletinfo?: IWalletInfo;
    info?: any;
}

function rebuildChart(miner: IMiner) {
    miner.chart = miner.chart || {};
    if (miner.history) {
        miner.chart.labels = _.map(miner.history, (h:IWalletInfo) => ago(h.timestamp));
        miner.chart.series = ['balance', 'immature_balance', 'unconfirmed_balance'];
        miner.chart.data = [
            _.map(miner.history, h => h.balance),
            _.map(miner.history, h => h.immature_balance),
            _.map(miner.history, h => h.unconfirmed_balance)
        ];
        miner.chart.datasetOverride = [{
            yAxisID: 'y-axis-1'
        }, {
                yAxisID: 'y-axis-2'
            }];
        miner.chart.options = {
            animation: {
                duration: 0
            },
            scales: {
                yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                }, {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }]
            }
        };
    }
}

app.component('minerStatus', {
    templateUrl: 'miner-status.html',
    bindings: {
        miner: '<'
    },
    controller: function() {

        this.lastTimestamp = function() {
            if (this.miner.history) {
                var times = _.map(this.miner.history, (m:IWalletInfo) => {
                    return m.timestamp || 0;
                });
                var timestamp = _.max(times);
                if (_.isNumber(timestamp))
                    return ago(timestamp);
            }
            return 'pending';
        }

        this.isLogVisible = function() {
            return logVisible[this.miner.id];
        }

        this.toggleLogs = function() {
            logVisible[this.miner.id] = !logVisible[this.miner.id];
        }
    }
});

app.component('dashboard', {
    templateUrl: 'dashboard.html',
    controller: ['$http', '$interval', function($http: angular.IHttpService, $interval: angular.IIntervalService) {

        var intervals: angular.IPromise<any>[] = [];

        var self = this;

        function loadMiners() {
            $http.get('miner').then(function(response: any) {

                _.each(intervals, (p: angular.IPromise<any>) => {
                    $interval.cancel(p);
                });
                intervals.length = 0;

                self.miners = response.data;
                _.each(self.miners, function(miner: IMiner) {
                    if (miner.status === 'active') {
                        var bound = loadMiner.bind(null, miner);
                        intervals.push($interval(bound, 5000));
                        bound();
                    }
                });
            });
        }

        function loadMiner(miner: IMiner) {
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
                miner.history = (body ? _.sortBy(body, ['timestamp']) : []) as IWalletInfo[];
                var ago24h = moment('now').milliseconds() - (24 * 60 * 60 * 1000);
                miner.history = _.filter(miner.history, (i: IWalletInfo) => i.timestamp > ago24h);
                rebuildChart(miner);
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
        }

        function loadMinerFile(miner: IMiner, path: string, callback: (body: any) => void) {
            var url = 'miner/' + miner.id + '/' + path;
            console.log('loading from ' + url);
            $http.get(url).then(function(response: any) {
                console.log(url + ' loaded ok');
                callback(response.data);
            }, function(response: any) {
                console.log(url + ' error loading');
                callback(null);
            });
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