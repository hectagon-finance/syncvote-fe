/* eslint-disable no-restricted-globals */
import React from 'react';
// Dummy import to prevent build from failure

self.onmessage = (message) => {
  sleep(10000);
  self.postMessage('Done!');
};

const sleep = (milliseconds: number) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};
