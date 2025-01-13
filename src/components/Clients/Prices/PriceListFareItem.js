import React, { useEffect, useState } from 'react';
import { SelectField } from '../../Form/SelectField';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';

const PriceListFareItem = (props) => {
  props.form.setValue('fare', props.fare?._id);

  const [fares, setFares] = useState([]);

  const fetchFaresByGroup = async (group) => {
    try {
      const response = await http({ url: `/fares/group/${group}` });

      setFares(
        response.map((fare) => {
          return {
            value: fare._id,
            label: `Tariffa base: ${fare.baseFare}, Giorni Extra: ${fare.extraDayFare}, KM Giorno Inclusi: ${fare.freeDailyKm}, KM Extra: ${fare.extraKmFare}`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  useEffect(() => {
    fetchFaresByGroup(props.group?._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex" key={props.group?._id}>
      <div className="w-40 pt-2">
        {props.group?.mnemonic} - {props.group?.description}
      </div>
      <div className="w-1/2">
        <SelectField
          form={props.form}
          name="fare"
          type="text"
          options={fares}
          placeholder="Tariffa"
          autofocus
        />
      </div>
    </div>
  );
};

export default PriceListFareItem;
