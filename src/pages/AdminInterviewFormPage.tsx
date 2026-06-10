import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { RichTextEditor } from '../components/RichTextEditor';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { supabase } from '../lib/supabase';
import type { ContentBlock, Database } from '../types/database';

export function AdminInterviewFormPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate, currentPath } = useRouter();
  const isEdit = currentPath.includes('/edit/');
  const interviewId = isEdit ? currentPath.split('/').pop() : null;

  const [form, setForm] = useState({
    slug: '',
    interviewee_name: '',
    interviewee_photo: '',
    subtitle: '',
    header_image: '',
    content: [] as ContentBlock[],
    is_highlighted: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isEdit && interviewId && user) {
      loadInterview(interviewId);
    }
  }, [isEdit, interviewId, user]);

  const loadInterview = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setForm({
          slug: data.slug,
          interviewee_name: data.interviewee_name,
          interviewee_photo: data.interviewee_photo,
          subtitle: data.subtitle,
          header_image: data.header_image,
          content: data.content,
          is_highlighted: data.is_highlighted,
        });
      }
    } catch (error) {
      console.error('Error loading interview:', error);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const sanitizeContent = (blocks: ContentBlock[]): ContentBlock[] => {
    return blocks.map((block) => {
      if (block.type !== 'paragraph' || !block.content) return block;

      const div = document.createElement('div');
      div.innerHTML = block.content;

      div.querySelectorAll('span[contenteditable="false"]').forEach((wrapper) => {
        const imgs = wrapper.querySelectorAll('img');
        const parent = wrapper.parentNode;
        if (!parent) return;
        imgs.forEach((img) => {
          img.removeAttribute('contenteditable');
          parent.insertBefore(img, wrapper);
        });
        wrapper.remove();
      });

      return { ...block, content: div.innerHTML };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('success');

    try {
      if (!form.interviewee_name.trim()) {
        throw new Error('Röportaj yapılan kişi adı gerekli');
      }
      if (!form.subtitle.trim()) {
        throw new Error('Alt başlık gerekli');
      }
      if (!form.interviewee_photo) {
        throw new Error('Kişi fotoğrafı gerekli');
      }
      if (!form.header_image) {
        throw new Error('Header görseli gerekli');
      }

      const interviewData: Database['public']['Tables']['interviews']['Insert'] = {
        ...form,
        content: sanitizeContent(form.content),
        title: form.interviewee_name, // Use interviewee name as title
        slug: form.slug || generateSlug(form.interviewee_name),
        author_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (isEdit && interviewId) {
        // @ts-expect-error Supabase TypeScript client type inference limitation
        const { error } = await supabase
          .from('interviews')
          .update(interviewData)
          .eq('id', interviewId);

        if (error) throw error;
        setMessageType('success');
        setMessage('Röportaj başarıyla güncellendi!');
      } else {
        // @ts-expect-error Supabase TypeScript client type inference limitation
        const { error } = await supabase.from('interviews').insert(interviewData);

        if (error) throw error;
        setMessageType('success');
        setMessage('Röportaj başarıyla eklendi!');
      }

      setTimeout(() => {
        navigate('/admin/interviews');
      }, 2000);
    } catch (error) {
      console.error('Error saving interview:', error);
      setMessageType('error');
      setMessage(
        error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEdit ? 'Röportajı Düzenle' : 'Yeni Röportaj Ekle'}
          </h1>
          <p className="text-gray-400">Röportaj detaylarını ve içeriğini girin</p>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()} // formun kendi submitini engelledik
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault(); // Enter tuşu da tetiklemeyecek
          }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Röportaj Yapılan Kişi *
              </label>
              <input
                type="text"
                required
                value={form.interviewee_name}
                onChange={(e) => {
                  setForm({
                    ...form,
                    interviewee_name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                placeholder="ahmet-yilmaz"
              />
              <p className="text-gray-600 text-sm mt-1">
                URL: /interview/{form.slug || 'slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Alt Başlık / Özet *
              </label>
              <textarea
                required
                rows={2}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 resize-none"
                placeholder="Kısa açıklama"
              />
            </div>

            <ImageUploadInput
              value={form.interviewee_photo}
              onChange={(url) => setForm({ ...form, interviewee_photo: url })}
              label="Kişi Fotoğrafı"
              required
            />

            <ImageUploadInput
              value={form.header_image}
              onChange={(url) => setForm({ ...form, header_image: url })}
              label="Header Görseli"
              required
            />

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.is_highlighted}
                  onChange={(e) => setForm({ ...form, is_highlighted: e.target.checked })}
                  className="w-5 h-5 bg-gray-800 border border-gray-700 rounded text-red-600 focus:ring-red-600"
                />
                <span className="text-gray-300">Ana sayfada öne çıkar</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Röportaj İçeriği</h2>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/interviews')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              İptal
            </button>
            <button
              type="button" // sadece bu buton tetikliyor
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>

          {message && (
            <div
              className={`rounded p-4 border ${messageType === 'success'
                ? 'bg-green-900/20 border-green-600'
                : 'bg-red-900/20 border-red-600'
                }`}
            >
              <p
                className={messageType === 'success' ? 'text-green-400' : 'text-red-400'}
              >
                {message}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
