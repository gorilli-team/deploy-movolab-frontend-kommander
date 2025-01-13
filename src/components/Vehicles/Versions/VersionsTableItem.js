import React from 'react';
import { CLIENT_ROLE_ADMIN, MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import { FaCheck, FaCircleXmark } from 'react-icons/fa6';
import Button from '../../UI/buttons/Button';

const splitText = (text, maxLength) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const VersionsTableItem = (item) => {
  const version = item.version;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {version.imageUrl ? <img src={version.imageUrl} width={90} alt="version" /> : <></>}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {splitText(version.versionName, 50).map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{version.brandId.brandName}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{version.modelId.modelName}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{version.group?.mnemonic}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {version.createdAt !== undefined && new Date(version.createdAt).toLocaleDateString()}
        </p>
      </td>
      {item?.role === MOVOLAB_ROLE_ADMIN && (
        <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap text-xs">
          <p className="text-left font-semibold text-gray-600">
            {version.createdByClient?.ragioneSociale
              ? version.createdByClient?.ragioneSociale
              : 'Team Movolab'}
          </p>
          {version?.updatedByClient !== undefined && (
            <p className="text-left font-semibold text-gray-600">
              Ultimo agg: {version.updatedByClient?.ragioneSociale}
            </p>
          )}
          <p className="text-left font-semibold text-gray-600">
            {version.approved ? (
              <FaCheck className="text-green-500 font-bold text-lg"></FaCheck>
            ) : (
              <span className="flex space-x-1 text-red-500">
                <span>Non Approvato</span>
                <FaCircleXmark className="text-red-500 font-bold text-lg"></FaCircleXmark>
              </span>
            )}
          </p>
        </td>
      )}
      {item?.role === MOVOLAB_ROLE_ADMIN && (
        <td>
          <Button to={`/admin/veicoli/versioni/${version._id}`} btnStyle="tableItemAction">
            Aggiorna &raquo;
          </Button>
        </td>
      )}
      {item?.role === CLIENT_ROLE_ADMIN && (
        <td>
          <Button to={`/settings/veicoli/versioni/${version._id}`} btnStyle="tableItemAction">
            <>Aggiorna &raquo;</>
          </Button>
        </td>
      )}
    </tr>
  );
};

export default VersionsTableItem;
