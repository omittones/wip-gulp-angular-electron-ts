// http://stackoverflow.com/questions/30712638/typescript-export-imported-interface
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
export { default as MinerStatusComponent } from './miner-status';
export { default as DashboardComponent } from './dashboard';