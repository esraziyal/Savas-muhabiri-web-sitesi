

import { useEffect, useState } from 'react';
import { useRouter } from '../hooks/useRouter';
import { supabase } from '../lib/supabase';
import type { Interview, Comment, ContentBlock } from '../types/database';

export function InterviewDetailPage() {
  const { params } = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (params.slug) loadInterview(params.slug);
  }, [params.slug]);

  const loadInterview = async (slug: string) => {
    try {
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (interviewError) throw interviewError;
      if (!interviewData) {
        setLoading(false);
        return;
      }
      setInterview(interviewData);

      // @ts-expect-error Supabase TypeScript client type inference limitation
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('interview_id', interviewData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (commentsData) setComments(commentsData);
    } catch (error) {
      console.error('Error loading interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    setSubmitting(true);
    setSubmitMessage('');
    try {
      // @ts-expect-error Supabase TypeScript client type inference limitation
      const { error } = await supabase.from('comments').insert({
        interview_id: interview.id,
        author_name: commentForm.author_name,
        author_email: commentForm.author_email,
        content: commentForm.content,
        status: 'pending',
      });
      if (error) throw error;
      setSubmitMessage(
        'Yorumunuz gönderildi. Onaylandıktan sonra görüntülenecektir.'
      );
      setCommentForm({ author_name: '', author_email: '', content: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Güncellenmiş: Spot kutusu eklenmiş renderContent
  const renderContent = (blocks: ContentBlock[]) =>
    blocks.map((block, index) => {
      switch (block.type) {
        case 'paragraph':
          return (
            <div
              key={index}
              className={`text-gray-300 text-lg leading-relaxed mb-6 ${block.align === 'center'
                ? 'text-center'
                : block.align === 'right'
                  ? 'text-right'
                  : ''
                }`}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        case 'heading':
          const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag
              key={index}
              className={`text-white font-bold mb-4 mt-8 ${block.level === 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                }`}
            >
              {block.content}
            </HeadingTag>
          );
        case 'image':
          return (
            <div
              key={index}
              className={`my-8 ${block.align === 'center' ? 'text-center' : ''}`}
            >
              <img
                src={block.url}
                alt={block.caption || ''}
                className="w-full max-w-4xl mx-auto rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbCB5w7xrbGVuZWRpPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              {block.caption && (
                <p className="text-gray-500 text-sm mt-3 italic">{block.caption}</p>
              )}
            </div>
          );
        case 'spot': // Spot kutusu render
          return (
            <div
              key={index}
              className="my-6 p-4 rounded bg-yellow-300 font-bold text-black"
              style={{ margin: '24px 0', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        default:
          return null;
      }
    });

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );

  if (!interview)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Röportaj Bulunamadı</h1>
          <p className="text-gray-400">Aradığınız röportaj mevcut değil.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={interview.header_image}
          alt={interview.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMWYxZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzU1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkfDtnJzZWwgecO8a2xlbmVtZWRpPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/60 to-black/40" />
      </div>

      {/* Main Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex items-start gap-6 mb-12">
          <img
            src={interview.interviewee_photo}
            alt={interview.interviewee_name}
            className="w-32 h-32 rounded object-cover border-4 border-gray-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbDwvdGV4dD48L3N2Zz4=';
            }}
          />
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {interview.interviewee_name}
            </h1>
            <p className="text-xl text-gray-400">{interview.subtitle}</p>
            <p className="text-sm text-gray-600 mt-2">
              {new Date(interview.published_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-16">
          {renderContent(interview.content)}
        </div>

        {/* Comments */}
        <div className="border-t border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8">
            Yorumlar ({comments.length})
          </h2>
          <div className="space-y-6 mb-12">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-900 p-6 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{comment.author_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <p className="text-gray-300 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <div className="bg-gray-900 p-6 rounded">
            <h3 className="text-xl font-bold text-white mb-4">Yorum Yap</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  İsim
                </label>
                <input
                  type="text"
                  required
                  value={commentForm.author_name}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, author_name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={commentForm.author_email}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, author_email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Yorum
                </label>
                <textarea
                  required
                  rows={4}
                  value={commentForm.content}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, content: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
              >
                {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
              </button>
              {submitMessage && (
                <p className="text-sm text-gray-400 mt-2">{submitMessage}</p>
              )}
            </form>
          </div>
        </div>
      </article>

      <div className="h-20" />
    </div>
  );
}