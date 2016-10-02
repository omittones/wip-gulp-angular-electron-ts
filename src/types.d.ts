declare module 'angular-chart.js' {
}

declare module 'chart.js' {
}

declare namespace angular {

    export interface ComponentConstructor {
        new (...args: any[]): ng.IComponentController;
        $inject?: string[];
        $name: string;
        $bindings?: any;
        $templateUrl?: string;
        $template?: string;
        $transclude?: boolean;
    }

    interface IModule {
        componentClass(factory: ComponentConstructor): ng.IModule;
    }
}

declare type Action1<T> = (a: T) => void;

declare type Action2<T1, T2> = (a: T1, b: T2) => void;

declare type Action3<T1, T2, T3> = (a: T1, b: T2, c: T3) => void;