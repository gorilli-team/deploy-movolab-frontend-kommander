import React from 'react';
import Button from './buttons/Button';
import Modal from './Modal';

export function ModalConfirmDialog({
  isVisible,
  innerClassName,
  headerChildren = 'Attenzione!',
  title = 'Sei sicuro di voler uscire?',
  description = 'Se ci sono dati non salvati, verranno persi.',
  cancelText = 'Annulla',
  handleCancel = () => { },
  okText = 'Esci',
  handleOk = () => { },
  cannotLeave = false
}) {
  return (
    <Modal
      headerChildren={headerChildren}
      isVisible={isVisible}
      onClose={handleCancel}
      innerClassName={innerClassName}
    >
      <div>
        {title && (
          <>
            <strong>{title}</strong>
            <br />
          </>
        )}
        <>{description}</>
      </div>
      <div className="flex justify-end mt-5">
        <Button className="!py-1 !text-red-500" btnStyle="white" onClick={handleCancel}>
          {cancelText}
        </Button>
        {!cannotLeave ?
          <Button className="!py-1" btnStyle="white" onClick={handleOk}>
            {okText}
          </Button> : null}
      </div>
    </Modal>
  );
}

export default ModalConfirmDialog;
