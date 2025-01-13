import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

import { http } from '../../utils/Utils';
import Button from '../../components/UI/buttons/Button';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import FormLabel from '../../components/UI/FormLabel';
import { TextField } from '../../components/Form/TextField';
import { SelectField } from '../../components/Form/SelectField';

export function ModalExtractInvoices({ showModal, updateShowModal, type = 'customer' }) {
  const form = useForm();
  const [showLoading, setShowLoading] = useState(false);
  const [fattureElettroniche, setFattureElettroniche] = useState([]); // eslint-disable-line
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  let invoiceTypeOptions = [];

  if (type === 'customer') {
    invoiceTypeOptions = [{ value: 'customer', label: 'Le tue fatture' }];
    form.setValue('invoiceType', 'customer');
  } else if (type === 'movolab') {
    invoiceTypeOptions = [{ value: 'movolab', label: 'Fatture Movolab' }];
    form.setValue('invoiceType', 'movolab');
  }

  const extractInvoicesXML = async (data) => {
    try {
      setShowLoading(true);
      const response = await http({
        url: `/invoice/bulkFatturaElettronica`,
        method: 'POST',
        form: {
          startDate: moment(data.startDate).format('YYYY-MM-DD'),
          endDate: moment(data.endDate).format('YYYY-MM-DD'),
          invoicingType: data.invoiceType,
        },
      });

      setFattureElettroniche(response.fattureElettroniche);
      //generate a zip file including all the xmls
      const zip = new JSZip();
      response.fattureElettroniche.forEach((fattura, index) => {
        zip.file(`${fattura.invoiceNumber}.xml`, fattura.xml);
      });

      zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(
          content,
          `fatture_elettroniche-${data.startDate}-${data.endDate}-${data.invoiceType}.zip`,
        );
      });

      setShowLoading(false);
      updateShowModal();

      if (response.error) {
        setErrorModal(response.error);
        setShowErrorModal(true);
        setShowLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <Modal
      headerChildren={showLoading ? `Elaborazione...` : 'Estrazione massiva XML fatture'}
      isVisible={showModal}
      onClose={updateShowModal}
    >
      {showLoading ? (
        <div className="w-128 h-32 flex items-center">
          <Loader />
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(extractInvoicesXML)} id="priceListForm">
          <div className="lg:min-w-60">
            <div className="flex justify-end">
              <div className="flex-initial w-48 pr-6">
                <FormLabel>Fatture dal</FormLabel>
                <TextField
                  form={form}
                  name="startDate"
                  type="date"
                  placeholder="Fatture dal"
                  validation={{
                    required: { value: true, message: 'Inserisci data dal' },
                  }}
                />
              </div>
              <div className="flex-initial w-48 pr-6">
                <FormLabel>Fatture fino al (incluso)</FormLabel>
                <TextField
                  form={form}
                  name="endDate"
                  type="date"
                  validation={{
                    required: { value: true, message: 'Inserisci data fino al' },
                  }}
                  placeholder="Fatture fino al"
                  onChangeFunction={(e) => {
                    e.preventDefault();
                  }}
                />
              </div>

              <div className="flex-initial w-48">
                <FormLabel>Tipo fatture</FormLabel>
                <SelectField
                  form={form}
                  name="invoiceType"
                  placeholder="Tipo fatture"
                  validation={{
                    required: { value: true, message: 'Seleziona tipo fatture' },
                  }}
                  options={invoiceTypeOptions}
                />
              </div>
            </div>

            <div className="text-right mt-3">
              <Button className="!py-1 w-32">Estrai</Button>
            </div>
            {showErrorModal && (
              <div className="text-red-700 bg-red-200 rounded-lg p-4 mt-3 text-md">
                {errorModal}
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}

export default ModalExtractInvoices;
