import { HeroSlider } from '../components/HeroSlider';
import { InterviewCard } from '../components/InterviewCard';
import { CorrespondentalSection } from '../components/CorrespondentalSection';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import type { Interview, WarCorrespondent, HeroSlide } from '../types/database';

export function HomePage() {
  const [latestInterviews, setLatestInterviews] = useState<Interview[]>([]);
  const [correspondents, setCorrespondents] = useState<WarCorrespondent[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [latestResult, correspondentsResult, slidesResult] = await Promise.all([
        supabase
          .from('interviews')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(6),

        supabase
          .from('war_correspondents')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true }),

        supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true }),
      ]);

      if (latestResult.data) setLatestInterviews(latestResult.data);
      if (correspondentsResult.data) setCorrespondents(correspondentsResult.data);
      if (slidesResult.data) setHeroSlides(slidesResult.data);
    } catch (error) {
      console.error('Data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* HERO */}
      {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* INTRO */}
        <div className="mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Savaş Muhabirlerinin Gözünden
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Cephe hattından aktarılan röportajlar, savaşın yalnızca
            haritalardan değil, insan hikâyelerinden okunduğunu hatırlatıyor.
          </p>
        </div>

        {/* SON RÖPORTAJLAR */}
        {latestInterviews.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8">Son Röportajlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MUHABİRLER */}
      <CorrespondentalSection correspondents={correspondents} />
    </div>
  );
}
