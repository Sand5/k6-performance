import { loginScenario } from '../scenarios/login.scenario.js';
import { crudScenario } from '../scenarios/crud.scenario.js';
import { smokeThresholds } from '../config/thresholds.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: smokeThresholds,
};

// THIS default export is required by K6
export default function () {
  loginScenario();
  crudScenario();
}
