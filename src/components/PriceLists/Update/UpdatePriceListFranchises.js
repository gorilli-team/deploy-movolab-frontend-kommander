import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import { groupColors } from '../../../utils/Colors';
import { SelectField } from '../../Form/SelectField';
import Button from '../../UI/buttons/Button';
import { UserContext } from '../../../store/UserContext';

const categories = [
  { label: 'maintenance', name: 'Manutenzione' },
  { label: 'rca', name: 'RCA' },
  { label: 'if', name: 'Incendio e Furto' },
  { label: 'pai', name: 'PAI' },
  { label: 'kasko', name: 'Kasko' },
];

const UpdatePriceListFranchises = (props) => {
  const form = useForm();
  const history = useHistory();
  const params = useParams();
  const type = props.type;
  const { data: currentClient } = useContext(UserContext);

  let createUrl = `/admin/movolab/franchigie/crea`;
  if (type === 'client') {
    createUrl = `/settings/veicoli/franchigie/crea`;
  }

  const [groups, setGroups] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [priceList, setPriceList] = useState({});
  const groupToVisualize = props.groupToVisualize;
  const [group, setGroup] = useState(groupToVisualize || null);

  useEffect(() => {
    fetchPriceList();
    fetchGroups();
    fetchAllFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getGroupFranchises(group?._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const fetchPriceList = async () => {
    try {
      if (props.mode === 'edit') {
        const response = await http({ url: `/pricing/priceLists/${params.id}?mode=flat` });

        setPriceList(response);
        form.setValue('franchises', response.franchises);
        form.setValue('franchisePriority', response.franchisePriority);
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

  const fetchAllFranchises = async () => {
    try {
      const response = await http({ url: '/vehicles/franchise' });

      setFranchises(
        response.franchises.map((franchise) => {
          return {
            value: franchise._id,
            label: `${franchise.type} -  ${franchise.value ? +franchise.value + '€' : '0€'} -  ${
              franchise.percent ? +franchise.percent + '%' : '0%'
            }`,
          };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const getGroupFranchises = async (groupId) => {
    try {
      form.setValue(
        'franchise.maintenance',
        retrieveFranchise(groupId, 'maintenance')?.franchise || null,
      );
      form.setValue('franchise.rca', retrieveFranchise(groupId, 'rca')?.franchise || null);
      form.setValue('franchise.if', retrieveFranchise(groupId, 'if')?.franchise || null);
      form.setValue('franchise.pai', retrieveFranchise(groupId, 'pai')?.franchise || null);
      form.setValue('franchise.kasko', retrieveFranchise(groupId, 'kasko')?.franchise || null);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const retrieveFranchise = (group, category) => {
    if (
      priceList?.franchises?.find(
        (franchise) => franchise?.group === group && franchise?.category === category,
      )
    ) {
      return priceList?.franchises?.find(
        (franchise) => franchise?.group === group && franchise?.category === category,
      );
    } else {
      return null;
    }
  };

  const onSubmit = async (data) => {
    try {
      categories.map((category) => {
        if (data.franchise[category.label]) {
          const franchise = {
            group: group?._id,
            category: category.label,
            franchise: data.franchise[category.label],
          };

          if (
            data.franchises.find(
              (franchise) =>
                franchise.group === group?._id && franchise.category === category.label,
            )
          ) {
            data.franchises.find(
              (franchise) =>
                franchise.group === group?._id && franchise.category === category.label,
            ).franchise = data.franchise[category.label];
          } else {
            data.franchises.push(franchise);
          }
        }
        return '';
      });

      await http({
        method: 'PUT',
        url: `/pricing/priceLists/${params.id}`,
        form: data,
      });

      await fetchPriceList();
      toast.success('Listino aggiornato');
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="priceListForm">
      <fieldset disabled={form.formState.isSubmitting}>
        <div className="gap-4">
          <div className="flex mb-2">
            <div className="w-60 text-lg pt-2 mr-4">Priorità calcolo franchigia</div>
            <div className="w-60">
              <SelectField
                form={form}
                name="franchisePriority"
                type="text"
                options={[
                  {
                    label: 'Franchigia da listino',
                    value: 'priceList',
                  },
                  {
                    label: 'Franchigia del veicolo',
                    value: 'vehicle',
                  },
                ]}
                placeholder="Dare priorità a..."
              />
            </div>
          </div>
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
                  getGroupFranchises(group?._id);
                }}
                placeholder="Gruppo"
              />
            </div>
          </div>
          <hr className="my-4 border-slate-300" />
          {group !== null && (
            <div className="flex" key={group?._id}>
              <div className={`w-60 pt-2 mt-4 mr-4`}>
                <div className={`${groupColors(group?.mnemonic)}`}>
                  {group?.mnemonic} - {group?.description}
                </div>
              </div>
              <div>
                <>
                  {categories.map((category) => {
                    return (
                      <div key={category.label}>
                        <div className="pt-2">
                          <span className="font-bold">{`Franchigia ${category.name}`}</span>{' '}
                        </div>
                        <div className="flex space-x-4">
                          <div style={{ width: '500px' }}>
                            <SelectField
                              form={form}
                              name={`franchise.${category.label}`}
                              type="text"
                              placeholder="Seleziona..."
                              options={franchises}
                            />
                          </div>
                          <Button
                            btnStyle="inFormStyle"
                            onClick={() => {
                              history.push(`${createUrl}?listino=${params.id}&group=${group?._id}`);
                            }}
                          >
                            Crea franchigia
                          </Button>{' '}
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

export default UpdatePriceListFranchises;
