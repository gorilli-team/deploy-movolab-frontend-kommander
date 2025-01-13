import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import { http } from '../../../../utils/Utils';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { TextField as TextInternal } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import Button from '../../../../components/UI/buttons/Button';
import WhiteBox from '../../../../components/UI/WhiteBox';
import CardsHeader from '../../../../components/UI/CardsHeader';
import UserImage from '../../../../components/Users/UserImage';

import toast from 'react-hot-toast';

const NewFine = () => {
  const history = useHistory();
  const form = useForm();
  const [rentToAssociate, setRentToAssociate] = useState(undefined);
  const [imageUrl, setImageUrl] = useState(undefined);

  useEffect(() => {
    if (rentToAssociate) {
      form.setValue('rentToAssociateCode', rentToAssociate?.code);
      form.setValue('rentToAssociateRentalLocation', rentToAssociate?.pickUpLocation?.name);
      form.setValue('rentToAssociateState', rentToAssociate?.state);
      form.setValue(
        'rentToAssociatePickUp',
        moment(rentToAssociate?.pickUpDate).format('DD/MM/YYYY, HH:mm'),
      );
      form.setValue(
        'rentToAssociateDropOff',
        moment(rentToAssociate?.dropOffDate).format('DD/MM/YYYY, HH:mm'),
      );
      form.setValue('rentToAssociateDriverName', rentToAssociate?.driver?.name);
      form.setValue('rentToAssociateDriverSurname', rentToAssociate?.driver?.surname);
      form.setValue('rentToAssociateDriverFiscalCode', rentToAssociate?.driver?.fiscalCode);
      form.setValue(
        'rentToAssociateDriverLicenseNumber',
        rentToAssociate?.driver?.drivingLicense?.number,
      );
      form.setValue(
        'rentToAssociateDriverLicenseCategory',
        rentToAssociate?.driver?.drivingLicense?.category,
      );
      form.setValue(
        'rentToAssociateDriverLicenseReleasedBy',
        rentToAssociate?.driver?.drivingLicense?.releasedBy,
      );
      form.setValue(
        'rentToAssociateDriverLicenseReleaseDate',
        moment(rentToAssociate?.driver?.drivingLicense?.releaseDate).format('DD/MM/YYYY'),
      );
      form.setValue(
        'rentToAssociateDriverLicenseExpiryDate',
        moment(rentToAssociate?.driver?.drivingLicense?.expiryDate).format('DD/MM/YYYY'),
      );
      form.setValue('rentToAssociateDriverAddress', rentToAssociate?.driver?.residency?.address);
      form.setValue('rentToAssociateDriverNation', rentToAssociate?.driver?.residency?.nation);
      form.setValue('rentToAssociateDriverCity', rentToAssociate?.driver?.residency?.city);
      form.setValue('rentToAssociateDriverProvince', rentToAssociate?.driver?.residency?.province);
      form.setValue('rentToAssociateDriverZipCode', rentToAssociate?.driver?.residency?.zipCode);
    }
  }, [rentToAssociate, form]);

  // form.setValue('plate', 'X67DR3');
  // form.setValue('fineTime', new Date('2024-04-01T17:10').toISOString().slice(0, 16));

  const getRentForFine = async (data) => {
    try {
      setRentToAssociate(undefined);

      const response = await http({
        url: '/fines/getRentData',
        method: 'POST',
        form: {
          plate: data.plate,
          time: data.fineTime,
        },
      });

      setRentToAssociate(response);
      setImageUrl(response?.driver?.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  const createFine = async (data) => {
    try {
      if (!rentToAssociate) {
        toast.error('Nessun noleggio associato');
        return;
      }
      if (!form.getValues('fineNumber')) {
        toast.error('Inserire il numero del verbale della multa');
        return;
      }
      if (!form.getValues('fineAmount')) {
        toast.error("Inserire l'importo della multa");
        return;
      }

      const fineData = {
        code: form.getValues('fineNumber'),
        plate: form.getValues('plate'),
        time: form.getValues('fineTime'),
        amount: form.getValues('fineAmount'),
        managementCosts: form.getValues('fineManagementCosts'),
        issue: form.getValues('fineIssue'),
        description: form.getValues('fineDescription'),
        issuer: form.getValues('fineIssuer'),
        issuerAddress: form.getValues('fineIssuerAddress'),
        issuerPec: form.getValues('fineIssuerPec'),
        rent: rentToAssociate?._id,
        driver: rentToAssociate?.driver?._id,
        state: 'open',
      };

      const res = await http({
        url: '/fines',
        method: 'POST',
        form: fineData,
      });

      toast.success('Multa aggiunta con successo');
      history.push('/dashboard/operazioni/multe/' + res?._id);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }
  };

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title="Inserisci Multa"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
        ]}
      ></CardsHeader>
      <WhiteBox className="mt-0 mx-6 overflow-visible">
        <div className="p-4 w-full">
          <h1 className="text-xl font-medium">Ricerca</h1>

          <form
            onSubmit={form.handleSubmit(getRentForFine)}
            id="newFineForm"
            className="flex flex-wrap"
          >
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Targa</FormLabel>
                  <TextInternal
                    form={form}
                    name="plate"
                    placeholder="Targa"
                    validation={{
                      required: { value: true, message: 'Inserisci Targa' },
                    }}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                    }}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Numero Verbale</FormLabel>
                  <TextInternal form={form} name="fineNumber" placeholder="Numero Verbale" />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Data/Ora Infrazione</FormLabel>
                  <TextInternal
                    form={form}
                    name="fineTime"
                    placeholder="Data/Ora Infrazione"
                    type="datetime-local"
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Importo</FormLabel>
                  <TextInternal form={form} name="fineAmount" placeholder="Importo" type="number" />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Spese Amministrative</FormLabel>
                  <TextInternal
                    form={form}
                    name="fineManagementCosts"
                    placeholder="Spese Amministrative"
                    type="number"
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Infrazione</FormLabel>
                  <TextInternal form={form} name="fineIssue" placeholder="Infrazione" />
                </div>
                <div className="flex-grow w-full sm:w-auto">
                  <FormLabel>Descrizione</FormLabel>
                  <TextInternal form={form} name="fineDescription" placeholder="Descrizione" />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Ente Emittente</FormLabel>
                  <TextInternal
                    form={form}
                    name="fineIssuer"
                    placeholder="Ente Emittente"
                    onChangeFunction={(e) => {
                      e.preventDefault();
                    }}
                  />
                </div>
                <div className="flex-grow w-full sm:w-auto">
                  <FormLabel>Indirizzo Ente Emittente</FormLabel>
                  <TextInternal
                    form={form}
                    name="fineIssuerAddress"
                    placeholder="Indirizzo Ente Emittente"
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>PEC Ente Emittente</FormLabel>
                  <TextInternal
                    form={form}
                    name="fineIssuerPec"
                    placeholder="PEC Ente Emittente"
                    type="email"
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex flex-1 justify-end items-end pt-6">
              <Button btnStyle="inFormStyle">Cerca e associa</Button>
            </div>
          </form>
        </div>
      </WhiteBox>

      {rentToAssociate && (
        <WhiteBox className="mt-0 mx-6 overflow-visible">
          <div className="p-4 w-full">
            <div className="flex">
              <h1 className="text-xl font-medium mr-3 mt-2">Conducente</h1>
              {imageUrl && <UserImage user={rentToAssociate?.driver} size="40" goToUser={true} />}
            </div>

            <form
              onSubmit={form.handleSubmit(createFine)}
              id="fineAssociationForm"
              className="flex flex-wrap"
            >
              <fieldset disabled={form.formState.isSubmitting}>
                <div className="flex flex-wrap pt-2 gap-x-4">
                  <div className="flex-none w-64">
                    <FormLabel>Nome</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverName"
                      placeholder="Nome Conducente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Cognome</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverSurname"
                      placeholder="Cognome Conducente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Codice Fiscale</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverFiscalCode"
                      placeholder="Codice Fiscale Conducente"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap pt-2 gap-x-4">
                  <div className="flex-none w-64">
                    <FormLabel>Codice Movo</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateCode"
                      placeholder="Codice Movo"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Punto Nolo (Ritiro)</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateRentalLocation"
                      placeholder="Punto Nolo"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Inizio</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociatePickUp"
                      placeholder="Inizio"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Fine</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDropOff"
                      placeholder="Fine"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap pt-2 gap-x-4">
                  <div className="flex-none w-64">
                    <FormLabel>Numero Patente</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverLicenseNumber"
                      placeholder="Numero Patente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-16">
                    <FormLabel>Categoria</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverLicenseCategory"
                      placeholder="Numero Patente"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-40">
                    <FormLabel>Rilasciato da</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverLicenseReleasedBy"
                      placeholder="Rilasciato da"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Data Rilascio</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverLicenseReleaseDate"
                      placeholder="Data Rilascio"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Data Scadenza</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverLicenseExpiryDate"
                      placeholder="Data Scadenza"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap pt-2 gap-x-4">
                  <div className="flex-none w-96">
                    <FormLabel>Indirizzo</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverAddress"
                      placeholder="Indirizzo"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-24">
                    <FormLabel>Nazione</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverNation"
                      placeholder="Nazione"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-64">
                    <FormLabel>Comune</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverCity"
                      placeholder="Città"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-16">
                    <FormLabel>Provincia</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverProvince"
                      placeholder="Provincia"
                      disabled={true}
                    />
                  </div>
                  <div className="flex-none w-24">
                    <FormLabel>CAP</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateDriverZipCode"
                      placeholder="CAP"
                      disabled={true}
                    />
                  </div>
                </div>
                {/* <div className="flex flex-wrap pt-2 gap-x-4">
                  <div className="flex-none w-64">
                    <FormLabel>Stato</FormLabel>
                    <TextInternal
                      form={form}
                      name="rentToAssociateState"
                      placeholder="Stato"
                      disabled={true}
                    />
                  </div>
                </div> */}
              </fieldset>
              <div className="flex flex-1 justify-end items-end pt-6">
                <Button>Associa e crea nuova multa</Button>
              </div>
            </form>
          </div>
        </WhiteBox>
      )}
    </Page>
  );
};

export default NewFine;
