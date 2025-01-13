import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../../utils/Utils';
import AdminPage from '../../../../components/Admin/AdminPage';
import BrandsTable from '../../../../components/Vehicles/Brands/BrandsTable';
import TableHeader from '../../../../components/UI/TableHeader';
import PlusOutlineCircle from '../../../../assets/icons/PlusOutlineCircle';

const Brands = () => {
  const history = useHistory();
  const [brandsCount, setBrandsCount] = useState(0);

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await http({ url: '/vehicles/brand' });
      setBrandsCount(response.count);
    } catch (err) {
      console.error(err);
      toast.error(err?.reason?.error || 'Errore');
    }
  };

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      <TableHeader
        tableName={'Marche'}
        buttons={[
          {
            function: () => {
              history.push('/admin/veicoli/marche/crea');
            },
            label: 'Aggiungi marca',
            svgIco: <PlusOutlineCircle />,
          },
        ]}
        length={brandsCount}
      />

      <BrandsTable role={MOVOLAB_ROLE_ADMIN} />
    </AdminPage>
  );
};

export default Brands;
