import React from 'react';
import PackUsageTable from './PackUsageTable';

const PackUsage = ({ pack }) => {
  return <div>{pack?._id !== undefined && <PackUsageTable packId={pack._id} />}</div>;
};

export default PackUsage;
