namespace Core {

    export interface IWalletInfo {
        timestamp: number;
        balance: number;
        immature_balance: number;
        unconfirmed_balance: number;
    }

    export interface IMiner {
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

    export interface IQuery<TView, TRequest> {
        get(request: TRequest): ng.IPromise<TView[]>;
    }

    export interface ISimpleQuery<TView> extends IQuery<TView, {}> {
        get(): ng.IPromise<TView[]>;
    }

    export class MinerQuery implements IQuery<IMiner, {}> {
        static $inject = ['$http'];
        constructor(private $http: ng.IHttpService) {
        }

        public get(request: {}): ng.IPromise<IMiner[]> {
            return this.$http.get('miner');
        }
    }

    export type MinerFileRequest = { id: string, path: string }

    export class MinerFileQuery implements IQuery<any, MinerFileRequest> {
        static $inject = ['$http'];
        constructor(private $http: ng.IHttpService) {
        }

        public get(request: MinerFileRequest): ng.IPromise<any> {
            var url = 'miner/' + request.id + '/' + request.path;
            console.log('loading from ' + url);
            return this.$http.get(url).then(function(response: any) {
                console.log(url + ' loaded ok');
                return response.data;
            }, function(response: any) {
                console.log(url + ' error loading');
                return null;
            });
        }
    }
}