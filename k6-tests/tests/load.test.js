import { loginScenario } from '../scenarios/login.scenario.js';
import { crudScenario } from '../scenarios/crud.scenario.js';
import { loadThresholds } from '../config/thresholds.js';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 }
  ],
  thresholds: loadThresholds
};

export default function () {
  loginScenario();
  sleep(Math.random() * 2 + 1);  // randomized think time
  crudScenario();
  sleep(Math.random() * 2 + 1);  // pacing between iterations
}
