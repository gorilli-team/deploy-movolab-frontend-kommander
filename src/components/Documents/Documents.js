import React, { useEffect, useState } from 'react';
import { http } from '../../utils/Utils';
import DocumentElem from './DocumentElem';
import DocumentModal from './DocumentModal';
import Button from '../UI/buttons/Button';
import PlusOutlineCircle from '../../assets/icons/PlusOutlineCircle';
import WhiteBox from '../../components/UI/WhiteBox';
import SignedDocElement from './SignedDocElement';
import ElementLabel from '../UI/ElementLabel';
import { availableResources } from '../../utils/Documents';

const Documents = ({
  phase,
  expanded,
  doNotShrink,
  resource = null,
  resourceType = null,
  onUpdate = () => {},
  noCollapsible = false,
  hideNewDocBtn = false,
  modalOnlyUpload = false,
  ...props
}) => {
  const [documents, setDocuments] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  if (!resource || !resourceType) {
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(availableResources)) {
      if (props[key]) {
        resource = props[key];
        resourceType = key;
        break;
      }
    }
  }

  const resSettings = availableResources[resourceType];

  resource._type = resourceType;
  resource._settings = resSettings;

  const fetchDocuments = async () => {
    if (!resSettings) return;

    const docs = resSettings.find.res(await http({ url: resSettings.find.url(resource._id, phase) }));

    if (phase === 'dropOff') {
      const pickUpDocs = resSettings.find.res(await http({ url: resSettings.find.url(resource._id, 'pickUp') }));
      setDocuments(docs.concat(pickUpDocs.map(doc => ({ phase: 'pickUp', ...doc }))));
      return;
    }

    setDocuments(docs);
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const closeModal = () => {
    setOpenModal(false);
    fetchDocuments();
    onUpdate();
  };

  const pickUpSignature = resourceType === 'rent' ? resource?.signature?.pickUp?.otp : null;
  const dropOffSignature = resourceType === 'rent' ? resource?.signature?.dropOff?.otp : null;
  const reservationSignature = resourceType === 'reservation' ? resource?.signature?.otp : null;

  const emptyDocs =
    documents?.filter((d) => !d.fileUrl).length -
    parseInt(reservationSignature?.verified ? 1 : 0) -
    parseInt(pickUpSignature?.verified ? 1 : 0) -
    parseInt(dropOffSignature?.verified ? 1 : 0);
  const docsTotal = documents.length - emptyDocs;

  return (
    <WhiteBox
      className={noCollapsible ? 'mx-0 my-0 px-6 py-5' : 'mx-0'}
      innerClassName="px-6 py-5"
      isCollapsible={!noCollapsible}
      headerChildren={
        <div className="font-bold text-lg">
          Documenti ({docsTotal})
          {emptyDocs > 0 && (
            <ElementLabel className="ml-2" bgColor="bg-gray-100 !text-black">
              {emptyDocs} {emptyDocs > 1 ? 'documenti' : 'documento'} da caricare
            </ElementLabel>
          )}
        </div>
      }
      {...props}
    >
      <div className="transition-all duration-1000">
        {!hideNewDocBtn ? (
          <div className="flex space-x-2">
            <Button
              btnStyle="whiteLightButton"
              onClick={(e) => {
                e.preventDefault();
                setOpenModal(true);
              }}
            >
              <PlusOutlineCircle /> Nuovo Documento
            </Button>
          </div>
        ) : null}
        <div className="mt-2">
          <SignedDocElement signature={pickUpSignature} phase="pickUp" rentId={resource._id} />
          <SignedDocElement signature={dropOffSignature} phase="dropOff" rentId={resource._id} />
          <SignedDocElement signature={reservationSignature} reservationId={resource._id} />
          {documents.length === 0 ? (
            <h3 className="pt-3 italic text-center text-gray-500">Nessun documento caricato</h3>
          ) : null}
          {documents.map((document) => (
            <DocumentElem
              key={document._id}
              {...{ resource, phase: document?.phase || phase, closeModal, document, modalOnlyUpload }}
            />
          ))}
        </div>
      </div>
      {openModal ? <DocumentModal {...{ resource, phase, closeModal, modalOnlyUpload }} /> : null}
    </WhiteBox>
  );
};

export default Documents;
