import React, { useContext } from 'react';
import ElementLabel from '../UI/ElementLabel';
import { UserContext } from '../../store/UserContext';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Button from '../UI/buttons/Button';
import { MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';

const WorkflowsTableItem = (item) => {
  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const workflow = item.workflow;

  const mapWorkflowInitiator = (initiator) => {
    switch (initiator) {
      case 'dashboard':
        return 'Dashboard';
      case 'corporate':
        return 'Corporate';
      case 'mobileapp':
        return 'Mobile App';
      default:
        return '-';
    }
  };

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600 max-w-xs">
          {workflow?.workflowType === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : workflow?.workflowType === 'client' ? (
            <>
              {isAdmin && <div className="text-xs">{workflow.client?.ragioneSociale}</div>}
              <ElementLabel bgColor="bg-gray-500">Cliente</ElementLabel>
            </>
          ) : (
            <></>
          )}
        </div>
        {workflow?.isOnWidget && (
          <div className="mt-1">
            <ElementLabel bgColor="bg-orange-500">Su Widget</ElementLabel>
          </div>
        )}
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{workflow.name}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {mapWorkflowInitiator(workflow?.initiator)}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 max-w-sm whitespace-pre-line">
          {workflow.description}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600 uppercase">
          {workflow?.status === 'active' ? (
            <ElementLabel bgColor="bg-green-600">Attivo</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-red-600">Disattivato</ElementLabel>
          )}
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <DisplayDateTime date={workflow.updatedAt} />
      </td>

      <td>
        {isAdmin ? (
          <Button to={`/admin/workflows/${workflow?._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ) : (
          <Button to={`/settings/flussi/${workflow?._id}`} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        )}
      </td>
    </tr>
  );
};

export default WorkflowsTableItem;
