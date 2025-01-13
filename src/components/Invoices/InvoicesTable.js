import React from 'react';
import Table from '../UI/Table';
import { http } from '../../utils/Utils';
import ElementLabel from '../UI/ElementLabel';
import DisplayDateTime from '../UI/dates/DisplayDateTime';
import { Link } from 'react-router-dom';
import { convertPrice } from '../../utils/Prices';
import Button from '../UI/buttons/Button';

const InvoicesTable = ({ invoicingType }) => {
  const isAdmin = window.location.pathname.includes('admin');
  const fetchInvoices = async (skip = 0, limit = 10, queryProps) => {
    const apiUrl = isAdmin ? '/admin/invoice' : '/invoice';
    let response = {};

    if (isAdmin) {
      response = await http({
        url: `${apiUrl}?skip=${skip}&limit=${limit}`,
      });
      return { resource: response.invoices, count: response.count };
    } else {
      response = await http({
        url: `${apiUrl}?skip=${skip}&limit=${limit}&invoicingType=${queryProps.type}`,
      });
      return { resource: response.invoices, count: response.count };
    }
  };

  const invoiceLink = isAdmin
    ? `/admin/amministrazione/fatture/`
    : `/dashboard/amministrazione/fatture/`;

  return (
    <Table
      header={[
        'Tipo',
        'Documento',
        'Numero Documento',
        'Data Fattura',
        'Cliente',
        'Movimento',
        'Tipo Movimento',
        'gg Fatturati',
        'Imponibile',
        'Iva',
        'Totale',
        '',
      ]}
      fetchFunction={fetchInvoices}
      queryProps={{ type: invoicingType }}
      itemsLayout={{
        invoicingType: (type, invoice) =>
          type === 'movolab' || invoice.type === 'movolab' ? (
            <ElementLabel bgColor="bg-blue-500">Movolab</ElementLabel>
          ) : type === 'customer' || invoice.type === 'customer' ? (
            <ElementLabel bgColor="bg-gray-500">Diretta</ElementLabel>
          ) : null,
        documentType: (type) =>
          type === 'creditNote' ? (
            <ElementLabel bgColor="bg-purple-600">Nota di Credito</ElementLabel>
          ) : (
            <ElementLabel bgColor="bg-green-600">Fattura</ElementLabel>
          ),
        invoiceNumber: (number) => number,
        createdAt: (date) => <DisplayDateTime date={date} displayType={'flat'} />,
        customer: (_, invoice) => (
          <>
            {invoice.customerCompany ? invoice?.customerCompany?.ragioneSociale : ''}
            {invoice?.customer?.name} {invoice?.customer?.surname}
          </>
        ),
        rent: (rent, invoice) => (
          <div className="text-sm flex">
            <Link
              className="text-blue-600"
              to={
                isAdmin
                  ? `/admin/clienti/movimenti/${rent?._id}`
                  : `/dashboard/movimenti/${rent?._id}`
              }
            >
              {rent?.code && rent.code.substring(rent.code.length - 8)}
            </Link>
            <Link
              className="text-blue-600"
              to={`/dashboard/prenotazioni/${invoice?.reservation?._id}`}
            >
              {invoice?.reservation?.code &&
                invoice.reservation.code.substring(invoice.reservation.code.length - 8)}
            </Link>
          </div>
        ),
        movementType: (movementType) =>
          movementType === 'NOL' ? (
            <ElementLabel bgColor="bg-blue-500">NOLEGGIO</ElementLabel>
          ) : movementType === 'COM' ? (
            <ElementLabel bgColor="bg-orange-600">COMODATO</ElementLabel>
          ) : movementType === 'MNP' ? (
            <ElementLabel bgColor="bg-gray-600">MOV NON PRODUTTIVO</ElementLabel>
          ) : (
            <ElementLabel>{movementType}</ElementLabel>
          ),
        totalDays: (days) => days,
        price: (price) => convertPrice(price?.priceNoVat),
        updatedAt: (_, invoice) => convertPrice(invoice?.price?.vatAmount),
        year: (_, invoice) => convertPrice(invoice?.price?.finalPrice),
        _id: (id) => (
          <Button to={invoiceLink + id} btnStyle="tableItemAction">
            Dettagli &raquo;
          </Button>
        ),
      }}
      emptyTableMessage="Non è stata creata alcuna fattura"
      avoidLoading
    />
  );
};

export default InvoicesTable;
