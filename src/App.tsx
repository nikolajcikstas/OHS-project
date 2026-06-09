import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { DiscoveriesPage } from '@/pages/DiscoveriesPage';
import { DiscoveryDetailPage } from '@/pages/DiscoveryDetailPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="discoveries" element={<DiscoveriesPage />} />
        <Route path="discoveries/:id" element={<DiscoveryDetailPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
