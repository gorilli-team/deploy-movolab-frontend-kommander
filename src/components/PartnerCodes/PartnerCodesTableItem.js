import React from 'react';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import Button from '../UI/buttons/Button';

const PartnerCodesTableItem = (item) => {
  const partnerCode = item.partnerCode;

  return (
    <tr>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600 w-20">{partnerCode?.code}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{partnerCode?.agent}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{partnerCode?.maxUses}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{partnerCode?.uses}</p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {partnerCode?.partners?.map((partner) => partner.name).join(', ')}
        </p>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <DisplayDateTime date={partnerCode.createdAt} />
        </div>
      </td>
      <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left font-semibold text-gray-600">
          <Button
            to={`/admin/codicipartner/${partnerCode._id}/aggiorna`}
            btnStyle="tableItemAction"
          >
            Dettagli &raquo;
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default PartnerCodesTableItem;
