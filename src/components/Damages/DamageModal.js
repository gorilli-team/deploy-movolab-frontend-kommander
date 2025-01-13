import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { TextareaField } from '../Form/TextareaField';
import { SelectField } from '../Form/SelectField';
import Modal from '../UI/Modal';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';

import AWS from 'aws-sdk';

import Button from '../UI/buttons/Button';
import FormLabel from '../UI/FormLabel';
import { vehicleParts } from '../../utils/Damages';
import ToggleSwitch from '../UI/ToggleSwitch';

const DamageModal = ({
  vehicleId,
  damage,
  phase,
  rentId,
  groupId,
  isViewMode = false,
  vehiclePart,
  relativeX,
  relativeY,
  closeModal = () => {},
  returnDamage = () => {},
  updatePrice = () => {},
}) => {
  const form = useForm();

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const exampleUrl =
    'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

  const [imgToUpload, setImgToUpload] = useState('');
  const [mode] = useState(damage ? 'edit' : 'create');

  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);
  const [imageUrl, setImageUrl] = useState(damage?.imageUrl || exampleUrl);
  const [xPosition] = useState(relativeX);
  const [yPosition] = useState(relativeY);
  const [damageLevel, setDamageLevel] = useState(damage?.damageLevel || 'medium');
  const [groupDamagePrices, setGroupDamagePrices] = useState([]);
  const [damageStatus, setDamageStatus] = useState(damage?.status || 'open');

  if (damage !== undefined) {
    form.setValue('description', damage.description);
    form.setValue('damageType', damage.damageType);
    form.setValue('imageUrl', damage.imageUrl);
    form.setValue('status', damage.status);
    form.setValue('vehiclePart', damage.vehiclePart);
    form.setValue('area', damage.area);
  }

  const imageUploadElement = useRef();

  useEffect(() => {
    form.setValue('damageLevel', damageLevel);
    form.setValue('vehiclePart', vehiclePart);
    getDamagePrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDamagePrices = async () => {
    const response = await http({ url: `/pricing/damages` });

    setGroupDamagePrices(
      response?.damages?.filter((damage) => {
        return damage.group?._id === groupId;
      }),
    );
  };

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const handleDamageLevelClick = (damageLevel) => {
    setDamageLevel(damageLevel);
    form.setValue('damageLevel', damageLevel);
  };

  const onSubmit = async (data) => {
    data = {
      ...data,
      damageLevel,
      xPosition,
      yPosition,
      phase,
      imageUrl: imageUrl !== exampleUrl ? imageUrl : '',
      status: damageStatus,
    };

    if (phase === 'dropOff') {
      if (mode !== 'edit' || (damage.rentId && damage.phase === 'dropOff')) {
        data.rentId = rentId;

        const damageCost = groupDamagePrices?.find(
          (damage) => damage?.vehiclePart === data?.vehiclePart,
        )?.damageType[data?.damageType][data?.damageLevel];

        if (!damageCost) {
          toast.error(
            'Tipo danno non trovato, impostato prezzo a 0. Aggiorna i prezzi nel pannello di amministrazione.',
          );
          data.damageCost = 0;
        } else {
          data.damageCost = damageCost;
        }
      }
    }

    if (!vehicleId) return toast.error('Errore: veicolo non trovato');

    if (mode === 'edit') {
      const result = await http({
        url: `/vehicles/vehicle/damages/update/${vehicleId}/${damage._id}`,
        method: 'POST',
        form: data,
      });
      toast.success('Danno aggiornato con successo');

      updatePrice(result.rent);
    } else {
      const result = await http({
        url: `/vehicles/vehicle/damages/add/${vehicleId}`,
        method: 'POST',
        form: data,
      });
      toast.success('Danno inserito con successo');

      updatePrice(result.rent);
    }
    returnDamage();
    closeModal();
  };

  const imageChangeHandler = async (event) => {
    if (!event.target.files?.length) return;

    setImgToUpload(URL.createObjectURL(event.target.files[0]));
    await damageImageUploader(event.target.files[0]);
  };

  const damageImageUploader = async (damageFile) => {
    const s3 = new AWS.S3();
    const file = damageFile;

    if (!file || file === exampleUrl) {
      return;
    }

    const params = {
      Bucket: 'movolab-car-damages',
      Key: `DAMAGE-${Date.now()}.${file.name}`,
      Body: file,
    };
    // setUploadingImg(true);
    const { Location } = await s3.upload(params).promise();
    form.setValue('imageUrl', Location);
    setImageUrl(Location);
    // setUploadingImg(false);
    // setUploaded(true);

    if (mode === 'modify') {
      toast.success('Immagine aggiornata con successo');
    } else {
      toast.success('Immagine caricata con successo');
    }
  };

  const exitFromModal = () => {
    if (!isViewMode) setShowCloseModalMessage(true);
    else closeModal();
  };

  const damageLevels = [
    {
      level: 'low',
      label: 'Danno lieve',
      style: 'levelGreen',
    },
    {
      level: 'medium',
      label: 'Danno medio',
      style: 'levelYellow',
    },
    {
      level: 'high',
      label: 'Danno grave',
      style: 'levelRed',
    },
  ];

  return (
    <>
      <Modal
        isVisible={true}
        size="sm"
        bgClassName="items-start"
        className="md:mt-28"
        onClose={(e) => {
          e.preventDefault();
          exitFromModal();
        }}
        innerClassName="px-6 py-4 relative"
        headerChildren={
          (damage ? (isViewMode ? 'Visualizza' : 'Aggiorna') : 'Inserisci') + ' danno'
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-x-3 flex-col md:flex-row">
            <SelectField
              form={form}
              name="vehiclePart"
              options={vehicleParts}
              type="string"
              placeholder="Parte del Veicolo"
              label="Parte del Veicolo"
              validation={{
                required: { value: true, message: 'Specificare parte del veicolo' },
              }}
              className="w-full"
              disabled={isViewMode}
            />
            <SelectField
              form={form}
              name="damageType"
              options={[
                { label: 'Graffio', value: 'scratch' },
                { label: 'Ammaccatura', value: 'dent' },
                { label: 'Crepa', value: 'crack' },
                { label: 'Rottura', value: 'break' },
                { label: 'Foro', value: 'hole' },
                { label: 'Lacerazione', value: 'tear' },
                { label: 'Altro', value: 'other' },
              ]}
              type="string"
              placeholder="Tipo danno"
              label="Tipo danno"
              className="w-full"
              validation={{
                required: { value: true, message: 'Specificare il tipo di danno' },
              }}
              disabled={isViewMode}
            />
          </div>
          <div>
            <FormLabel>Stato</FormLabel>
            <ToggleSwitch
              switches={[
                {
                  label: 'Aperto',
                  selected: damageStatus === 'open',
                  onClick: () => setDamageStatus('open'),
                },
                {
                  label: 'Chiuso',
                  selected: damageStatus === 'closed',
                  onClick: () => setDamageStatus('closed'),
                },
              ]}
              disabled={isViewMode}
            />
          </div>
          <div>
            <FormLabel>Entità danno</FormLabel>
            <div className="flex gap-2 flex-wrap md:flex-wrap">
              {damageLevels.map((btn) => (
                <div className="w-32" key={btn.level}>
                  <Button
                    btnStyle={btn.style}
                    selected={damageLevel === btn.level}
                    disabled={isViewMode}
                    className="w-full !py-1 md:!py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isViewMode) return;
                      handleDamageLevelClick(btn.level);
                    }}
                  >
                    {btn.label}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <TextareaField
              form={form}
              name="description"
              type="string"
              placeholder="Descrizione"
              label="Descrizione"
              rows={2}
              disabled={isViewMode}
            />
          </div>
          <div className="mr-3 w-[300px]">
            <FormLabel>Foto</FormLabel>
            {!isViewMode && (
              <div
                className="shadow-sm relative cursor-pointer "
                style={{
                  backgroundImage: `url(${imgToUpload || imageUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  width: '80px',
                  height: '80px',
                  marginBottom: '0.2em',
                }}
                onClick={() => handleImageUploadClick()}
              >
                <input
                  ref={imageUploadElement}
                  className="hidden"
                  type="file"
                  id="imageUrl"
                  name="imageUrl"
                  accept="image/*"
                  onChange={(e) => imageChangeHandler(e)}
                />
              </div>
            )}
            {isViewMode && (
              <div
                className="shadow-sm relative"
                style={{
                  backgroundImage: `url(${imgToUpload || imageUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  width: '150px',
                  height: '150px',
                  marginBottom: '0.2em',
                }}
              ></div>
            )}
          </div>

          {isViewMode ? (
            ''
          ) : (
            <div className="flex justify-end py-1">
              <Button className="py-1" btnStyle="blue">
                {mode === 'edit' ? 'Aggiorna' : 'Inserisci'}
              </Button>
            </div>
          )}
        </form>
      </Modal>

      <ModalConfirmDialog
        isVisible={showCloseModalMessage}
        description="Danno non inserito. Nessun dato salvato."
        handleCancel={() => {
          setShowCloseModalMessage(false);
        }}
        handleOk={() => {
          closeModal();
        }}
      />
    </>
  );
};

export default DamageModal;
