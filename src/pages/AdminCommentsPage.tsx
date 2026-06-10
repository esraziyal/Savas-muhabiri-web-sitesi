import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/database';

interface CommentWithInterview extends Comment {
  interview_title?: string;
}

export function AdminCommentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [comments, setComments] = useState<CommentWithInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadComments();
    }
  }, [user, filter]);

  const loadComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      if (commentsData && commentsData.length > 0) {
        const interviewIds = [...new Set(commentsData.map((c) => c.interview_id))];
        const { data: interviewsData } = await supabase
          .from('interviews')
          .select('id, interviewee_name')
          .in('id', interviewIds);

        const interviewMap = new Map(
          interviewsData?.map((i) => [i.id, i.interviewee_name]) || []
        );

        const enrichedComments = commentsData.map((comment) => ({
          ...comment,
          interview_title: interviewMap.get(comment.interview_id),
        }));

        setComments(enrichedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('comments').update({ status }).eq('id', id);
      if (error) throw error;
      loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Yorumları Yönet</h1>
          <p className="text-gray-400">Yorumları onayla, reddet veya sil</p>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Onaylanan
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded transition-colors ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Reddedilen
          </button>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">{comment.author_name}</h3>
                    <p className="text-gray-500 text-sm">{comment.author_email}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Röportaj: {comment.interview_title}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                <p className="text-gray-300 leading-relaxed mb-4">{comment.content}</p>

                <div className="flex items-center space-x-2">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'approved')}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Onayla</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Reddet</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {filter === 'pending' && 'Bekleyen yorum yok.'}
              {filter === 'approved' && 'Onaylanmış yorum yok.'}
              {filter === 'rejected' && 'Reddedilmiş yorum yok.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
