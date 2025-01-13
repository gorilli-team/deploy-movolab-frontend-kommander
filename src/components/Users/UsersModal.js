import React, { useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../utils/Utils';
import { useForm } from 'react-hook-form';
import { FaCheck, FaFolderPlus, FaUserPlus, FaPen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ToggleSwitch from '../UI/ToggleSwitch';
import AWS from 'aws-sdk';

import { TextField as TextInternal } from '../../components/Form/TextField';
import Button from '../UI/buttons/Button';
import { filterDataByValue } from '../../utils/Utils';
import { UserContext } from '../../store/UserContext';

import NewPersonalDetails from './NewUser/NewPersonalDetails';
import NewResidence from './NewUser/NewResidence';
import NewDrivingLicense from './NewUser/NewDrivingLicense';
import Modal from '../UI/Modal';
import ModalConfirmDialog from '../UI/ModalConfirmDialog';

const UsersModal = ({
  inputType,
  closeModal,
  returnUser,
  returnUserCompany,
  excludeUser,
  requiredSection = 'search',
  openUserCompaniesModal,
  workflow,
}) => {
  const form = useForm();

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-1',
    signatureVersion: 'v4',
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUserCompanies, setFilteredUserCompanies] = useState([]);
  const [userCompanies, setUserCompanies] = useState([]);
  const [section, setSection] = useState(requiredSection);
  const [mode, setMode] = useState('add'); // ['add', 'modify']
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [type, setType] = useState(inputType || 'driver'); // ['driver', 'customer', 'secondDriver']
  const [imgToUpload, setImgToUpload] = useState('');
  const [showUserCompanies, setShowUserCompanies] = useState(false);
  const [showCloseModalMessage, setShowCloseModalMessage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  //eslint-disable-next-line
  const [avatar, setAvatar] = useState(undefined);
  //eslint-disable-next-line
  const [uploaded, setUploaded] = useState(false);
  //eslint-disable-next-line
  const [uploadingImg, setUploadingImg] = useState();

  const { data: currentClient } = useContext(UserContext);
  const usageMode = window.location.pathname.split('/')[1];

  useEffect(() => {
    fetchUsers();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      if (usageMode === 'corporate') {
        const response = await http({
          url: `/users/corporate?userType=driver&exclude=${excludeUser}`,
        });
        setUsers(response.users);
        setFilteredUsers(response.users);
        return;
      }

      if (type === 'secondDriver') {
        const response = await http({ url: `/users?userType=driver&exclude=${excludeUser}` });
        setUsers(response.users);
        setFilteredUsers(response.users);
        return;
      }

      const response = await http({ url: `/users?userType=${type}&exclude=${excludeUser}` });
      setUsers(response.users);
      setFilteredUsers(response.users);

      let responseCompanies;
      if (workflow === undefined) {
        responseCompanies = await http({ url: `/userCompanies` });
      } else {
        responseCompanies = await http({ url: `/userCompanies?workflow=${workflow}` });
      }

      setUserCompanies(responseCompanies.userCompanies);
      setFilteredUserCompanies(responseCompanies.userCompanies);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const searchUsers = async () => {
    try {
      const usersQuery = form.getValues('queryUsers');
      if (usersQuery === '' || usersQuery === null || usersQuery === undefined) {
        if (showUserCompanies) {
          return setFilteredUserCompanies(userCompanies);
        } else {
          return setFilteredUsers(users);
        }
      }

      if (showUserCompanies) {
        const filteredCompanies = userCompanies.filter((userCompany) => {
          return filterDataByValue(userCompany, usersQuery);
        });
        return setFilteredUserCompanies(filteredCompanies);
      } else {
        const filtered = users.filter((user) => {
          return filterDataByValue(user, usersQuery);
        });

        return setFilteredUsers(filtered);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const importUser = async (userId) => {
    try {
      if (userId === undefined || userId === null) return;

      const user = await http({ url: `/users/${userId}` });

      setUser(user);
      if (user.imageUrl) setImageUrl(user.imageUrl);

      if (usageMode === 'corporate') {
        if (user.userCompanies.includes(currentClient?.client?._id)) {
          return toast.error('Utente già importato');
        }
        const userCompanies = [...user.userCompanies, currentClient?.userCompany];
        const response = await http({
          method: 'PUT',
          url: `/users/${user._id}`,
          form: {
            ...user,
            userCompanies,
          },
        });
        returnUser(response);
        toast.success('Utente importato');
      } else {
        if (user.clients.includes(currentClient?.client?._id))
          return toast.error('Utente già importato');
        const userClients = [...user.clients, currentClient?.client?._id];

        const response = await http({
          method: 'PUT',
          url: `/users/${user._id}`,
          form: {
            ...user,
            clients: userClients,
          },
        });
        returnUser(response);
        toast.success('Utente importato');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const imageUploadElement = useRef();

  const handleImageUploadClick = () => {
    imageUploadElement.current.click();
  };

  const imageChangeHandler = async (event) => {
    if (!event.target.files?.length) return;

    setImgToUpload(URL.createObjectURL(event.target.files[0]));
    setAvatar(event.target.files[0]);
    await userImageUploader(event.target.files[0]);
  };

  const userImageUploader = async (avatarFile) => {
    const s3 = new AWS.S3();
    const file = avatarFile;

    if (!file) {
      return;
    }
    const params = {
      Bucket: 'movolab-car-models',
      Key: `USER-${Date.now()}.${file.name}`,
      Body: file,
    };
    setUploadingImg(true);
    const { Location } = await s3.upload(params).promise();
    form.setValue('imageUrl', Location);
    setUploadingImg(false);
    setUploaded(true);

    if (mode === 'modify') {
      await http({
        method: 'PUT',
        url: `/users/${user._id}`,
        form: form.getValues(),
      });
      toast.success('Immagine aggiornata con successo');
    } else {
      toast.success('Immagine caricata con successo');
    }
  };

  const updateUserId = (userId) => {
    if (userId === undefined || userId === null) return;
    setUserId(userId);
  };

  const updateSection = (section) => {
    if (section === 'modal-completed') return closeModal();
    if (section === 'close-modal') {
      return exitFromModal();
    }
    setSection(section);
  };

  const exitFromModal = () => {
    if (section === 'choose' || section === 'search') {
      closeModal();
      return;
    }
    if (section === 'personal-details' && mode === 'modify') {
      closeModal();
      return;
    }
    setShowCloseModalMessage(true);
  };

  const manageReturnUser = (user) => {
    toast.success('Utente aggiornato e aggiunto con successo');
    returnUser(user);
  };

  const updateMode = (mode) => {
    setMode(mode);
  };

  const moveScreen = (section, mode) => {
    setMode(mode);
    setSection(section);
  };

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
          section === 'search' ? (
            `Seleziona ${
              type === 'driver'
                ? 'conducente'
                : type === 'secondDriver'
                ? 'secondo conducente'
                : showUserCompanies
                ? 'azienda'
                : 'persona'
            }`
          ) : mode === 'modify' ? (
            <>
              Modifica {user?.name} {user?.surname}
              <Link
                to={`/dashboard/utenti/persona/${user?._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sky-600 text-sm ml-2 font-medium"
              >
                Scheda utente &raquo;
              </Link>
            </>
          ) : section === 'choose' ? (
            <>Seleziona cliente o conducente</>
          ) : (
            `Aggiungi ${
              type === 'driver'
                ? 'conducente'
                : type === 'secondDriver'
                ? 'secondo conducente'
                : 'cliente'
            }`
          )
        }
      >
        <div className="absolute top-0 right-0 px-6 py-4">
          <div className="flex">
            {section !== 'search' && section !== 'choose' && (
              <div className="col-span-1">
                <div
                  className="shadow-sm relative cursor-pointer"
                  style={{
                    backgroundImage: `url(${imgToUpload || imageUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    borderRadius: '5em',
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
                    id="myImage"
                    name="myImage"
                    accept="image/*"
                    onChange={(e) => imageChangeHandler(e)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {section === 'choose' && (
          <div className="relative flex-auto">
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <Button
                btnStyle="stitchedArea"
                type="submit"
                className="py-6 font-semibold"
                onClick={() => {
                  setType('customer');
                  moveScreen('personal-details', 'add');
                }}
              >
                Inserisci cliente
              </Button>
              <Button
                btnStyle="stitchedArea"
                type="submit"
                className="py-6 font-semibold"
                onClick={() => {
                  setType('driver');
                  moveScreen('personal-details', 'add');
                }}
              >
                Inserisci conducente
              </Button>
            </div>
          </div>
        )}
        {section === 'search' && (
          <div className="relative flex-auto">
            <div className={`flex ${type === 'customer' ? 'flex-wrap' : ''} gap-2`}>
              <TextInternal
                form={form}
                name="queryUsers"
                type="string"
                className="mb-0"
                placeholder="..."
                inputClassName="!border-slate-300 rounded-l-lg rounded-r-none"
                buttonRight={
                  <button
                    type="button"
                    onClick={searchUsers}
                    className="rounded-r-lg border-r border-t border-b border-slate-300 whitespace-nowrap text-sm sm:w-auto xs:w-auto enabled:hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed sm:mb-0 px-3 py-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 mb-1 mr-1 inline"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    Cerca
                  </button>
                }
                inputGroupClassName="flex"
              />

              {!showUserCompanies ? (
                <Button
                  btnStyle="whiteLightButton"
                  type="submit"
                  className="text-nowrap"
                  onClick={() => {
                    moveScreen('personal-details', 'add');
                  }}
                >
                  <FaUserPlus className="inline mt-[-3px]" /> Nuova<span className="hidden md:inline"> persona</span>
                </Button>
              ) : (
                <Button
                  btnStyle="whiteLightButton"
                  type="submit"
                  className="text-nowrap"
                  onClick={() => {
                    openUserCompaniesModal();
                  }}
                >
                  <FaFolderPlus className="inline mt-[-3px]" /> Nuova <span className="hidden md:inline"> azienda</span>
                </Button>
              )}
              {type === 'customer' && (
                <ToggleSwitch
                  className="mt-[3px] ml-2"
                  switches={[
                    {
                      label: 'Persone',
                      onClick: (e) => {
                        setShowUserCompanies(false);
                      },
                    },
                    {
                      label: 'Aziende',
                      onClick: (e) => {
                        setShowUserCompanies(true);
                      },
                    },
                  ]}
                />
              )}
            </div>
            {showUserCompanies ? (
              <div className="my-2 text-gray-800 leading-relaxed h-96 max-h-[80vh] overflow-y-auto">
                {filteredUserCompanies.map((userCompany, index) => {
                  return (
                    <div
                      className={`flex border-x border-b border-slate-300 
                      ${index === 0 && 'border-t rounded-t-lg'} ${
                        index === filteredUserCompanies.length - 1 && 'rounded-b-lg'
                      } `}
                      key={index}
                    >
                      <div className="flex-1 w-96 min-h-10 py-2 px-3">
                        <p>
                          {userCompany.ragioneSociale} - {userCompany.partitaIva}
                        </p>
                      </div>
                      <div className="flex-none mx-1 m-auto">
                        <Button
                          btnStyle="whiteSkyLightButton"
                          className="p-2 color-sky-600"
                          onClick={() => {
                            // setUser(userCompany);
                            // if (userCompany.imageUrl) setImageUrl(userCompany.imageUrl);
                            // setUserId(userCompany._id);
                            // moveScreen('personal-details', 'modify');
                            openUserCompaniesModal(userCompany._id);
                          }}
                        >
                          <FaPen />
                        </Button>
                      </div>
                      <div className="mx-1 m-auto">
                        <Button
                          btnStyle="blue"
                          className="p-2 border border-sky-600"
                          onClick={() => {
                            returnUserCompany(userCompany);
                          }}
                        >
                          <FaCheck />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="my-2 text-gray-800 leading-relaxed h-96 max-h-[80vh] overflow-y-auto overflow-x-hidden">
                {filteredUsers.map((user, index) => {
                  return (
                    <div
                      className={`flex border-x border-b border-slate-300 
                      ${index === 0 && 'border-t rounded-t-lg'} ${
                        index === filteredUsers.length - 1 && 'rounded-b-lg'
                      } `}
                      key={index}
                    >
                      <div className="flex-1 min-h-10 p-2 px-3">
                        <p>
                          {user.name} {user.surname}
                        </p>
                      </div>
                      <div className="flex-none mx-1 m-auto">
                        <Button
                          btnStyle="whiteSkyLightButton"
                          className="p-2 color-sky-600"
                          onClick={() => {
                            setUser(user);
                            if (user.imageUrl) setImageUrl(user.imageUrl);
                            setUserId(user._id);
                            moveScreen('personal-details', 'modify');
                          }}
                        >
                          <FaPen />
                        </Button>
                      </div>
                      <div className="mx-1 m-auto">
                        <Button
                          btnStyle="blue"
                          className="p-2 border border-sky-600"
                          onClick={() => {
                            returnUser(user);
                          }}
                        >
                          <FaCheck />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {section === 'personal-details' && (
          <NewPersonalDetails
            type={type}
            updateSection={updateSection}
            updateUserId={updateUserId}
            returnUser={manageReturnUser}
            importUser={importUser}
            updateMode={updateMode}
            userId={userId}
            mode={mode}
            returnImage={setImageUrl}
            backToListFn={() => {
              moveScreen(requiredSection, 'add');
            }}
          />
        )}
        {section === 'residence' && (
          <NewResidence
            type={type}
            updateSection={updateSection}
            userId={userId}
            returnUser={manageReturnUser}
            importUser={importUser}
            mode={mode}
          />
        )}
        {section === 'driving-license' && (
          <NewDrivingLicense
            type={type}
            updateSection={updateSection}
            userId={userId}
            returnUser={manageReturnUser}
            importUser={importUser}
            mode={mode}
          />
        )}
      </Modal>

      <ModalConfirmDialog
        isVisible={showCloseModalMessage}
        description={
          userId !== null && userId !== undefined ? (
            <>
              Utente inserito solo parzialmente,
              <br />i dati non salvati andranno persi.
            </>
          ) : (
            'Utente non inserito. Nessun dato salvato.'
          )
        }
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

export default UsersModal;
