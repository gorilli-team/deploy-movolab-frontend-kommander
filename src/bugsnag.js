// src/bugsnag.js

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

let BugsnagClient = null;

if (process.env.REACT_APP_BUGSNAG_API_KEY) {
  BugsnagClient = Bugsnag.start({
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
  });
}

export default BugsnagClient;
