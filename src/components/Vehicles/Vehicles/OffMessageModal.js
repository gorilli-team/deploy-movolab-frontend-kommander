import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../UI/Modal';

import Button from '../../UI/buttons/Button';
import FormLabel from '../../UI/FormLabel';
import { SelectField } from '../../Form/SelectField';

const OffMessageModal = ({ closeModal, setOffFleet }) => {
  useEffect(() => {}, []);
  const form = useForm();

  const onSubmitCompany = (data) => {
    setOffFleet(data);
    closeModal();
  };

  return (
    <Modal
      isVisible={true}
      onClose={closeModal}
      innerClassName="px-6 py-4 relative"
      headerChildren={'Inserisci motivo disattivazione'}
    >
      <form onSubmit={form.handleSubmit(onSubmitCompany)}>
        <div className="w-96">
          <FormLabel>Motivo disattivazione</FormLabel>
          <SelectField
            form={form}
            name="fleetOffReason"
            type="string"
            placeholder="Motivo disattivazione"
            options={[
              { label: 'Non disponibile', value: 'non_disponibile' },
              { label: 'In riparazione', value: 'in_riparazione' },
              { label: 'In manutenzione', value: 'in_manutenzione' },
              { label: 'In revisione', value: 'in_revisione' },
              { label: 'In attesa di vendita', value: 'in_attesa_di_vendita' },
              { label: 'In attesa di demolizione', value: 'in_attesa_di_demolizione' },
              { label: 'In attesa di trasferimento', value: 'in_attesa_di_trasferimento' },
              { label: 'In attesa di rottamazione', value: 'in_attesa_di_rottamazione' },
              { label: 'Altro', value: 'altro' },
            ]}
          />
        </div>

        <div className="mt-2 flex justify-end">
          <Button btnStyle="white" className="!py-1">
            Avanti
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OffMessageModal;
