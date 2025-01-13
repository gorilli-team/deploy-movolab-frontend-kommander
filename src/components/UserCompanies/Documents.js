import React, { useState } from 'react';
import { http } from '../../utils/Utils';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DocumentUploader from '../Form/DocumentUploader';
import WhiteButton from '../UI/buttons/WhiteButton';

import toast from 'react-hot-toast';

const Documents = ({ userCompany }) => {
  const form = useForm();
  const params = useParams();
  const [documents, setDocuments] = useState(userCompany?.documents || []);

  const updateDocumentUrl = async (document, name) => {
    document.name = name;
    setDocuments([...documents]);
    await http({
      method: 'PUT',
      url: `/userCompanies/${params.id}`,
      form: { documents },
    });
    toast.success('Azienda aggiornata');
  };

  const uploadDocumentUrl = async (url) => {
    const document = { url };
    try {
      if (url) {
        await http({
          method: 'PUT',
          url: `/userCompanies/document/${params.id}`,
          form: document,
        });
      }
      toast.success('Documento inserito');
      setDocuments([...documents, document]);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };
  return (
    <div>
      <form>
        <div className="col-span-2">
          <DocumentUploader uploadDocumentUrl={uploadDocumentUrl}></DocumentUploader>
          {documents.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 relative mt-2">
              <header className="p-4">
                <div className={`flex items-start justify-between`}>
                  <h2 className="font-medium text-gray-800 flex items-start space-x-2">
                    <p>
                      {documents.length} {documents.length > 1 ? 'documenti caricati' : 'documento caricato'}
                    </p>
                  </h2>
                </div>
              </header>
              <div className="overflow-auto h-full">
                {/* Table */}
                <div className="">
                  <table className="table-auto w-full">
                    {/* Table header */}
                    <thead className="text-xs font-semibold uppercase text-white bg-gray-400 border-t border-b border-gray-200">
                      <tr>
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Nome</div>
                        </th>
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">URL</div>
                        </th>
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-left">Data Creazione</div>
                        </th>
                        <th className="first:pl-5 last:pr-5 py-3 whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    {/* Table body */}
                    <tbody className="text-sm divide-y divide-gray-200">
                      {documents.reverse().map((document, index) => {
                        return (
                          <tr key={index}>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {document.name ? (
                                  document.name
                                ) : (
                                  <td>
                                    <WhiteButton
                                      onClick={() => {
                                        const name = prompt('Inserisci il nome del documento');
                                        if (name) {
                                          updateDocumentUrl(document, name);
                                        }
                                      }}
                                    >
                                      Aggiungi Nome
                                    </WhiteButton>
                                  </td>
                                )}
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                <a href={document.url} target="_blank" rel="noopener noreferrer">
                                  {/* {document.url} */}

                                  {document.url.substring(document.url.lastIndexOf('/') + 1)}
                                </a>
                              </p>
                            </td>
                            <td className="first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <p className="text-left font-semibold text-gray-600">
                                {document.createdAt !== undefined &&
                                  new Date(document.createdAt).toLocaleString()}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Documents;
