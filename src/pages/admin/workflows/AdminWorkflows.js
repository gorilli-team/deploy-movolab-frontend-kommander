import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import AdminPage from '../../../components/Admin/AdminPage';
import WorkflowsTable from '../../../components/Workflows/WorflowsTable';
import TableHeader from '../../../components/UI/TableHeader';
import FilterSelectField from '../../../components/Form/FilterSelectField';

const AdminWorkflows = () => {
  const history = useHistory();

  const [workflowsCount, setWorkflowsCount] = useState([]);
  const [selectedType, setSelectedType] = useState(
    new URLSearchParams(window.location.search).get('tipo') || 'all',
  );
  const [selectedInitiator, setSelectedInitiator] = useState(
    new URLSearchParams(window.location.search).get('iniziatore') || 'all',
  );

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedInitiator]);

  const setSelectedTypeAndReload = (value) => {
    setSelectedType(value);
    history.push(`/admin/workflows?tipo=${value}&iniziatore=${selectedInitiator}`);
  };

  const setSelectedInitiatorAndReload = (value) => {
    setSelectedInitiator(value);
    history.push(`/admin/workflows?tipo=${selectedType}&iniziatore=${value}`);
  };

  const fetchWorkflows = async () => {
    try {
      const response = await http({
        url: `/admin/workflow?type=${selectedType}&initiator=${selectedInitiator}`,
      });
      setWorkflowsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <div className="flex justify-between items-center">
        <TableHeader
          tableName={'Flussi'}
          buttons={[
            {
              function: () => {
                history.push(`/admin/workflows/crea`);
              },
              label: '+',
            },
          ]}
          length={workflowsCount}
        />{' '}
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedTypeAndReload(e.target.value)}
            value={selectedType}
            options={[
              { label: 'Tutti i Tipi', value: 'all' },
              { label: 'Movolab', value: 'movolab' },
              { label: 'Cliente', value: 'client' },
            ]}
          />
          <FilterSelectField
            onChange={(e) => setSelectedInitiatorAndReload(e.target.value)}
            value={selectedInitiator}
            options={[
              { label: 'Tutti gli Iniziatori', value: 'all' },
              { label: 'Dashboard', value: 'dashboard' },
              { label: 'Corporate', value: 'corporate' },
            ]}
          />
        </div>
      </div>

      <WorkflowsTable role={MOVOLAB_ROLE_ADMIN} type={selectedType} initiator={selectedInitiator} />
    </AdminPage>
  );
};

export default AdminWorkflows;
