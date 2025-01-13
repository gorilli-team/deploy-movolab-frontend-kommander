import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SettingsPage from '../../../../components/Settings/SettingsPage';
import { UserContext } from '../../../../store/UserContext';
import { CLIENT_ROLE_ADMIN, http } from '../../../../utils/Utils';
import VersionsTable from '../../../../components/Vehicles/Versions/VersionsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import FilterSelectField from '../../../../components/Form/FilterSelectField';

import { useHistory, useLocation } from 'react-router-dom';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Versions = () => {
  const history = useHistory();
  const search = useLocation().search;
  const [from, setFrom] = useState(0);

  const userContext = useContext(UserContext);
  let userData = userContext.data || {};
  const clientId = userData?.client?._id;

  const [versionsCount, setVersionsCount] = useState(0);
  const [versions, setVersions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(
    new URLSearchParams(search).get('marca') || undefined,
  );
  const [selectedModel, setSelectedModel] = useState(
    new URLSearchParams(search).get('modello') || undefined,
  );

  const fetchBrands = async () => {
    try {
      const response = await http({ url: '/vehicles/brand' });
      setBrands(
        response.brands.map((brand) => ({
          value: brand._id,
          label: brand.brandName,
        })),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const fetchModels = async (brandId) => {
    try {
      if (!brandId) return;
      const response = await http({ url: `/vehicles/model/byBrand/${brandId}` });
      if (!response.model) return;
      setModels(
        response.model.map((model) => {
          return { value: model._id, label: model.modelName };
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const setSelectedBrandAndReload = (brandId) => {
    setSelectedBrand(brandId);
    fetchModels(brandId);
    fetchVersions(brandId, undefined, 0, 10);
    history.push(`/settings/veicoli/versioni?marca=${brandId}`);
  };

  const setSelectedModelAndReload = (model) => {
    setSelectedModel(model);
    fetchVersions(selectedBrand, model, 0, 10);
    history.push(`/settings/veicoli/versioni?marca=${selectedBrand}&modello=${model}`);
  };

  useEffect(() => {
    fetchVersions(undefined, undefined, 0, 10);
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVersions = async (brandId, modelId, skip = 0, limit = 10) => {
    try {
      let response;
      if (brandId) {
        response = await http({
          url: `/vehicles/version?skip=${skip}&limit=${limit}&brandId=${brandId}&modelId=${modelId}`,
        });
      } else {
        response = await http({
          url: `/vehicles/version?skip=${skip}&limit=${limit}&sortBy=lastCreated`,
        });
      }
      setVersions(response.versions);
      setVersionsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  const precFunction = () => {
    if (from - 10 < 0) return;
    fetchVersions(selectedBrand, selectedModel, from - 10, 10);
    setFrom(from - 10);
  };

  const succFunction = () => {
    if (from + 10 > versionsCount) return;
    fetchVersions(selectedBrand, selectedModel, from + 10, 10);
    setFrom(from + 10);
  };

  return (
    <SettingsPage canAccess={CLIENT_ROLE_ADMIN}>
      <div className="flex justify-between items-center">
        <TableHeader
          tableName={'Versioni'}
          buttons={[
            {
              function: () => {
                history.push('/settings/veicoli/versioni/crea');
              },
              label: 'Aggiungi versione',
              svgIco: <PlusOutlineCircle />,
            },
          ]}
          length={versionsCount}
        />
        <div className="flex justify-end gap-2 mr-6">
          <FilterSelectField
            onChange={(e) => setSelectedBrandAndReload(e.target.value)}
            emptyOption={{ label: 'Tutte le marche' }}
            defaultValue={brands.find((brand) => brand.value === selectedBrand)}
            options={brands}
          />
          {selectedBrand && (
            <FilterSelectField
              onChange={(e) => setSelectedModelAndReload(e.target.value)}
              emptyOption={{ label: 'Tutti i modelli' }}
              defaultValue={models.find((model) => model.value === selectedModel)}
              options={models}
            />
          )}
        </div>
      </div>

      <VersionsTable
        elements={versions}
        from={from + 1}
        to={from + 10}
        count={versionsCount}
        precFunction={precFunction}
        succFunction={succFunction}
        role={CLIENT_ROLE_ADMIN}
        clientId={clientId}
      />
    </SettingsPage>
  );
};

export default Versions;
