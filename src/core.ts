namespace Core {

    export interface IWalletInfo {
        timestamp: number;
        balance: number;
        immature_balance: number;
        unconfirmed_balance: number;
    }

    export interface IMiner {
        id: number;
        ip: string;
        name: string;
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

    export type MinerFileRequest = { id: number, path: string };

    export type MinerFileRespone = string | {};
}