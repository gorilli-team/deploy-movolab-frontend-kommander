import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import BugsnagClient from './bugsnag'; // Import Bugsnag client
import { UserProvider } from './store/UserContext';

// Kommander
import './css/globals.css';


// Initialize ErrorBoundary if BugsnagClient is defined
let ErrorBoundary = React.Fragment; // Fallback to React.Fragment if Bugsnag is not set up

if (BugsnagClient) {
  const BugsnagPlugin = BugsnagClient.getPlugin('react');
  if (BugsnagPlugin) {
    ErrorBoundary = BugsnagPlugin.createErrorBoundary(React);
  }
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <UserProvider>
        <Router
          getUserConfirmation={() => {
            /* Empty callback to block the default browser prompt */
          }}
        >
          <App />
        </Router>
      </UserProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
