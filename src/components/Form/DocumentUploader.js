import AWS from 'aws-sdk';
import React, { useState } from 'react';
import LoadingSpinner from '../../assets/icons/LoadingSpinner';

export const uploadToS3 = async (
  file,
  bucket = 'movolab-car-models',
  callback = () => {},
  customFilename = null,
) => {
  if (!file) {
    return;
  }

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const s3 = new AWS.S3();
  const params = {
    Bucket: bucket,
    Key: customFilename || `${Date.now()}.${file.name}`,
    Body: file,
  };
  const { Location } = await s3.upload(params).promise();
  callback(Location);
};

const DocumentUploader = ({ name, uploadDocumentUrl, bucket }) => {
  const [status, setStatus] = useState(false);

  const handleFileSelect = (e) => {
    setStatus('uploading');
    uploadToS3(e.target.files[0], bucket, (location) => {
      setStatus('uploaded');
      uploadDocumentUrl(location, name);
    });
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-30 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
      >
        <div className="flex flex-col items-center justify-center text-center py-4">
          <svg
            className="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Clicca per selezionare un file</span> da caricare
          </p>
          {status === 'uploaded' && (
            <p className="text-sm text-green-600 font-semibold">File caricato con successo</p>
          )}
          {status === 'uploading' && (
            <p className="text-sm text-sky-700 font-semibold">
              <LoadingSpinner className="w-5 inline-block mr-1 !fill-sky-500" /> Caricamento in
              corso
            </p>
          )}
        </div>
        <input id="dropzone-file" type="file" onChange={handleFileSelect} className="hidden" />
      </label>
    </div>
  );
};

export default DocumentUploader;
