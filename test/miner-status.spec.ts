/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { MinerStatusComponent } from '../src/components';
import * as chai from "chai";

const expect = chai.expect;

describe("controller", () => {
  it("should work", () => {
    const component = new MinerStatusComponent();
    component.miner = {
    };
    expect(component.chart()).to.not.be.null;
  });
});
