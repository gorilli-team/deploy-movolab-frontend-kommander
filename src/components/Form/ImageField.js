import React from 'react';
import { FileField } from './FileField';

export function ImageField(props) {
    return <FileField {...props} accept="image/*" />;
}