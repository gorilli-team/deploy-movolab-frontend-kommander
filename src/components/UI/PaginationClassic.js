import React from 'react';

const PaginationClassic = (props) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <nav className="mb-4 sm:mb-0 sm:order-1" role="navigation" aria-label="Navigation">
        <ul className="flex justify-center">
          <li className="ml-3 first:ml-0">
            <button
              onClick={(e) => props.updateSkipHandler(props.skip - 10)}
              disabled={props.skip === 0}
              className={
                props.skip === 0
                  ? 'btn bg-white border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'btn bg-white border-gray-200 hover:border-gray-300 text-indigo-500'
              }
              href="#0"
            >
              &lt;- Previous
            </button>
          </li>
          <li className="ml-3 first:ml-0">
            <button
              onClick={(e) => props.updateSkipHandler(props.skip + 10)}
              disabled={props.skip + 10 >= props.count}
              className={
                props.skip + 10 >= props.count
                  ? 'btn bg-white border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'btn bg-white border-gray-200 hover:border-gray-300 text-indigo-500'
              }
              href="#0"
            >
              Next -&gt;
            </button>
          </li>
        </ul>
      </nav>
      <div className="text-sm text-gray-500 text-center sm:text-left">
        Results from <span className="font-medium text-gray-600">{props.skip + 1}</span> to{' '}
        <span className="font-medium text-gray-600">{Math.min(props.skip + 10, props.count)} </span>{' '}
        of <span className="font-medium text-gray-600">{props.count}</span>
      </div>
    </div>
  );
};

export default PaginationClassic;
