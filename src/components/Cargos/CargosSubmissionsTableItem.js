import React, { useContext } from 'react';
import { http, MOVOLAB_ROLE_ADMIN } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Button from '../UI/buttons/Button';

const CargosSubmissionsTableItem = (item) => {
  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const mapCargosSubmissionStatus = (status) => {
    switch (status) {
      case 'not_sent':
        return 'Non Inviato';
      case 'error_occurred':
        return 'Errore';
      case 'missing_credentials':
        return 'Credenziali Mancanti';
      case 'sent':
        return 'Inviato';
      case 'submission_error':
        return 'Errore Invio';
      case 'test_successful':
        return 'Test OK';
      case 'validation_error':
        return 'Errore Validazione';
      default:
        return 'Stato sconosciuto'; // Unknown status
    }
  };

  const mapLabelColor = (status) => {
    switch (status) {
      case 'not_sent':
        return 'bg-blue-400';
      case 'error_occurred':
        return 'bg-red-500';
      case 'missing_credentials':
        return 'bg-yellow-500';
      case 'sent':
        return 'bg-green-600';
      case 'submission_error':
        return 'bg-red-500';
      case 'test_successful':
        return 'bg-green-400';
      case 'validation_error':
        return 'bg-red-500';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <tr>
      <td className="px-5 py-3 whitespace-nowrap w-32">
        <p className="text-left font-semibold text-gray-600">
          {item?.cargosSubmission?.rent?.code}
        </p>
      </td>
      <td className="py-3 whitespace-nowrap">
        <ElementLabel bgColor={mapLabelColor(item?.cargosSubmission?.status)}>
          {mapCargosSubmissionStatus(item?.cargosSubmission?.status)}
        </ElementLabel>
      </td>
      {userData?.role === MOVOLAB_ROLE_ADMIN && (
        <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
          <p className="text-left font-semibold text-gray-600">
            {item?.cargosSubmission?.client?.ragioneSociale}
          </p>
        </td>
      )}
      {userData?.role === MOVOLAB_ROLE_ADMIN && (
        <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
          <p className="text-left font-semibold text-gray-600">
            {item?.cargosSubmission?.client?.license?.licenseOwner === 'movolab' ? (
              <ElementLabel bgColor="bg-blue-500">Licenza Movolab</ElementLabel>
            ) : item?.cargosSubmission?.client?.license?.licenseOwner === 'client' ? (
              <ElementLabel bgColor="bg-gray-500">Licenza Personale</ElementLabel>
            ) : (
              <></>
            )}
          </p>
        </td>
      )}
      <td className="py-3 whitespace-nowrap">
        <DisplayDateTime date={item?.cargosSubmission?.createdAt} displayType={'flat'} />
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        {item?.cargosSubmission?.sentAt ? (
          <DisplayDateTime date={item?.cargosSubmission?.sentAt} displayType={'flat'} />
        ) : (
          <>-</>
        )}
      </td>
      <td className="space-x-2">
        <Button to={`./cargos/${item?.cargosSubmission?._id}`} btnStyle="gray">
          Dettagli
        </Button>
      </td>
    </tr>
  );
};

export default CargosSubmissionsTableItem;
