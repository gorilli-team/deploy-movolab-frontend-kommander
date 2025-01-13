import React from 'react';

const PriceListFranchisesTable = ({ elements = [], priority = null }) => {
  const orderedElements = elements.sort((a, b) =>
    a?.group?.mnemonic < b?.group?.mnemonic ? -1 : a?.group?.mnemonic > b?.group?.mnemonic ? 1 : 0,
  );

  const groups = [];

  orderedElements.forEach((el) => {
    const group = groups.find((g) => g._id === el.group?._id);

    if (group) {
      group.fares[el.category] = el.franchise;
    } else {
      if (!el || !el.group) return;
      el.group.fares = {};
      el.group.fares[el.category] = el.franchise;
      groups.push(el.group);
    }
  });

  return (
    <div className="rounded-xl overflow-auto border border-gray-200">
      <table className="table-auto w-full whitespace-nowrap">
        <thead className="text-xs font-semibold bg-gray-50 border-b border-gray-200">
          <tr className="divide-x divide-gray-200">
            <th className="first:pl-5 py-3 text-left text-lg">
              Franchigie
              <span className="text-sm">{priority === 'vehicle' ? <><br />Prio. Veicolo</> : ''}</span>
            </th>
            {Object.keys(groups?.[0]?.fares).map((type, t_index) => (
              <th className="pt-1 uppercase text-gray-500" key={t_index}>
                {type}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200 text-gray-600">
          {groups.map((group, g_index) => (
            <tr className="text-center divide-x divide-gray-200" key={g_index}>
              <th className="first:pl-5 py-3 text-left">
                {group?.mnemonic} ({group?.description})
              </th>
              {Object.keys(group?.fares).map((type, t_index) => (
                <td className="py-1 px-2" key={t_index}>
                  {group?.fares[type].type}
                  <br />
                  <span className="text-xs">
                    {group?.fares[type].value ? +group?.fares[type].value + '€' : '0€'}
                    {' - '}
                    {group?.fares[type].percent ? +group?.fares[type].percent + '%' : '0%'}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceListFranchisesTable;
