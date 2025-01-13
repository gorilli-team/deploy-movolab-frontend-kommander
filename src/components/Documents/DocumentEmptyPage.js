import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../store/UserContext';

const DocumentEmptyPage = ({ children, canAccess = false, loading, bodyClassName }) => {
  const userContext = useContext(UserContext);
  const history = useHistory();
  let userData = userContext.data || {};
  //  const [userLoading, setUserLoading] = useState(!userData.id);

  useEffect(() => {
    if (canAccess === false) return;

    const fetch = async () => {
      try {
        let user = userData;
        if (!user.id) user = await userContext.getUserInfo();
        // if (!user.emailVerified)
        //   history.push(
        //     `/confirmAddress?${new URLSearchParams({ redirect: document.location.pathname })}`,
        //   );
        if (canAccess && canAccess.indexOf(user.role) < 0) throw new Error('Unauthorized');
        if (!user.client) history.push('/settings/clientInfo');
        // setUserLoading(false);
      } catch (e) {
        console.error(e);
        // user logged in, but not authorized to page
        if (e === 'Unauthorized') history.push('/dashboard');
        // user not logged in
        else
          history.push(`/signin?${new URLSearchParams({ redirect: document.location.pathname })}`);
      }
    };
    fetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // if (userLoading) {
  //   return <div className="p-5 text-center">Loading...</div>;
  // }

  return (
    <>
      <div className="flex flex-col screen:bg-gray-400">
        {/*  Page content */}
        <main className="screen:bg-gray-400 relative flex h-screen">
          <div
            className="grow screen:bg-slate-100 text-gray-800 overflow-y-auto print:overflow-y-hidden"
            id="bodyPage"
          >
            {loading ? (
              <div className="p-5 text-center">Loading...</div>
            ) : (
              <div className={bodyClassName || 'p-2'}>{children}</div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DocumentEmptyPage;
