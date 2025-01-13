import AWS from 'aws-sdk';
import React, { useEffect, useState } from 'react';

const ImageUploader = (props) => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  useEffect(() => {
    setImagePath(props.imageUrl);
  }, [props.imageUrl]);

  const s3 = new AWS.S3();
  const [imagePath, setImagePath] = useState(props.imageUrl || null);

  const handleFileSelect = (e) => {
    const getResult = uploadToS3(e.target.files[0]);
    return getResult;
  };

  const uploadToS3 = async (file) => {
    if (!file) {
      return;
    }
    const params = {
      Bucket: 'movolab-car-models',
      Key: `${Date.now()}.${file.name}`,
      Body: file,
    };
    const { Location } = await s3.upload(params).promise();
    setImagePath(Location);
    props.updateImageUrl(Location);
  };

  return (
    <>
      <input type="file" onChange={handleFileSelect} className="w-full" />
      {(imagePath || props.imageUrl) && (
        <div className="mt-3">
          {<img className="h-32" src={imagePath || props.imageUrl} alt="uploaded" />}
        </div>
      )}
    </>
  );
};

export default ImageUploader;
