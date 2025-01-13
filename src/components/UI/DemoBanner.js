import { AlertCircle } from 'lucide-react';
import React from 'react';

const DemoBanner = () => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-yellow-300 text-black py-2 px-4 text-center z-50">
        <AlertCircle className="inline-block mr-2 h-5 w-5" />
        <span className="font-semibold">Sito Demo:</span> I dati mostrati sono esemplificativi.
      </div>
      <div className="h-10" /> {/* Spacer to prevent content from being hidden behind the banner */}
    </>
  );
};

export default DemoBanner;
