import React, { useState, useEffect } from 'react';
import AdminPage from '../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN, http } from '../../utils/Utils';
import Button from '../../components/UI/buttons/Button';

const Admin = () => {
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
      section_title: null,
      tiles: [
        {
          name: 'Clienti',
          link: '/admin/clienti/anagrafica',
          count: stats.clientsCount || 0,
        },
      ],
    },
    {
      section_title: <h2 className="pl-5 pt-2 text-lg">Statistiche totali clienti</h2>,
      tiles: [
        {
          name: 'Punti Nolo',
          link: '/admin/clienti/puntinolo',
          count: stats.rentalLocationCount || 0,
        },
        {
          name: 'Veicoli',
          link: '/admin',
          count: stats.vehicleCount || 0,
        },
        {
          name: 'Prenotazioni',
          link: '/admin/clienti/prenotazioni',
          count: stats.reservationCount || 0,
        },
        {
          name: 'Movo',
          link: '/admin/clienti/movimenti',
          count: stats.rentCount || 0,
        },
      ],
    },
    {
      section_title: <h2 className="pl-5 pt-2 text-lg">Statistiche backend</h2>,
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

export default Admin;
