import React, { useState, useEffect } from 'react';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { useLocation, useHistory } from 'react-router-dom';
import VehicleGeneral from './VehicleGeneral';
import Stepper from '../../UI/Stepper';
import Management from './Update/Management';
import Damages from '../../Damages/Damages';
import Notes from '../../Notes/Notes';
import Documents from '../../Documents/Documents';
import ModalConfirmDialog from '../../UI/ModalConfirmDialog';
import PurchaseDetails from './Update/PurchaseDetails';
import Contract from './Update/Contract';
import CardsHeader from '../../UI/CardsHeader';
import TableHeaderTab from '../../UI/TableHeaderTab';
import WhiteBox from '../../UI/WhiteBox';
import { hasMandatoryDocuments } from '../../../utils/Documents';

const CreateVehicleWizard = ({ setShowUpdateVehicle }) => {
  const urlParams = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const [fieldToUpdate, setFieldToUpdate] = useState('general');
  const [vehicle, setVehicle] = useState(null);
  const [wizardResumeId, setWizardResumeId] = useState(urlParams.get('id') || false);
  const [stepDone, setStepDone] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (wizardResumeId) {
      fetchVehicle(wizardResumeId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVehicle(vehicle?._id);
  }, [stepDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicle = async (id) => {
    if (!id) return;

    try {
      const response = await http({ url: `/vehicles/vehicle/${id}` });
      setVehicle(response);

      if (wizardResumeId) {
        updateStepDone(response?.creationStep);
        setWizardResumeId(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const updateStepDone = (step) => {
    if (step === 6 && hasMandatoryDocuments(vehicle, 'vehicle')) {
      toast.error('Prima di continuare, carica i documenti richiesti');
      return;
    }

    if (vehicle?._id) {
      try {
        http({
          method: 'PUT',
          url: `/vehicles/vehicle/${vehicle._id}`,
          form: { creationStep: step },
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (step === 0) return;

    setStepDone(step);
    if (step === 1) {
      setFieldToUpdate('purchaseDetails');
    }
    if (step === 2) {
      setFieldToUpdate('contract');
    }
    if (step === 3) {
      setFieldToUpdate('management');
    }
    if (step === 4) {
      setFieldToUpdate('damages');
    }
    if (step === 5) {
      setFieldToUpdate('documents');
    }
    if (step === 6) {
      setFieldToUpdate('notes');
    }
  };

  return (
    <>
      <CardsHeader
        title="Aggiungi veicolo"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => (stepDone > 1 ? updateStepDone(stepDone - 1) : null),
          },
          {
            children: stepDone < 6 ? 'Avanti' : 'Salva',
            form: 'saveVehicle',
            type: 'submit',
            onClick: () => {
              if (stepDone > 3) {
                if (stepDone > 5) {
                  updateStepDone(0);
                  history.push(`/dashboard/veicoli/flotta/${vehicle._id}`);
                } else {
                  updateStepDone(stepDone + 1);
                }
              }
            },
          },
        ]}
      >
        <Stepper
          steps={[
            { content: '1', isCurrent: stepDone === 0 },
            { content: '2', isCurrent: stepDone === 1 },
            { content: '3', isCurrent: stepDone === 2 },
            { content: '4', isCurrent: stepDone === 3 },
            { content: '5', isCurrent: stepDone === 4 },
            { content: '6', isCurrent: stepDone === 5 },
            { content: '7', isCurrent: stepDone === 6 },
          ]}
          colorScheme="orange"
          className="mr-6"
        />
      </CardsHeader>

      <WhiteBox className="mt-0 mx-6">
        <TableHeaderTab
          buttons={[
            {
              label: 'Dati veicolo',
              function: () => {
                setFieldToUpdate('general');
              },
              selected: fieldToUpdate === 'general',
            },
            {
              label: 'Dettagli acquisto',
              function: () => {
                setFieldToUpdate('purchaseDetails');
              },
              selected: fieldToUpdate === 'purchaseDetails',
              disabled: stepDone < 1,
            },
            {
              label: 'Servizi',
              function: () => {
                setFieldToUpdate('contract');
              },
              selected: fieldToUpdate === 'contract',
              disabled: stepDone < 2,
            },
            {
              label: 'Punto nolo',
              function: () => {
                setFieldToUpdate('management');
              },
              selected: fieldToUpdate === 'management',
              disabled: stepDone < 3,
            },
            {
              label: 'Danni',
              function: () => {
                setFieldToUpdate('damages');
              },
              selected: fieldToUpdate === 'damages',
              disabled: stepDone < 4,
            },
            {
              label: 'Documenti',
              function: () => {
                setFieldToUpdate('documents');
              },
              selected: fieldToUpdate === 'documents',
              disabled: stepDone < 5,
            },
            {
              label: 'Note',
              function: () => {
                setFieldToUpdate('notes');
              },
              selected: fieldToUpdate === 'notes',
              disabled: stepDone < 6,
            },
          ]}
        />
        <div className="p-4 bg-slate-200 border-4 rounded-b-2xl border-white">
          {fieldToUpdate === 'general' && (
            <VehicleGeneral
              vehicle={vehicle}
              onSubmitted={(response) => {
                fetchVehicle(response._id);
                setStepDone(1);
                setFieldToUpdate('purchaseDetails');
              }}
              fetchVehicle={fetchVehicle}
              updateStepDone={updateStepDone}
              isWizard={true}
            />
          )}
          {fieldToUpdate === 'purchaseDetails' && (
            <PurchaseDetails
              vehicle={vehicle}
              fetchVehicle={fetchVehicle}
              updateStepDone={updateStepDone}
              isWizard={true}
            />
          )}
          {fieldToUpdate === 'contract' && (
            <Contract
              vehicle={vehicle}
              fetchVehicle={fetchVehicle}
              updateStepDone={updateStepDone}
              isWizard={true}
            />
          )}
          {fieldToUpdate === 'management' && (
            <Management
              vehicle={vehicle}
              fetchVehicle={fetchVehicle}
              updateStepDone={updateStepDone}
              isWizard={true}
            />
          )}
          {fieldToUpdate === 'damages' && (
            <Damages vehicle={vehicle} expanded={true} noCollapsible={true} />
          )}
          {fieldToUpdate === 'documents' && (
            <Documents
              vehicle={vehicle}
              onUpdate={() => fetchVehicle(vehicle?._id)}
              noCollapsible
              modalOnlyUpload
            />
          )}
          {fieldToUpdate === 'notes' && (
            <Notes vehicle={vehicle} expanded={true} noCollapsible={true} />
          )}
        </div>

        <ModalConfirmDialog
          isVisible={showModal}
          handleCancel={() => {
            setShowModal(false);
          }}
          handleOk={() => {
            history.goBack();
          }}
        />
      </WhiteBox>
    </>
  );
};

export default CreateVehicleWizard;
