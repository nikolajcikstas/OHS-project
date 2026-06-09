import { useEffect, useState } from 'react';
import { getModels } from '@/api';
import type { MlModel } from '@/types';

export function ModelsPage() {
  const [items, setItems] = useState<MlModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModels().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border text-primary" /></div>;
  }

  return (
    <div className="card">
      <div className="card-header">Модели ML</div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead><tr><th>ID</th><th>Название</th><th>Фреймворк</th><th>Файл</th><th>Статус</th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>{m.framework ?? '—'}</td>
                <td className="text-truncate" style={{ maxWidth: 200 }}>{m.model_file ?? '—'}</td>
                <td>
                  <span className={`badge ${m.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {m.is_active ? 'активна' : 'неактивна'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
