import React, { useState, useEffect } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import Button from '../../../components/UI/buttons/Button';

const AdminFleet = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    await http({
      url: '/admin/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
      .then((response) => {
        setStats(response);
      })
      .catch((error) => {
        console.error('error', error);
      });
  };

  const dashboard_section = [
    {
      section_title: (
        <div className="pl-5 pt-5">
          <h2 className="font-semibold text-gray-800 text-2xl">Statistiche flotta</h2>
        </div>
      ),
      tiles: [
        {
          name: 'Marche',
          link: '/admin/veicoli/marche',
          count: stats.brandsCount || 0,
        },
        {
          name: 'Modelli',
          link: '/admin/veicoli/modelli',
          count: stats.modelsCount || 0,
        },
        {
          name: 'Versioni',
          link: '/admin/veicoli/versioni',
          count: stats.versionsCount || 0,
        },
      ],
    },
  ];

  return (
    <AdminPage canAccess={MOVOLAB_ROLE_ADMIN}>
      {dashboard_section.map(({ tiles, section_title }) => (
        <>
          {section_title}
          <div className="flex flex-wrap p-4 gap-4">
            {tiles.map((tile, key) => (
              <Button
                btnStyle="gray"
                key={key}
                to={tile.link}
                className="flex flex-col py-4 px-5 min-w-[8em] bg-slate-400 text-white !text-lg !font-light"
              >
                <h5 className="font-bold">{tile.name}</h5>
                <p>{tile.count}</p>
              </Button>
            ))}
          </div>
        </>
      ))}
    </AdminPage>
  );
};

export default AdminFleet;
