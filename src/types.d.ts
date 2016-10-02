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