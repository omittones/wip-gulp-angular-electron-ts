import * as moment from 'moment';

function ago(milis: number): string {
    if (milis != null) {
        let now = moment('now').milliseconds();
        let duration = moment.duration(now - milis);
        return duration.humanize() + ' ago';
    }
    return 'never';
}

export default class MinerStatusComponent implements ng.IComponentController {
    public static $name = 'minerStatus';
    public static $templateUrl = 'miner-status.html';
    public static $bindings = {
        model: '<'
    };

    public model: Core.IMiner;

    private static logVisible: any = {};

    constructor() {
    }

    public lastTimestamp(): string {

        let temp = MinerStatusComponent.$inject;

        if (this.model.history) {
            let times = _.map(this.model.history, (m: Core.IWalletInfo) => {
                return m.timestamp || 0;
            });
            let timestamp = _.max(times);
            if (_.isNumber(timestamp))
                return ago(timestamp);
        }
        return 'pending';
    }

    public isLogVisible() {
        return MinerStatusComponent.logVisible[this.model.id];
    }

    public toggleLogs() {
        MinerStatusComponent.logVisible[this.model.id] = !MinerStatusComponent.logVisible[this.model.id];
    }

    public chart(): any {
        if (this.model && this.model.history) {
            return {
                labels: _.map(this.model.history, (h: Core.IWalletInfo) => ago(h.timestamp)),
                series: ['balance', 'immature_balance', 'unconfirmed_balance'],
                data: [
                    _.map(this.model.history, h => h.balance),
                    _.map(this.model.history, h => h.immature_balance),
                    _.map(this.model.history, h => h.unconfirmed_balance)
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