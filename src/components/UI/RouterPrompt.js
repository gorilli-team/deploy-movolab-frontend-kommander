import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ModalConfirmDialog from './ModalConfirmDialog';

export function RouterPrompt({
  when,
  onOK,
  onCancel,
  title,
  description,
  okText,
  cancelText,
  excludedPaths = [],
  cannotLeave = false
}) {
  const history = useHistory();

  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (when) {
      history.block((prompt) => {
        if (excludedPaths?.find((path) => path === prompt.pathname)) {
          return true;
        }
        setCurrentPath(prompt.pathname + prompt.search);
        setShowPrompt(true);
        return false;
      });
    } else {
      history.block(() => {});
    }

    return () => {
      history.block(() => {});
    };
  }, [history, when]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOK = useCallback(async () => {
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());
      if (canRoute) {
        history.block(() => {});
        history.push(currentPath);
      }
    }
  }, [currentPath, history, onOK]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        history.block(() => {});
        history.push(currentPath);
      }
    }
    setShowPrompt(false);
  }, [currentPath, history, onCancel]);

  return (
    <ModalConfirmDialog
      isVisible={showPrompt}
      title={title}
      description={description}
      handleCancel={handleCancel}
      handleOk={handleOK}
      cancelText={cancelText}
      okText={okText}
      cannotLeave={cannotLeave}
    />
  );
}
