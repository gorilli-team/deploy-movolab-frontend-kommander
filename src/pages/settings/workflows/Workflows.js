import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../store/UserContext';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR, http } from '../../../utils/Utils';
import SettingsPage from '../../../components/Settings/SettingsPage';
import WorkflowsTable from '../../../components/Workflows/WorflowsTable';
import TableHeader from '../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../assets/icons/PlusOutlineCircle';

const Workflows = () => {
  const history = useHistory();

  const [workflowsCount, setWorkflowsCount] = useState([]);

  const { data: currentClient } = useContext(UserContext);

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await http({ url: '/workflow' });
      setWorkflowsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <SettingsPage canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]}>
      <TableHeader
        tableName={'Flussi'}
        buttons={
          currentClient?.role === CLIENT_ROLE_ADMIN
            ? [
                {
                  function: () => {
                    history.push(`/settings/flussi/crea`);
                  },
                  label: 'Aggiungi Flusso',
                  svgIco: <PlusOutlineCircle />,
                },
              ]
            : null
        }
        length={workflowsCount}
      />

      <WorkflowsTable />
    </SettingsPage>
  );
};

export default Workflows;
