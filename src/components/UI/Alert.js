import React from 'react';
import { CiCircleAlert, CiCircleCheck, CiCircleInfo, CiWarning } from 'react-icons/ci';

const alertTypes = {
  success: {
    bgClass: 'bg-green-100',
    textClass: 'text-green-900',
    icon: <CiCircleCheck className="text-lg text-green-600" style={{ strokeWidth: 1.2 }} />,
  },
  info: {
    bgClass: 'bg-sky-100',
    textClass: 'text-sky-900',
    icon: <CiCircleInfo className="text-lg text-sky-600" style={{ strokeWidth: 1.2 }} />,
  },
  warning: {
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-900',
    icon: <CiWarning className="text-lg text-amber-600" style={{ strokeWidth: 1.2 }} />,
  },
  error: {
    bgClass: 'bg-red-100',
    textClass: 'text-red-900',
    icon: <CiCircleAlert className="text-lg text-red-600" style={{ strokeWidth: 1.2 }} />,
  },
  orange: {
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-900',
    icon: <CiCircleAlert className="text-lg text-orange-600" style={{ strokeWidth: 1.2 }} />,
  },
  purple: {
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-900',
    icon: <CiCircleAlert className="text-lg text-purple-600" style={{ strokeWidth: 1.2 }} />,
  },
};

const defaultAlertType = 'success';

const Alert = ({
  alertType = defaultAlertType,
  button = null,
  icon = null,
  hideIcon = false,
  children = null,
  className = '',
  ...props
}) => {
  const alert = alertTypes[alertType] || alertTypes[defaultAlertType];

  return (
    <div
      className={`flex p-4 py-3 gap-3 rounded-lg items-center ${alert.bgClass} ${className}`}
      {...props}
    >
      {!hideIcon && <div className="font-bold">{icon || alert.icon}</div>}

      <div className={`flex-1 text-sm ${alert.textClass}`}>{children}</div>

      {button && <div>{button}</div>}
    </div>
  );
};

export default Alert;
