import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { FileText, MessageSquare, Image, Plus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState({
    interviews: 0,
    pendingComments: 0,
    heroSlides: 0,
    correspondents: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [interviewsRes, commentsRes, slidesRes, correspondentsRes] = await Promise.all([
        supabase.from('interviews').select('id', { count: 'exact', head: true }),
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('hero_slides').select('id', { count: 'exact', head: true }),
        supabase.from('war_correspondents').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        interviews: interviewsRes.count || 0,
        pendingComments: commentsRes.count || 0,
        heroSlides: slidesRes.count || 0,
        correspondents: correspondentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Yönetim Paneli</h1>
          <p className="text-gray-400">Savaş Muhabiri içerik yönetimi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-white">{stats.interviews}</span>
            </div>
            <p className="text-gray-400">Toplam Röportaj</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-white">{stats.pendingComments}</span>
            </div>
            <p className="text-gray-400">Bekleyen Yorum</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Image className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-white">{stats.heroSlides}</span>
            </div>
            <p className="text-gray-400">Hero Slaytları</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-white">{stats.correspondents}</span>
            </div>
            <p className="text-gray-400">Muhabir</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin/interviews/new')}
            className="bg-gray-900 border-2 border-dashed border-gray-700 hover:border-red-600 rounded-lg p-8 transition-colors group"
          >
            <Plus className="w-12 h-12 text-gray-600 group-hover:text-red-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Yeni Röportaj</h3>
            <p className="text-gray-400 text-sm">Röportaj ekle</p>
          </button>

          <button
            onClick={() => navigate('/admin/interviews')}
            className="bg-gray-900 border border-gray-800 hover:border-red-600 rounded-lg p-8 transition-colors"
          >
            <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Röportajları Yönet</h3>
            <p className="text-gray-400 text-sm">Düzenle veya sil</p>
          </button>

          <button
            onClick={() => navigate('/admin/comments')}
            className="bg-gray-900 border border-gray-800 hover:border-red-600 rounded-lg p-8 transition-colors"
          >
            <MessageSquare className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Yorumları Yönet</h3>
            <p className="text-gray-400 text-sm">Onayla veya reddet</p>
          </button>

          <button
            onClick={() => navigate('/admin/hero-slides')}
            className="bg-gray-900 border border-gray-800 hover:border-red-600 rounded-lg p-8 transition-colors"
          >
            <Image className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Hero Slaytları</h3>
            <p className="text-gray-400 text-sm">Ana sayfa slaytlarını yönet</p>
          </button>

          <button
            onClick={() => navigate('/admin/correspondents')}
            className="bg-gray-900 border border-gray-800 hover:border-red-600 rounded-lg p-8 transition-colors"
          >
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Muharirleri Yönet</h3>
            <p className="text-gray-400 text-sm">Ana sayfa muhabirlerini yönet</p>
          </button>
        </div>
      </div>
    </div>
  );
}
