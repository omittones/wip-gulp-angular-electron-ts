import * as moment from 'moment';
import * as _ from 'lodash';
import * as angular from 'angular';

function ago(millis: number): string {
    if (millis != null) {
        let now = moment().utc().valueOf();
        let duration: moment.Duration;
        if (now < millis) {
            duration = moment.duration(now - millis, 'milliseconds');
            return 'in ' + duration.humanize();
        } else {
            duration = moment.duration(millis - now, 'milliseconds');
            return duration.humanize() + ' ago';
        }
    }
    return 'never';
}

export default class MinerStatusComponent implements angular.IComponentController {
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

    private chart: any;

    public getChart(): any {

        if (this.model && this.model.history) {

            var ago48h = moment().utc().add(-48, 'hours').valueOf();
            let recent = _.filter(this.model.history, (i: Core.IWalletInfo) => i.timestamp > ago48h);
            let balance = _.map(recent, h => h.balance);
            let imBalance = _.map(recent, h => h.immature_balance);
            let uncBalance = _.map(recent, h => h.unconfirmed_balance);
            let labels = _.map(recent, (h: Core.IWalletInfo) => ago(h.timestamp));

            if (!this.chart || _.last(this.chart.labels) != _.last(labels)) {

                this.chart = {
                    labels: labels,
                    series: ['balance', 'immature_balance', 'unconfirmed_balance'],
                    data: [
                        balance,
                        imBalance,
                        uncBalance
                    ],
                    datasetOverride: [{
                        yAxisID: 'y-axis-1'
                    }, {
                        yAxisID: 'y-axis-1'
                    }, {
                        yAxisID: 'y-axis-1'
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
            }

        } else {

            this.chart = null;

        }

        return this.chart;
    }
}