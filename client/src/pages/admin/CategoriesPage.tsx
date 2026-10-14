import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'danger'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [catsRes, locsRes] = await Promise.all([
        apiRequest<{ categories: any[] }>('/admin/categories'),
        apiRequest<{ locations: any[] }>('/admin/locations')
      ]);
      setCategories(catsRes.categories || []);
      setLocations(locsRes.locations || []);
    } catch (err: any) {
      console.error('Error fetching categories & locations:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;

    try {
      await apiRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCat.trim() })
      });
      setNewCat('');
      setMessage({ type: 'ok', text: 'Đã thêm ngành nghề mới thành công' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message || 'Lỗi khi thêm ngành nghề' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngành nghề này?')) return;
    try {
      await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
      setMessage({ type: 'ok', text: 'Đã xóa ngành nghề' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message || 'Lỗi khi xóa ngành nghề' });
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.trim()) return;

    try {
      await apiRequest('/admin/locations', {
        method: 'POST',
        body: JSON.stringify({ name: newLoc.trim() })
      });
      setNewLoc('');
      setMessage({ type: 'ok', text: 'Đã thêm địa điểm mới thành công' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message || 'Lỗi khi thêm địa điểm' });
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) return;
    try {
      await apiRequest(`/admin/locations/${id}`, { method: 'DELETE' });
      setMessage({ type: 'ok', text: 'Đã xóa địa điểm' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message || 'Lỗi khi xóa địa điểm' });
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">Quản lý danh mục</h1>

      {message && (
        <div className={`alert-banner alert-banner--${message.type}`}>
          <span className="ms">{message.type === 'ok' ? 'check_circle' : 'error'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div className="form-grid">
        {/* Categories Section */}
        <section className="card">
          <h2 className="card__title">Ngành nghề</h2>
          <ul className="cat-list">
            {categories.map((cat) => (
              <li key={cat.id}>
                <span>
                  {cat.name}
                  {cat._count?.jobs !== undefined && (
                    <small style={{ color: 'var(--muted)', marginLeft: '8px' }}>
                      ({cat._count.jobs} việc)
                    </small>
                  )}
                </span>
                <button
                  type="button"
                  style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <form className="add-row" onSubmit={handleAddCategory}>
            <input
              className="input"
              placeholder="Thêm ngành nghề..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button className="btn btn--primary" type="submit">
              Thêm
            </button>
          </form>
        </section>

        {/* Locations Section */}
        <section className="card">
          <h2 className="card__title">Địa điểm</h2>
          <ul className="cat-list">
            {locations.map((loc) => (
              <li key={loc.id}>
                <span>
                  {loc.name}
                  {loc._count?.jobs !== undefined && (
                    <small style={{ color: 'var(--muted)', marginLeft: '8px' }}>
                      ({loc._count.jobs} việc)
                    </small>
                  )}
                </span>
                <button
                  type="button"
                  style={{ color: 'var(--danger)', background: 'none', border: 0, cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => handleDeleteLocation(loc.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <form className="add-row" onSubmit={handleAddLocation}>
            <input
              className="input"
              placeholder="Thêm địa điểm..."
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
            />
            <button className="btn btn--primary" type="submit">
              Thêm
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};
