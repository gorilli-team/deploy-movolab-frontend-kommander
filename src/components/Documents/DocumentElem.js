import React, { useState } from 'react';
import Button from '../UI/buttons/Button';
// eslint-disable-next-line no-unused-vars
import { isImageFile, documentLabels } from '../../utils/Documents';

import { FaPen } from 'react-icons/fa';
import DocumentModal from './DocumentModal';
import ElementLabel from '../UI/ElementLabel';
import { FaUpload } from 'react-icons/fa6';

const DocumentElem = ({ resource, document, phase, closeModal, modalOnlyUpload = false }) => {
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showPreview, setShowPreview] = useState(false);

  const docLabel = documentLabels[resource._type].find((type) => type.value === document.label);

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    closeModal();
  };

  return (
    <div
      key={document._id}
      className="bg-slate-100 rounded-lg mt-3 p-3 px-4 relative overflow-hidden"
    >
      <div className="flex content-between flex-col md:flex-row gap-y-4">
        <div className="flex-1 flex flex-col">
          <div className="text-md font-semibold py-1">
            {document.name}
            <FaPen
              className="inline ml-2 mb-1 cursor-pointer hover:opacity-70"
              onClick={() => setShowDocumentModal(true)}
              title="Modifica"
            />
          </div>
          <div className="text-sm mt-1 break-all flex-1">{document.description}</div>
          <h6 className="text-sm mt-2 text-gray-600">
            {docLabel ? (
              <ElementLabel className="py-0.5 px-2 mr-1.5" bgColor={docLabel?.color}>
                {docLabel?.label}
              </ElementLabel>
            ) : null}
            {/*phase ? (
              <ElementLabel className="py-0.5 px-2 mr-1.5" bgColor="bg-slate-300">
                {phase}
              </ElementLabel>
            ) : null*/}
            Inserito il: {new Date(document.createdAt).toLocaleDateString()}
          </h6>
        </div>
        <div>
          {document?.fileUrl !== '' ? (
            <div className="ml-auto">
              {isImageFile(document?.fileUrl) ? (
                <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                  <div
                    className="bg-cover bg-center bg-no-repeat h-32 w-full md:w-52 md:mr-[-0.25em] md:ml-2 md:rounded-r"
                    style={{ backgroundImage: `url(${document.fileUrl})` }}
                  ></div>
                </a>
              ) : (
                /*getExtension(document?.fileUrl) === 'pdf' ? (
                <p className="text-left pt-1">
                  {document.fileUrl !== undefined && (
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      className="py-1.5 block"
                      btnStyle="white"
                    >
                      Anteprima documento
                    </Button>
                  )}
                </p>
              ) :*/ <p className="text-left pt-1">
                  {document.fileUrl !== undefined && (
                    <Button
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!py-1.5 block"
                      btnStyle="white"
                    >
                      Scarica documento
                      {/*document?.fileUrl.substring(document?.fileUrl.lastIndexOf('/') + 1)*/}
                    </Button>
                  )}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {!document.fileUrl ? (
        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg border-2 flex items-center justify-center flex-col gap-1">
          <h3 className="font-semibold text-lg">"{document.name}" non caricato</h3>
          <h4 className="font-medium text-sm text-center">
            {docLabel?.isMandatory ? (
              <>
                <span className="text-red-600">Il documento è obbligatorio</span>
                <br />
              </>
            ) : null}
            {document.description !== '' ? (
              <span className="italic">{document.description}</span>
            ) : (
              ''
            )}
          </h4>
          <div
            className="underline text-sm underline-offset-1 cursor-pointer hover:opacity-80"
            onClick={() => setShowDocumentModal(true)}
          >
            Carica documento
            <FaUpload className="inline ml-1" />
          </div>
        </div>
      ) : null}
      {showPreview ? (
        <div>
          <object data={document?.fileUrl} type="application/pdf" className="w-full h-96">
            <p>
              This browser does not support PDFs. Please download the PDF to view it:{' '}
              <Button href={document?.fileUrl}>Download PDF</Button>.
            </p>
          </object>
        </div>
      ) : null}
      {showDocumentModal ? (
        <DocumentModal
          closeModal={closeDocumentModal}
          {...{ resource, phase, document, modalOnlyUpload }}
        />
      ) : null}
    </div>
  );
};

export default DocumentElem;
