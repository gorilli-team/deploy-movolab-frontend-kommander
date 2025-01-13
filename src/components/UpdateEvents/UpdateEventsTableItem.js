import React from 'react';

const UpdateEventsTableItem = ({ updateEvent }) => {
  return (
    <tr className="p-1">
      <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">{updateEvent?._id}</p>
      </td>
      <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {updateEvent?.clientProfile?.fullname}
        </p>
      </td>
      <td className="first:pl-5 pr-5 py-3 whitespace-nowrap w-full">
        <textarea
          className="w-full h-32"
          value={JSON.stringify(updateEvent?.document)}
          readOnly
        ></textarea>
      </td>

      <td className="first:pl-5 pr-5 py-3 whitespace-nowrap">
        <p className="text-left font-semibold text-gray-600">
          {updateEvent.createdAt !== undefined && new Date(updateEvent.createdAt).toLocaleString()}
        </p>
      </td>
    </tr>
  );
};

export default UpdateEventsTableItem;
