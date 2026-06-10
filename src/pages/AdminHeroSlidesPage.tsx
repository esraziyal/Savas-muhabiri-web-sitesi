import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageUploadInput } from '../components/ImageUploadInput';
import type { HeroSlide } from '../types/database';

export function AdminHeroSlidesPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    caption: '',
    interview_slug: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSlides();
    }
  }, [user]);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data) setSlides(data);
    } catch (error) {
      console.error('Error loading slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order_index)) : -1;

      const { error } = await supabase.from('hero_slides').insert({
        image_url: form.image_url,
        title: form.title || null,
        subtitle: form.subtitle || null,
        caption: form.caption || null,
        interview_slug: form.interview_slug || null,
        order_index: maxOrder + 1,
        is_active: true,
      });

      if (error) throw error;

      setForm({ image_url: '', title: '', subtitle: '', caption: '', interview_slug: '' });
      setShowForm(false);
      loadSlides();
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu slaytı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      loadSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex((s) => s.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === slides.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSlides = [...slides];
    const temp = newSlides[currentIndex];
    newSlides[currentIndex] = newSlides[newIndex];
    newSlides[newIndex] = temp;

    try {
      await Promise.all([
        supabase
          .from('hero_slides')
          .update({ order_index: newIndex })
          .eq('id', slides[currentIndex].id),
        supabase
          .from('hero_slides')
          .update({ order_index: currentIndex })
          .eq('id', slides[newIndex].id),
      ]);

      loadSlides();
    } catch (error) {
      console.error('Error reordering slides:', error);
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
            <h1 className="text-3xl font-bold text-white mb-2">Hero Slaytları</h1>
            <p className="text-gray-400">Ana sayfa slaytlarını yönetin</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Slayt</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Yeni Slayt Ekle</h2>
            <div className="space-y-4">
              <ImageUploadInput
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                label="Görsel"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Başlık
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Slayt başlığı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Slayt alt başlığı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Röportaj Bağlantısı (slug)
                </label>
                <input
                  type="text"
                  value={form.interview_slug}
                  onChange={(e) => setForm({ ...form, interview_slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="ornek-roportaj-slug"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Tıklanınca yönlendirilecek röportajın slug değeri
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 resize-none"
                  placeholder="Slayt açıklaması"
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

        {slides.length > 0 ? (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex items-center gap-6"
              >
                <img
                  src={slide.image_url}
                  alt={slide.title || slide.caption || 'Slide'}
                  className="w-48 h-32 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="flex-1">
                  {slide.title && (
                    <p className="text-white font-semibold mb-1">{slide.title}</p>
                  )}
                  {slide.subtitle && (
                    <p className="text-gray-300 text-sm mb-2">{slide.subtitle}</p>
                  )}
                  <p className="text-gray-400 text-sm mb-2">{slide.caption || 'Açıklama yok'}</p>
                  {slide.interview_slug && (
                    <p className="text-gray-500 text-xs">
                      Röportaj: /interview/{slide.interview_slug}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        slide.is_active
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {slide.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleReorder(slide.id, 'up')}
                    disabled={index === 0}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReorder(slide.id, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(slide.id, slide.is_active)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    {slide.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
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
            <p className="text-gray-500 text-lg">Henüz slayt eklenmedi.</p>
            <p className="text-gray-600 text-sm mt-2">
              "Yeni Slayt" butonuna tıklayarak hero slaytları ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
