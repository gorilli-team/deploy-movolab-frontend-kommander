import React from 'react';
import Confirmation from '../pages/Confirmation';
import Home from '../pages/Home';
import ResetPassword from '../pages/ResetPassword';
import UpdatePassword from '../pages/UpdatePassword';
import SignIn from '../pages/Signin';
import Signup from '../pages/Signup';
import SignupCode from '../pages/SignupCode';
import SignupRequestCode from '../pages/SignupRequestCode';
import Signup1 from '../pages/Signup1';
import Signup2 from '../pages/Signup2';
import Signup3 from '../pages/Signup3';
import WaitingForApproval from '../pages/WaitingForApproval';
import PaymentDone from '../pages/PaymentDone';
import PaymentFailed from '../pages/PaymentFailed';

const GENERIC_ROUTES = [
  { url: '/', component: <Home /> },
  { url: '/signin', component: <SignIn /> },
  { url: '/signup', component: <Signup /> },
  { url: '/signup/code', component: <SignupCode /> },
  { url: '/signup/requestcode', component: <SignupRequestCode /> },
  { url: '/signup/1', component: <Signup1 /> },
  { url: '/signup/2', component: <Signup2 /> },
  { url: '/signup/3', component: <Signup3 /> },
  { url: '/inapprovazione', component: <WaitingForApproval /> },
  { url: '/confirmation', component: <Confirmation /> },
  { url: '/reset-password', component: <ResetPassword /> },
  { url: '/update-password/:resetUrl', component: <UpdatePassword /> },
  { url: '/pagamentoEffettuato', component: <PaymentDone /> },
  { url: '/pagamentoFallito', component: <PaymentFailed /> },
];

export default GENERIC_ROUTES;
