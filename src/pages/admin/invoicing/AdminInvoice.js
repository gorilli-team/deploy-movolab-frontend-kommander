import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../components/Admin/AdminPage';
import { http } from '../../../utils/Utils';
import { MOVOLAB_ROLE_ADMIN } from '../../../utils/Utils';
import WhiteBox from '../../../components/UI/WhiteBox';
import ElementLabel from '../../../components/UI/ElementLabel';
import moment from 'moment';

import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import { convertPrice } from '../../../utils/Prices';
import CardsHeader from '../../../components/UI/CardsHeader';
import UpdateInvoiceNumberModal from '../../../components/Invoices/UpdateInvoiceNumberModal';
import UserImage from '../../../components/Users/UserImage';
import UserCompanyImage from '../../../components/UserCompanies/UserCompanyImage';

const AdminInvoice = () => {
  const params = useParams();
  const history = useHistory();

  const [invoiceId, setInvoiceId] = useState(params.id);
  const [invoice, setInvoice] = useState({});
  const [showUpdateInvoiceNumberModal, setShowUpdateInvoiceNumberModal] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCreditNoteAvailable =
    invoice?.storno !== undefined || invoice?.creditNoteFor !== undefined;

  const fetchInvoice = async () => {
    try {
      const response = await http({
        url: `/invoice/${invoiceId}`,
      });
      setInvoice(response);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const stornaFattura = async () => {
    try {
      await http({
        url: `/invoice/${invoiceId}/storno`,
        method: 'POST',
      });
      toast.success('Fattura stornata');
      fetchInvoice();
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const generateFatturaElettronica = async () => {
    try {
      const response = await http({
        url: `/invoice/fatturaElettronica`,
        method: 'POST',
        form: {
          invoiceId: invoice?._id,
        },
      });
      const element = document.createElement('a');
      const file = new Blob([response.fatturaElettronica], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${invoice.invoiceNumber}.xml`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickStorno = () => {
    const stornoId = invoice?.storno?._id;
    history.push(`/dashboard/amministrazione/fatture/${stornoId}`);
    setInvoiceId(stornoId);
  };

  const handleClickCreditNote = () => {
    const creditNoteId = invoice?.creditNoteFor?._id;
    history.push(`/dashboard/amministrazione/fatture/${creditNoteId}`);
    setInvoiceId(creditNoteId);
  };

  const handleUpdateInvoiceNumber = async (data) => {
    try {
      await http({
        url: `/invoice/${invoiceId}`,
        method: 'PUT',
        form: {
          invoiceNumber: data.invoiceNumber,
        },
      });
      setShowUpdateInvoiceNumberModal(false);
      toast.success('Numero fattura aggiornato');
      fetchInvoice();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Numero fattura non aggiornato');
    }
  };

  if (!invoice) return null;

  return (
    <AdminPage canAccess={[MOVOLAB_ROLE_ADMIN]}>
      <CardsHeader
        title="Fattura"
        className="print:hidden"
        buttons={[
          {
            btnStyle: 'lightSlateTransparent',
            children: '« Indietro',
            onClick: () => history.goBack(),
          },
          {
            btnStyle: 'lightSlateTransparent',
            children: 'Cambia Numero Fattura',
            onClick: () => setShowUpdateInvoiceNumberModal(true),
          },
          {
            btnStyle: 'slate',
            children: 'Emetti Nota di Credito',
            onClick: stornaFattura,
            hiddenIf: isCreditNoteAvailable,
          },
          {
            btnStyle: 'blue',
            children: 'Scarica XML',
            onClick: generateFatturaElettronica,
          },
          {
            btnStyle: 'blue',
            children: 'Stampa',
            onClick: () => {
              document.getElementById('bodyPage').scrollTop = 0;
              window.print();
            },
          },
        ]}
      />

      <WhiteBox className="mt-0 p-6 print:mx-0 print:shadow-none print:p-0">
        <div className="flex justify-between flex-wrap">
          <div className="min-w-[18rem]">
            <h1 className="text-2xl font-medium">{invoice.invoiceNumber}</h1>
            <div className="mt-1">
              {invoice.creditNoteFor !== undefined ? (
                <div className="mt-1.5">
                  <ElementLabel
                    bgColor="bg-purple-600"
                    className="cursor-pointer hover:opacity-80"
                    onClick={handleClickCreditNote}
                  >
                    Nota di Credito per fattura: {invoice.creditNoteFor.invoiceNumber}
                  </ElementLabel>
                </div>
              ) : invoice.invoicingType === 'movolab' ? (
                <ElementLabel bgColor="bg-yellow-600" className="uppercase">
                  Fattura Movolab
                </ElementLabel>
              ) : invoice.invoicingType === 'customer' ? (
                <ElementLabel bgColor="bg-gray-500" className="uppercase">
                  Fattura Diretta
                </ElementLabel>
              ) : null}

              {invoice.storno !== undefined && (
                <div className="mt-1.5">
                  <ElementLabel
                    bgColor="bg-gray-600"
                    className="cursor-pointer hover:opacity-80"
                    onClick={handleClickStorno}
                  >
                    Emessa Nota di Credito: {invoice.storno.invoiceNumber}
                  </ElementLabel>
                </div>
              )}
            </div>

            <div className="text-sm text-black mt-2">
              Movo di riferimento:{' '}
              <Link className="text-sky-600" to={`/dashboard/movimenti/${invoice?.rent?._id}`}>
                {invoice?.rent?.code && invoice.rent.code.substring(invoice.rent.code.length - 8)}
              </Link>
              <br />
              Data fattura: {moment(invoice.createdAt).format('DD/MM/YYYY')}
            </div>
          </div>

          <div>
            <ElementLabel bgColor="bg-yellow-600">Intestatario Fattura</ElementLabel>

            {invoice.customer && (
              <div className="flex mt-2">
                <div className="mr-2">
                  <div>
                    {invoice.customer?.name} {invoice.customer?.surname}
                  </div>
                  <div className="text-sm">
                    {invoice?.customer?.fiscalCode}
                    <br />
                    {invoice.customer?.residency?.address}{' '}
                    {invoice.customer?.residency?.houseNumber} <br />
                    {invoice.customer?.residency?.zipCode} {invoice.customer?.residency?.city}
                  </div>
                </div>

                {invoice?.customer && (
                  <UserImage user={invoice?.customer} size="25" goToUser={true} />
                )}
              </div>
            )}
            {invoice.customerCompany && (
              <div className="flex mt-2">
                <div className="mr-2">
                  <div>{invoice?.customerCompany?.ragioneSociale}</div>
                  <div className="text-sm">
                    P.IVA: {invoice?.customerCompany?.partitaIva}
                    <br />
                    {invoice?.customerCompany?.address?.address}
                    <br />
                    {invoice?.customerCompany?.address?.zipCode}{' '}
                    {invoice?.customerCompany?.address?.city}{' '}
                    {invoice?.customerCompany?.address?.province}
                  </div>
                </div>

                {invoice?.customerCompany && (
                  <UserCompanyImage
                    userCompany={invoice?.customerCompany}
                    size="25"
                    goToUser={true}
                  />
                )}
              </div>
            )}
          </div>

          {invoice.invoicingType === 'customer' && (
            <div className="min-w-[18rem] text-right">
              <div>{invoice?.client?.ragioneSociale}</div>
              <div className="text-sm">
                {invoice?.client?.address?.address}
                <br />
                {invoice?.client?.address?.zipCode} {invoice?.client?.address?.city}{' '}
                {invoice?.client?.address?.province}
                <br />
                P.IVA: {invoice?.client?.partitaIva}
                <br />
                SDI: {invoice?.client?.codiceDestinatario}
                <br />
                {invoice?.client?.email}
              </div>
            </div>
          )}
          {invoice.invoicingType === 'movolab' && (
            <div className="min-w-[18rem] text-right">
              <div>Movolab Srl</div>
              <div className="text-sm">
                Via Francesco Valesio 28
                <br />
                00179 Roma RM
                <br />
                P.IVA: 16886221007
                <br />
                SDI: XYZ7234
              </div>
            </div>
          )}
        </div>

        {/* {invoice.rent ? <InvoiceMovoRecap rentId={invoice.rent._id} /> : null} */}

        <div className="w-full mt-5">
          {invoice.lines && (
            <div>
              <div className="bg-white rounded-2xl overflow-hidden mx-0 border border-gray-300">
                <table className="w-full text-left rtl:text-right text-gray-500">
                  <thead className="text-md text-gray-700 bg-slate-100">
                    <tr>
                      <th scope="col" className="px-4 py-2">
                        Descrizione
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Imponibile
                      </th>
                      <th scope="col" className="px-4 py-2">
                        IVA
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Subtotale
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Sconto
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Prezzo Finale
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line, index) => (
                      <tr
                        key={index}
                        className={`bg-white text-gray-700 ${
                          index !== invoice.lines.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <th scope="row" className="px-4 py-2 font-medium text-gray-900">
                          {line.description}
                        </th>
                        <td className="px-4 py-2">{convertPrice(line.initialPrice)}</td>
                        <td className="px-4 py-2">{line.vatPercentage}%</td>
                        <td className="px-4 py-2">{convertPrice(line.subTotal)}</td>
                        <td className="px-4 py-2">{convertPrice(line.discountAmount)}</td>

                        <td className="px-4 py-2">{convertPrice(line.finalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex">
                <div className="w-1/2 hidden md:block"></div>

                <div className="bg-white rounded-2xl overflow-auto mx-0 border border-gray-300 font-medium text-gray-900 mt-5 w-full md:w-1/2 divide-y">
                  <div className="flex justify-between px-4 py-2">
                    <span>Imponibile</span>
                    <span>{convertPrice(invoice?.price?.priceNoVat)}</span>
                  </div>
                  {invoice?.price?.vatAmount > 0 && (
                    <div className="flex justify-between px-4 py-2">
                      <span>Iva</span>
                      <span>{convertPrice(invoice?.price?.vatAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-2">
                    <span>Subtotale</span>
                    <span>
                      {convertPrice(invoice?.price?.priceNoVat + invoice?.price?.vatAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span>Sconto</span>
                    <span>
                      {convertPrice(
                        invoice?.price?.priceNoVat +
                          invoice?.price?.vatAmount -
                          invoice?.price?.finalPrice,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-slate-100 font-semibold">
                    <span>Prezzo Finale</span>
                    <span>{convertPrice(invoice?.price?.finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </WhiteBox>
      {showUpdateInvoiceNumberModal && (
        <UpdateInvoiceNumberModal
          closeModal={() => setShowUpdateInvoiceNumberModal(false)}
          invoiceNumber={invoice.invoiceNumber}
          updateInvoiceNumber={handleUpdateInvoiceNumber}
        />
      )}
    </AdminPage>
  );
};

export default AdminInvoice;
