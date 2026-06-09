import { useEffect, useState } from 'react';
import { createObject, deleteObject, getObjects, updateObject } from '@/api';
import { useToast } from '@/hooks/useToast';
import type { MonitoredObject } from '@/types';

export function ObjectsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<MonitoredObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function load() {
    setLoading(true);
    getObjects().then(setItems).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  }

  function openEdit(o: MonitoredObject) {
    setEditId(o.id);
    setName(o.name);
    setDescription(o.description ?? '');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Ошибка', 'Укажите название', 'danger');
      return;
    }
    try {
      if (editId) {
        await updateObject(editId, { name, description });
        showToast('Успех', 'Объект обновлён', 'success');
      } else {
        await createObject({ name, description });
        showToast('Успех', 'Объект создан', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      showToast('Ошибка', 'Не удалось сохранить', 'danger');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteObject(deleteId);
    showToast('Успех', 'Объект удалён', 'success');
    setDeleteId(null);
    load();
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title mb-0">Объекты наблюдения</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" />Добавить
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>ID</th><th>Название</th><th>Описание</th><th style={{ width: 120 }}>Действия</th></tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.name}</td>
                    <td>{o.description ?? '—'}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => openEdit(o)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => setDeleteId(o.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Редактировать объект' : 'Добавить объект'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Название *</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Описание</label>
                  <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Отмена</button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body pt-4">
                <p>Удалить объект наблюдения?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>Отмена</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
