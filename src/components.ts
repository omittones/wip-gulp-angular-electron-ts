//http://stackoverflow.com/questions/30712638/typescript-export-imported-interface
/*
// export the default export of a legacy (`export =`) module
export import MessageBase = require('./message-base');
// export the default export of a modern (`export default`) module
export { default as MessageBase } from './message-base';
// export an interface from a legacy module
import Types = require('./message-types');
export type IMessage = Types.IMessage;
// export an interface from a modern module
export { IMessage } from './message-types';
*/
import { module } from 'angular';

(function(angular: ng.IAngularStatic, baseModule: any) {
    baseModule = baseModule.bind(angular);
    angular.module = function(name, requires, config): ng.IModule {
        let module = baseModule(name, requires, config);
        module.componentClass = function(factory: ng.ComponentConstructor) {
            var controller: any = factory;
            if (factory.$inject && factory.$inject.length > 0) {
                controller = factory.$inject.slice();
                controller.push(factory);
            }
            module.component(factory.$name, {
                templateUrl: factory.$templateUrl,
                template: factory.$template,
                bindings: factory.$bindings,
                controller: controller,
                transclude: factory.$transclude
            });
            return module;
        }
        return module;
    };
})(angular, module);

export { default as MinerStatusComponent } from './miner-status';
export { default as DashboardComponent } from './dashboard';