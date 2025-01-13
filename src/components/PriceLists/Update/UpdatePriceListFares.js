import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../store/UserContext';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import { http } from '../../../utils/Utils';
import toast from 'react-hot-toast';
import { SelectField } from '../../Form/SelectField';
import { groupColors } from '../../../utils/Colors';
import { MOVOLAB_ROLE_ADMIN, CLIENT_ROLE_ADMIN } from '../../../utils/Utils';
import Button from '../../UI/buttons/Button';

const UpdatePriceListFares = (props) => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const [groups, setGroups] = useState([]);
  const [fares, setFares] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [priceList, setPriceList] = useState({});
  const groupToVisualize = props.groupToVisualize;
  const [group, setGroup] = useState(groupToVisualize || null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: currentClient } = useContext(UserContext);
  const isAdmin = currentClient?.role === MOVOLAB_ROLE_ADMIN;
  const isClientAdmin = currentClient?.role === CLIENT_ROLE_ADMIN;

  useEffect(() => {
    fetchPriceList();
    fetchGroups();
    fetchRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    fetchAllFares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceList]);

  const fetchPriceList = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/pricing/priceLists/${params.id}?mode=flat` });

        setPriceList(response);
        form.setValue('fares', response.fares);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await http({ url: `/groups` });
      setGroups(response.groups);
      if (groupToVisualize) {
        setGroup(response.groups.filter((group) => group?._id === groupToVisualize)[0]);
        form.setValue('group', groupToVisualize);
      } else {
        setGroup(response.groups[0]);
        form.setValue('group', response.groups[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchRanges = async () => {
    try {
      const response = await http({ url: `/pricing/range/priceList/${params.id}` });
      setRanges(response.ranges);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchAllFares = async () => {
    try {
      if (!priceList || !priceList?._id) return;
      const licenseType = priceList?.licenseType;
      let response;
      if (licenseType === 'movolab') {
        response = await http({ url: `/fares?type=${licenseType}` });
      } else {
        response = await http({ url: `/fares?type=${licenseType}&client=${priceList.client}` });
      }

      setFares(
        response.fares.map((fare) => {
          return {
            value: fare._id,
            group: { _id: fare.group?._id },
            range: { _id: fare.range?._id },
            label: `Base: ${fare.baseFare} | Giorni Extra: ${fare.extraDayFare} | KM Giorno: ${fare.freeDailyKm} | KM Extra: ${fare.extraKmFare}`,
          };
        }),
      );
      setIsLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const filterFares = (group, range) => {
    return fares.filter((fare) => {
      return fare?.group?._id === group?._id && fare.range?._id === range?._id;
    });
  };

  const retrieveFare = (group, range) => {
    if (priceList?.fares?.find((fare) => fare?.group === group && fare?.range === range)) {
      return priceList?.fares?.find((fare) => fare?.group === group && fare?.range === range);
    } else {
      return null;
    }
  };

  const sendToCreateFarePage = async (pricelistId, groupId, rangeId) => {
    if (isAdmin) {
      history.push(
        `/admin/movolab/tariffe/crea?listino=${pricelistId}&group=${groupId}&range=${rangeId}`,
      );
    } else {
      history.push(
        `/settings/listini/tariffe/crea?listino=${pricelistId}&group=${groupId}&range=${rangeId}`,
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      await data.fares.map((fare) => {
        if (fare.fare === undefined || fare.group === undefined || fare.range === undefined)
          return '';
        if (priceList.fares.find((f) => f.group === fare.group && f.range === fare.range)) {
          priceList.fares.find((f) => f.group === fare.group && f.range === fare.range).fare =
            fare.fare;
          return '';
        } else {
          priceList.fares.push(fare);
          return '';
        }
      });

      await http({
        url: `/pricing/priceLists/${params.id}`,
        method: 'PUT',
        form: priceList,
      });
      toast.success(`Tariffe aggiornate per gruppo \n ${group?.mnemonic} - ${group?.description}`);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  if (!isLoaded) {
    return <div>Caricamento...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="gap-4">
          <div className="flex">
            <div className="w-60 text-lg pt-2 mr-4">Seleziona gruppo</div>
            <div className="w-60">
              <SelectField
                form={form}
                name="group"
                type="text"
                options={groups.map((group) => {
                  return {
                    value: group?._id,
                    label: `${group?.mnemonic} - ${group?.description}`,
                  };
                })}
                onChangeFunction={(value) => {
                  setGroup(groups.filter((group) => group?._id === form.getValues('group'))[0]);
                  form.setValue('fares', []);
                }}
                placeholder="Gruppo"
              />
            </div>
          </div>
          <hr className="my-4 border-slate-300" />

          {group !== null && (
            <div className="flex" key={group?._id}>
              <div className="w-60 pt-2 mt-4 mr-4">
                <div className={`${groupColors(group?.mnemonic)}`}>
                  {group?.mnemonic} - {group?.description}
                </div>
              </div>
              <div>
                <>
                  {ranges?.map((range, index) => {
                    const retrievedFare = retrieveFare(group?._id, range._id);

                    if (retrievedFare === null) {
                      form.setValue(`fares.[${index}].range`, range?._id);
                      form.setValue(`fares.[${index}].group`, group?._id);
                    } else {
                      form.setValue(`fares.[${index}].range`, retrievedFare?.range);
                      form.setValue(`fares.[${index}].group`, retrievedFare?.group);
                      form.setValue(`fares.[${index}].fare`, retrievedFare?.fare);
                    }

                    return filterFares(group, range).length > 0 ? (
                      <div key={range._id}>
                        <div className="pt-2">
                          <span className="font-bold">{range.name}</span>{' '}
                          <span className="text-sm">{range.description}</span>
                        </div>
                        <div className="flex space-x-4">
                          <div style={{ width: '500px' }}>
                            <SelectField
                              form={form}
                              name={`fares.[${index}].fare`}
                              type="text"
                              options={filterFares(group, range)}
                              placeholder="Tariffa"
                            />
                          </div>
                          {isAdmin && (
                            <Button
                              btnStyle="inFormStyle"
                              onClick={() => {
                                history.push(
                                  `/admin/movolab/tariffe/crea?listino=${params.id}&group=${group?._id}&range=${range?._id}`,
                                );
                              }}
                            >
                              Crea tariffa
                            </Button>
                          )}
                          {isClientAdmin && (
                            <Button
                              btnStyle="inFormStyle"
                              onClick={() => {
                                history.push(
                                  `/settings/listini/tariffe/crea?listino=${params.id}&group=${group?._id}&range=${range?._id}`,
                                );
                              }}
                            >
                              Crea tariffa
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div key={range._id}>
                        <div className="pt-2">
                          <span className="font-bold">{range.name}</span>{' '}
                          <span className="text-sm">{range.description}</span>
                        </div>
                        <div className="flex space-x-4">
                          <div style={{ width: '500px' }} className="text-xs mt-3">
                            Nessuna tariffa disponibile per questa fascia
                          </div>
                          <Button
                            btnStyle="white"
                            onClick={() => {
                              sendToCreateFarePage(params.id, group?._id, range?._id);
                              // history.push(
                              //   `/admin/movolab/tariffe/crea?listino=${params.id}&group=${group?._id}&range=${range._id}`,
                              // );
                            }}
                          >
                            Crea tariffa
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {currentClient.role === MOVOLAB_ROLE_ADMIN ? (
                    <div>
                      <Button>Salva</Button>
                    </div>
                  ) : null}
                </>
              </div>
            </div>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default UpdatePriceListFares;
