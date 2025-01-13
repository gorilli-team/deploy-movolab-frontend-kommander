import React from 'react';

const colorSchemes = {
  default: {
    border: 'after:border-sky-600',
    circle: 'bg-white border-sky-600 text-sky-600',
    current: 'bg-sky-600 border-sky-600',
  },
  orange: {
    border: 'after:border-orange-600',
    circle: 'bg-white border-orange-600 text-orange-600',
    current: 'bg-orange-600 border-orange-600',
  }
}

const Stepper = ({ className = '', colorScheme = 'default', stepsClassName = '', steps = [] }) => {
  const colors = colorSchemes?.[colorScheme] || colorSchemes['default'];

  return (
    <ol className={`flex items-center text-white text-xs font-semibold ${className}`}>
      {steps.map((props, index) => (
        <li className={`flex items-center ${index < steps.length - 1 && `after:content-[''] after:w-8 ${colors.border} after:border-b after:inline-block`}`} key={index}>
          <span className={`block text-center w-6 h-6 border rounded-full shrink-0 pt-[2px] pr-[1px] ${props.isCurrent ? colors.current : colors.circle} ${stepsClassName}`}>
            {props.content}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default Stepper;