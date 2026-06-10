import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WarCorrespondent } from '../types/database';

export function AdminCorrespondentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [correspondents, setCorrespondents] = useState<WarCorrespondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    photo_url: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadCorrespondents();
    }
  }, [user]);

  const loadCorrespondents = async () => {
    try {
      const { data, error } = await supabase
        .from('war_correspondents')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setCorrespondents(data);
    } catch (error) {
      console.error('Error loading correspondents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const maxOrder =
        correspondents.length > 0 ? Math.max(...correspondents.map((c) => c.order_index)) : -1;

      const { error } = await supabase.from('war_correspondents').insert({
        name: form.name,
        title: form.title,
        photo_url: form.photo_url,
        description: form.description,
        order_index: maxOrder + 1,
        is_active: true,
      });

      if (error) throw error;

      setForm({ name: '', title: '', photo_url: '', description: '' });
      setShowForm(false);
      loadCorrespondents();
    } catch (error) {
      console.error('Error adding correspondent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu muhbiri silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('war_correspondents').delete().eq('id', id);
      if (error) throw error;
      loadCorrespondents();
    } catch (error) {
      console.error('Error deleting correspondent:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('war_correspondents')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      loadCorrespondents();
    } catch (error) {
      console.error('Error toggling correspondent:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = correspondents.findIndex((c) => c.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === correspondents.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newCorrespondents = [...correspondents];
    const temp = newCorrespondents[currentIndex];
    newCorrespondents[currentIndex] = newCorrespondents[newIndex];
    newCorrespondents[newIndex] = temp;

    try {
      await Promise.all([
        supabase
          .from('war_correspondents')
          .update({ order_index: newIndex })
          .eq('id', correspondents[currentIndex].id),
        supabase
          .from('war_correspondents')
          .update({ order_index: currentIndex })
          .eq('id', correspondents[newIndex].id),
      ]);

      loadCorrespondents();
    } catch (error) {
      console.error('Error reordering correspondents:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Muharirleri Yönet</h1>
            <p className="text-gray-400">Ana sayfa savaş muhabirlerini yönetin</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Muhabir</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Yeni Muhabir Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  İsim *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Muhabir adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Unvan / Konum *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Örn: Ukrayna Muhabiri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Fotoğraf URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="https://example.com/photo.jpg"
                />
                {form.photo_url && (
                  <img
                    src={form.photo_url}
                    alt="Preview"
                    className="mt-3 w-24 h-24 rounded object-cover"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Açıklama *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 resize-none"
                  placeholder="Muhabir hakkında kısa açıklama..."
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </form>
        )}

        {correspondents.length > 0 ? (
          <div className="space-y-4">
            {correspondents.map((correspondent, index) => (
              <div
                key={correspondent.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex items-center gap-6"
              >
                <img
                  src={correspondent.photo_url}
                  alt={correspondent.name}
                  className="w-24 h-24 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{correspondent.name}</h3>
                  <p className="text-red-600 font-semibold mb-2">{correspondent.title}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{correspondent.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        correspondent.is_active
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {correspondent.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleReorder(correspondent.id, 'up')}
                    disabled={index === 0}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReorder(correspondent.id, 'down')}
                    disabled={index === correspondents.length - 1}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(correspondent.id, correspondent.is_active)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                  >
                    {correspondent.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                  </button>
                  <button
                    onClick={() => handleDelete(correspondent.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Henüz muhabir eklenmedi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
