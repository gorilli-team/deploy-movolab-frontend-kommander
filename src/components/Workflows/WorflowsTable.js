import React, { useEffect, useState } from 'react';
import WorkflowsTableItem from './WorkflowsTableItem';
import { MOVOLAB_ROLE_ADMIN, http } from '../../utils/Utils';
import toast from 'react-hot-toast';
import Navigation from '../UI/Navigation';

const WorkflowsTable = ({ role, type, initiator }) => {
  const [from, setFrom] = useState(0);
  const [workflows, setWorkflows] = useState([]);
  const [workflowsCount, setWorkflowsCount] = useState(0);

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, initiator]);

  const fetchWorkflows = async (skip = 0, limit = 10) => {
    try {
      let response;
      if (role === MOVOLAB_ROLE_ADMIN) {
        response = await http({
          url: `/admin/workflow?skip=${skip}&limit=${limit}&type=${type}&initiator=${initiator}`,
        });
      } else {
        response = await http({ url: `/workflow?skip=${skip}&limit=${limit}` });
      }
      setWorkflows(response.workflows);
      setWorkflowsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchWorkflows(from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > workflowsCount) return;
    fetchWorkflows(from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <div className="bg-white border-t border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto h-full">
        {/* Table */}
        <div>
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-500 bg-gray-50">
              <tr>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Tipo</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Nome Flusso</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Iniziatore</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Descrizione</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Stato</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                  <div className="font-semibold text-left">Data Aggiornamento</div>
                </th>
                <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-200 border-t border-b border-gray-200">
              {workflows?.map((workflow, index) => {
                return <WorkflowsTableItem key={index} workflow={workflow} />;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Navigation
        from={from + 1}
        to={from + 10}
        length={workflowsCount}
        precFunction={precFunction}
        succFunction={succFunction}
      />
    </div>
  );
};

export default WorkflowsTable;
