import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Interview } from '../types/database';

export function AdminInterviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadInterviews();
    }
  }, [user]);

  const loadInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setInterviews(data);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu röportajı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('interviews').delete().eq('id', id);
      if (error) throw error;
      loadInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Röportajları Yönet</h1>
            <p className="text-gray-400">Tüm röportajları görüntüle, düzenle veya sil</p>
          </div>
          <button
            onClick={() => navigate('/admin/interviews/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Röportaj</span>
          </button>
        </div>

        {interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex items-center gap-6"
              >
                <img
                  src={interview.interviewee_photo}
                  alt={interview.interviewee_name}
                  className="w-24 h-24 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {interview.interviewee_name}
                  </h3>
                  <p className="text-gray-400 mb-2">{interview.subtitle}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {new Date(interview.published_at).toLocaleDateString('tr-TR')}
                    </span>
                    {interview.is_highlighted && (
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded">
                        Öne Çıkan
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/interviews/edit/${interview.id}`)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(interview.id)}
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
            <p className="text-gray-500 text-lg mb-4">Henüz röportaj eklenmedi.</p>
            <button
              onClick={() => navigate('/admin/interviews/new')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              İlk Röportajı Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
