import * as _ from 'lodash';

let numbers = _.range(0, 10);
let texts = _.map(numbers, n => `logging from ${n}`);

_.each(texts, t => console.log(t));
