import { useEffect, useState } from 'react';
import { getCameras, testCameraConnection } from '@/api';
import { useToast } from '@/hooks/useToast';
import type { Camera } from '@/types';

export function CamerasPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<number | null>(null);

  useEffect(() => {
    getCameras().then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleTest(id: number) {
    setTestingId(id);
    try {
      const res = await testCameraConnection(id);
      showToast('Тест подключения', res.message, res.status === 'connected' ? 'success' : 'danger');
    } catch {
      showToast('Ошибка', 'Не удалось проверить подключение', 'danger');
    } finally {
      setTestingId(null);
    }
  }

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border text-primary" /></div>;
  }

  return (
    <>
      <h2 className="page-title mb-4">Камеры</h2>
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th><th>Название</th><th>Объект</th><th>Зона</th><th>Поток</th><th>Статус</th><th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.work_unit_name ?? '—'}</td>
                  <td>{c.zone ?? '—'}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>{c.stream_url}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {c.is_active ? 'активна' : 'неактивна'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      disabled={testingId === c.id}
                      onClick={() => handleTest(c.id)}
                    >
                      {testingId === c.id ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <><i className="bi bi-wifi" /> Тест</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
