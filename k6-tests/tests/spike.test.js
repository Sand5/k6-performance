import { crudScenario } from '../scenarios/crud.scenario.js';
import { spikeThresholds } from '../config/thresholds.js';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 1 },
    { duration: '10s', target: 50 },
    { duration: '10s', target: 1 }
  ],
  thresholds: spikeThresholds
};

export default function () {
  crudScenario();
  sleep(0.5);   // minimal think time for spike
}

