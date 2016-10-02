import * as moment from 'moment';

export default class DashboardComponent implements ng.IComponentController {
    static $inject = ['minerQuery', 'minerFileQuery', '$interval'];
    static $name = 'dashboard';
    static $templateUrl = 'dashboard.html';

    public model: Core.IMiner[];

    private intervals: ng.IPromise<any>[];

    constructor(
        private miners: Core.ISimpleQuery<Core.IMiner>,
        private minerFile: Core.IQuery<any, Core.MinerFileRequest>,
        private $interval: angular.IIntervalService) {

        var intervals: angular.IPromise<any>[] = [];

        this.loadMiners();
    }

    private loadMiners() {
        this.miners.get().then(function(response: any) {

            _.each(this.intervals, (p: angular.IPromise<any>) => {
                this.$interval.cancel(p);
            });
            this.intervals.length = 0;

            this.model = response.data;
            _.each(this.model, function(miner: Core.IMiner) {
                if (miner.status === 'active') {
                    var bound = this.loadMiner.bind(this, miner);
                    this.intervals.push(this.$interval(bound, 5000));
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
            this.minerFile.get({
                id: miner.id,
                path: path
            }).then(callback);
        }
    }

    private getError(response: any) {
        if (response.statusCode <= 0)
            return "ERROR: Cannot connect to miner!";
        else
            return "ERROR: " + response.statusText;
    }
}