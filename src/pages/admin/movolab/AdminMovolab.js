import React, { useState, useEffect } from 'react';
import AdminPage from '../../../components/Admin/AdminPage';
import { MOVOLAB_ROLE_ADMIN, http } from '../../../utils/Utils';
import Button from '../../../components/UI/buttons/Button';

const AdminPriceLists = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    await http({
      url: '/admin/stats/pricing',
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
          <h2 className="font-semibold text-gray-800 text-2xl">Pricing</h2>
        </div>
      ),
      tiles: [
        {
          name: 'Listini',
          link: '/admin/movolab/listini',
          count: stats.priceListsCount || 0,
        },
        {
          name: 'Tariffe',
          link: '/admin/movolab/tariffe',
          count: stats.faresCount || 0,
        },
        {
          name: 'Fasce',
          link: '/admin/movolab/fasce',
          count: stats.rangesCount || 0,
        },
        {
          name: 'Franchigie',
          link: '/admin/movolab/franchigie',
          count: stats.franchisesCount || 0,
        },
        {
          name: 'Extra',
          link: '/admin/movolab/extra',
          count: stats.extrasCount || 0,
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

export default AdminPriceLists;
