import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../store/UserContext';
import { useHistory, useParams } from 'react-router-dom';
import Page from '../../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../../utils/Utils';
import { http } from '../../../../utils/Utils';
import { useForm } from 'react-hook-form';
import { TextField } from '../../../../components/Form/TextField';
import FormLabel from '../../../../components/UI/FormLabel';
import WhiteBox from '../../../../components/UI/WhiteBox';
import CardsHeader from '../../../../components/UI/CardsHeader';
import moment from 'moment';
import FineReport from './pages/FineReport';
import FineCharge from './pages/FineCharge';
import html2pdf from 'html2pdf.js';

import toast from 'react-hot-toast';
import Documents from '../../../../components/Documents/Documents';
import Button from '../../../../components/UI/buttons/Button';
import { FaSearch } from 'react-icons/fa';

const printFine = (box_id, filename = 'documento.pdf') => {
  page2PDF(document.getElementById(box_id), filename);
};

const page2PDF = async (
  element,
  filename = 'dettaglio_movo.pdf',
  forceUpload = false,
  download = true,
) => {
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.65 },
    html2canvas: { scale: 2, allowTaint: true, useCORS: true },
    jsPDF: { orientation: 'portrait' },
  };

  const style = document.createElement('style');
  document.head.appendChild(style);
  // style.sheet.insertRule('#rentPrint { width: 2000px; }');
  style.sheet.insertRule('.no-pdf { display: none; }');

  // Html3pdf bugfix with tailwind preflight
  style.sheet.insertRule('body > div:last-child img { display: inline-block; }');

  const worker = html2pdf().set(opt).from(element).toPdf();

  if (download) {
    worker.save().then((res) => {
      style.remove();
      toast.success('Documento scaricato in formato PDF');
    });
  }
};

const NewFine = () => {
  const params = useParams();
  const history = useHistory();
  const form = useForm();
  const [fine, setFine] = useState(undefined);
  const [fineId, setFineId] = useState(params.id); // eslint-disable-line no-unused-vars
  const userContext = useContext(UserContext);

  useEffect(() => {
    if (fine) {
      form.setValue('plate', fine.rent?.vehicle?.plate);
      form.setValue('brandName', fine.rent?.vehicle?.brand?.brandName);
      form.setValue('fine.code', fine.code);
      form.setValue('fineTime', moment(fine.fineTime).format('YYYY-MM-DDTHH:mm'));
      form.setValue('fineAmount', fine.amount); //&& convertPrice(fine.amount));
      form.setValue('fineManagementCosts', fine.managementCosts); // && convertPrice(fine.managementCosts),);
      form.setValue('fineIssue', fine.issue);
      form.setValue('fineDescription', fine.description);
      form.setValue('fineIssuer', fine.issuer);
      form.setValue('fineIssuerAddress', fine.issuerAddress);
      form.setValue('fineIssuerPec', fine.issuerPec);
      form.setValue('rentToAssociateDriverName', fine.rent.driver.name);
      form.setValue('rentToAssociateDriverSurname', fine.rent.driver.surname);
      form.setValue('rentToAssociateDriverFiscalCode', fine.rent.driver.fiscalCode);
      form.setValue('rentToAssociateCode', fine.rent.code);
      form.setValue('rentToAssociateRentalLocation', fine.rent.pickUpLocation?.name);
      form.setValue(
        'rentToAssociatePickUp',
        moment(fine.rent.pickUpDate).format('DD/MM/YYYY HH:mm'),
      );
      form.setValue(
        'rentToAssociateDropOff',
        moment(fine.rent.dropOffDate).format('DD/MM/YYYY HH:mm'),
      );
      form.setValue('rentToAssociateDriverLicenseNumber', fine.rent.driver?.drivingLicense?.number);
      form.setValue(
        'rentToAssociateDriverLicenseCategory',
        fine.rent.driver?.drivingLicense?.category,
      );
      form.setValue(
        'rentToAssociateDriverLicenseReleasedBy',
        fine.rent.driver?.drivingLicense?.releasedBy,
      );
      form.setValue(
        'rentToAssociateDriverLicenseReleaseDate',
        moment(fine.rent.driver?.drivingLicense?.releaseDate).format('DD/MM/YYYY'),
      );
      form.setValue(
        'rentToAssociateDriverLicenseExpiryDate',
        moment(fine.rent.driver?.drivingLicense?.expirationDate).format('DD/MM/YYYY'),
      );
      form.setValue('rentToAssociateDriverAddress', fine.rent.driver?.residency?.address);
      form.setValue('rentToAssociateDriverNation', fine.rent.driver?.residency?.nation);
      form.setValue('rentToAssociateDriverCity', fine.rent.driver?.residency?.city);
      form.setValue('rentToAssociateDriverProvince', fine.rent.driver?.residency?.province);
      form.setValue('rentToAssociateDriverZipCode', fine.rent.driver?.residency?.zipCode);

      form.setValue('iban', fine.client?.iban);
      form.setValue('ragioneSociale', fine.client?.ragioneSociale);
    }
  }, [fine]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchFine();
  }, [fineId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFine = async () => {
    try {
      const response = await http({
        url: `/fines/${fineId}`,
      });
      setFine(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const onFineEdit = async (data) => {
    try {
      if (!form.getValues('fine.code')) {
        toast.error('Inserire il numero del verbale della multa');
        return;
      }
      if (!form.getValues('fineAmount')) {
        toast.error("Inserire l'importo della multa");
        return;
      }

      const fineData = {
        code: form.getValues('fine.code'),
        // plate: form.getValues('plate'),
        // time: form.getValues('fineTime'),
        amount: form.getValues('fineAmount'),
        managementCosts: form.getValues('fineManagementCosts'),
        issue: form.getValues('fineIssue'),
        description: form.getValues('fineDescription'),
        issuer: form.getValues('fineIssuer'),
        issuerAddress: form.getValues('fineIssuerAddress'),
        issuerPec: form.getValues('fineIssuerPec'),
        // rent: rentToAssociate?._id,
        // driver: rentToAssociate?.driver?._id,
        // state: 'open',
      };

      const response = await http({
        url: `/fines/${fineId}`,
        method: 'PUT',
        form: fineData,
      });

      if (response) {
        toast.success('Dati multa salvati');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Errore');
    }

    return;
  };

  if (!fine) {
    return <Page />;
  }

  const fine_code = fine?.code.replace(/[^a-z0-9]/gi, '');

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <CardsHeader
        title={`Multa ${fine && fine.code}`}
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: 'blue',
            children: 'Aggiorna',
            form: 'editFineForm',
          },
          {
            btnStyle: 'blue',
            children: 'Stampa documenti',
            // onClick: printFine,
            isDropdown: true,
            dropdownItems: [
              {
                children: 'Scarica notifica verbale',
                onClick: () => printFine('fineReport', `notifica_verbale_${fine_code}.pdf`),
              },
              {
                children: 'Scarica addebito multa',
                onClick: () => printFine('fineCharge', `addebito_multa_${fine_code}.pdf`),
              },
            ],
          },
        ]}
      ></CardsHeader>
      <WhiteBox className="mt-0 mx-6 overflow-visible">
        <div className="p-4 w-full">
          <h1 className="text-xl font-medium">Dettaglio multa</h1>

          <form
            id="editFineForm"
            className="flex flex-wrap"
            onSubmit={form.handleSubmit(onFineEdit)}
          >
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Targa</FormLabel>
                  <TextField
                    form={form}
                    name="plate"
                    placeholder="Targa"
                    validation={{
                      required: { value: true, message: 'Inserisci Targa' },
                    }}
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Marca e modello</FormLabel>
                  <TextField
                    form={form}
                    name="brandName"
                    placeholder="Marca e modello"
                    validation={{
                      required: { value: true, message: 'Inserisci Marca e modello' },
                    }}
                    onChangeFunction={(e) => {
                      e.preventDefault();
                    }}
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Numero Verbale</FormLabel>
                  <TextField
                    form={form}
                    name="fine.code"
                    placeholder="Numero Verbale"
                    // disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Data/Ora Infrazione</FormLabel>
                  <TextField
                    form={form}
                    name="fineTime"
                    placeholder="Data/Ora Infrazione"
                    type="datetime-local"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Importo</FormLabel>
                  <TextField form={form} name="fineAmount" placeholder="Importo" type="text" />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Spese Amministrative</FormLabel>
                  <TextField
                    form={form}
                    name="fineManagementCosts"
                    placeholder="Spese Amministrative"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Infrazione</FormLabel>
                  <TextField
                    form={form}
                    name="fineIssue"
                    placeholder="Infrazione"
                    // disabled={true}
                  />
                </div>
                <div className="flex-grow w-full sm:w-auto">
                  <FormLabel>Descrizione</FormLabel>
                  <TextField
                    form={form}
                    name="fineDescription"
                    placeholder="Descrizione"
                    // disabled={true}
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Ente Emittente</FormLabel>
                  <TextField
                    form={form}
                    name="fineIssuer"
                    placeholder="Ente Emittente"
                    // disabled={true}
                  />
                </div>
                <div className="flex-grow w-full sm:w-auto">
                  <FormLabel>Indirizzo Ente Emittente</FormLabel>
                  <TextField
                    form={form}
                    name="fineIssuerAddress"
                    placeholder="Indirizzo Ente Emittente"
                    // disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>PEC Ente Emittente</FormLabel>
                  <TextField
                    form={form}
                    name="fineIssuerPec"
                    placeholder="PEC Ente Emittente"
                    type="email"
                    // disabled={true}
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Codice Movo</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateCode"
                    placeholder="Codice Movo"
                    // disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Punto Nolo (Ritiro)</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateRentalLocation"
                    placeholder="Punto Nolo"
                    // disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Inizio Movo</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociatePickUp"
                    placeholder="Inizio Movo"
                    // disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Fine Movo</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDropOff"
                    placeholder="Fine Movo"
                    // disabled={true}
                  />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
        <div className="p-4 w-full">
          <div className="flex">
            <h1 className="text-xl font-medium mr-3 mt-2">Conducente</h1>
            {/* {imageUrl && <UserImage user={rentToAssociate?.driver} size="40" goToUser={true} />} */}
          </div>

          <form id="fineAssociationForm" className="flex flex-wrap">
            <fieldset disabled={form.formState.isSubmitting}>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Nome</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverName"
                    placeholder="Nome Conducente"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Cognome</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverSurname"
                    placeholder="Cognome Conducente"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Codice Fiscale</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverFiscalCode"
                    placeholder="Codice Fiscale Conducente"
                    disabled={true}
                  />
                </div>
              </div>
              <div className="flex flex-wrap pt-2 gap-x-4">
                <div className="flex-none w-64">
                  <FormLabel>Numero Patente</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverLicenseNumber"
                    placeholder="Numero Patente"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-16">
                  <FormLabel>Categoria</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverLicenseCategory"
                    placeholder="Numero Patente"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-40">
                  <FormLabel>Rilasciato da</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverLicenseReleasedBy"
                    placeholder="Rilasciato da"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Data Rilascio</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverLicenseReleaseDate"
                    placeholder="Data Rilascio"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Data Scadenza</FormLabel>
                  <TextField
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
                  <TextField
                    form={form}
                    name="rentToAssociateDriverAddress"
                    placeholder="Indirizzo"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-24">
                  <FormLabel>Nazione</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverNation"
                    placeholder="Nazione"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-64">
                  <FormLabel>Comune</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverCity"
                    placeholder="Città"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-16">
                  <FormLabel>Provincia</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverProvince"
                    placeholder="Provincia"
                    disabled={true}
                  />
                </div>
                <div className="flex-none w-24">
                  <FormLabel>CAP</FormLabel>
                  <TextField
                    form={form}
                    name="rentToAssociateDriverZipCode"
                    placeholder="CAP"
                    disabled={true}
                  />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
        <div className="p-4">
          <h1 className="text-xl font-medium mr-3 mt-2">Dati fatturazione</h1>
          <div className="flex gap-x-4">
            <div className="flex-none w-64">
              <FormLabel>Intestatario conto</FormLabel>
              <TextField
                form={form}
                name="ragioneSociale"
                placeholder="Ragione Sociale"
                disabled={true}
              />
            </div>
            <div className="flex-none w-96">
              <FormLabel>IBAN</FormLabel>
              <TextField form={form} name="iban" placeholder="IBAN" disabled={true} />
            </div>
          </div>
        </div>
      </WhiteBox>

      {fine && (
        <div className="bg-white p-3 hidden">
          <div className="text-black p-4" id="fineCharge">
            <FineCharge fine={fine} userContext={userContext} />
          </div>
          <div className="text-black p-4" id="fineReport">
            <FineReport fine={fine} userContext={userContext} />
          </div>
        </div>
      )}

      <div className="px-6 w-full">
        <Documents fine={fine} />
      </div>

      {fine._id && (
        <div className="text-center">
          <Button
            btnStyle="unstyled"
            className="text-slate-500 underline text-xs"
            to={`/dashboard/operazioni/multe/${fine?._id}/aggiornamenti`}
          >
            <FaSearch className="inline mb-1" /> Log aggiornamenti
          </Button>
        </div>
      )}
    </Page>
  );
};

export default NewFine;
