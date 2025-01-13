import React from 'react';

import HeroHome from '../partials/HeroHome';
import EmptyPage from './EmptyPage';

function Home() {
  return (
    <EmptyPage headerProps={{ hideNav: true }}>
      <HeroHome />
    </EmptyPage>
  );
}

export default Home;
