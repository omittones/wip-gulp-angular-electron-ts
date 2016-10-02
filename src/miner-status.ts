import * as moment from 'moment';

function ago(milis: number): string {
    var now = moment('now').milliseconds();
    var dur = moment.duration(now - milis);
    return dur.humanize() + ' ago';
}

export default class MinerStatusComponent implements ng.IComponentController {
    private static logVisible: any = {};
    static $name = 'minerStatus';
    static $templateUrl = 'miner-status.html';
    static $bindings = {
        miner: '<'
    };

    public miner: Core.IMiner;

    constructor() {
    }

    public lastTimestamp(): string {

        var temp = MinerStatusComponent.$inject;

        if (this.miner.history) {
            var times = _.map(this.miner.history, (m: Core.IWalletInfo) => {
                return m.timestamp || 0;
            });
            var timestamp = _.max(times);
            if (_.isNumber(timestamp))
                return ago(timestamp);
        }
        return 'pending';
    }

    public isLogVisible() {
        return MinerStatusComponent.logVisible[this.miner.id];
    }

    public toggleLogs() {
        MinerStatusComponent.logVisible[this.miner.id] = !MinerStatusComponent.logVisible[this.miner.id];
    }

    public chart(): any {
        if (this.miner && this.miner.history) {
            return {
                labels: _.map(this.miner.history, (h: Core.IWalletInfo) => ago(h.timestamp)),
                series: ['balance', 'immature_balance', 'unconfirmed_balance'],
                data: [
                    _.map(this.miner.history, h => h.balance),
                    _.map(this.miner.history, h => h.immature_balance),
                    _.map(this.miner.history, h => h.unconfirmed_balance)
                ],
                datasetOverride: [{
                    yAxisID: 'y-axis-1'
                }, {
                        yAxisID: 'y-axis-2'
                    }],
                options: {
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

                }
            };
        } else {
            return null;
        }
    }
}