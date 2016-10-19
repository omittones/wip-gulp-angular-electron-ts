import * as _ from 'lodash';
import * as moment from 'moment';
import * as ng from 'angular';

export default class DashboardComponent implements ng.IComponentController {
    public static $inject = ['minerQuery', 'minerFileQuery', '$interval'];
    public static $name = 'dashboard';
    public static $templateUrl = 'dashboard.html';

    public model: Core.IMiner[];

    private intervals: ng.IPromise<any>[];

    constructor(
        private miners: Core.ISimpleQuery<Core.IMiner>,
        private minerFile: Core.IQuery<any, Core.MinerFileRequest>,
        private $interval: ng.IIntervalService) {

        this.intervals = [];

        this.loadMiners();
    }

    private loadMiners() {

        var self = this;
        this.miners.get().then(function(response) {

            _.each(self.intervals, (p: ng.IPromise<any>) => {
                self.$interval.cancel(p);
            });
            self.intervals.length = 0;

            self.model = response;
            _.each(self.model, function(miner: Core.IMiner) {
                if (miner.status === 'active') {
                    var bound = self.loadMiner.bind(self, miner);
                    self.intervals.push(self.$interval(bound, 5000));
                    bound();
                }
            });
        });
    }

    private loadMiner(miner: Core.IMiner) {
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

        this.loadMinerFile(miner, 'history.json', function(body: any) {
            miner.history = (body ? _.sortBy(body, ['timestamp']) : []) as Core.IWalletInfo[];
            toggleFlagIfDone();
        });

        this.loadMinerFile(miner, 'info.json', function(body: any) {
            miner.info = body;
            toggleFlagIfDone();
        });

        this.loadMinerFile(miner, 'walletinfo.json', function(body: any) {
            miner.walletinfo = body;
            toggleFlagIfDone();
        });

        this.loadMinerFile(miner, 'ps.log', function(body: any) {
            miner.ps = body;
            toggleFlagIfDone();
        });

        this.loadMinerFile(miner, 'last.log', function(body: any) {
            miner.last = body;
            toggleFlagIfDone();
        });
    }

    private loadMinerFile(miner: Core.IMiner, path: string, callback: (body: any) => void) {
        this.minerFile.get({
            ip: miner.ip,
            id: miner.id,
            path: path
        }).then(callback);
    }

    private getError(response: any) {
        if (response.statusCode <= 0)
            return "ERROR: Cannot connect to miner!";
        else
            return "ERROR: " + response.statusText;
    }
}