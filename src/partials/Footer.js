import React from 'react';
import { releaseNumber } from '../utils/Release';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-800 sm:text-center">
          © {new Date().getFullYear()}{' '}
          <a href="https://movolab.it" className="hover:underline">
            Movolab™
          </a>
          . All Rights Reserved.
        </span>
        <span className="text-sm text-gray-800 sm:text-center">
          <div className="flex gap-2 content-end text-sm text-right">
            <div>Versione: {releaseNumber}</div>
          </div>
        </span>
        <ul className="flex flex-wrap text-sm font-medium text-gray-800 sm:mt-0">
          <li>
            <a
              href="/pdf/T&C-Movolab-srl.pdf"
              className="mr-4 hover:underline md:mr-6 "
              target="_blank"
            >
              Termini e Condizioni
            </a>
          </li>
          <li>
            <a
              href="/pdf/Privacy-Movolab-srl.pdf"
              className="mr-4 hover:underline md:mr-6"
              target="_blank"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
