import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { getCurrentUser, getDiscovery } from '@/api/discoveries';
import { stubReviewerL3 } from '@/api/stubs/discoveries';
import type { UserProfile } from '@/types/discovery';
import { AppSidebar } from '@/components/AppSidebar';
import { ToastProvider } from '@/hooks/useToast';
import { TopNav } from './TopNav';

export function Layout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [detailTitle, setDetailTitle] = useState<string | undefined>();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const tab = (searchParams.get('tab') as 'all' | 'pending' | 'expiring') || 'all';
  const onDiscoveriesList = location.pathname === '/discoveries';
  const onDetail = location.pathname.startsWith('/discoveries/') && params.id;

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (onDetail && params.id) {
      getDiscovery(params.id).then((d) => {
        if (d) setDetailTitle(`Обнаружение ${d.id} • ${d.shortTitle}`);
      });
    } else {
      setDetailTitle(undefined);
    }
  }, [onDetail, params.id]);

  if (!user) {
    return <div className="page-loading">Загрузка…</div>;
  }

  const navUser = onDetail
    ? { name: stubReviewerL3.name, line: stubReviewerL3.line, initials: stubReviewerL3.initials, location: user.location }
    : user;

  return (
    <ToastProvider>
      <div className="app-shell">
        <TopNav
          user={navUser}
          detailTitle={detailTitle}
          showDiscoveryTabs={onDiscoveriesList}
          activeTab={tab}
          counter={onDiscoveriesList ? { current: 12, total: 122 } : undefined}
        />
        <div className="app-body">
          <AppSidebar />
          <main className="page-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
