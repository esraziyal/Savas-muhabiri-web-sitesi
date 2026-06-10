import { useRouter } from '../hooks/useRouter';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SAVAŞ MUHABİRİ</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Savaş muhabirlerinin gözünden gerçekler. Cepheden gelen hikayeler,
              unutulmayan anılar ve savaşın yüzleri.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Sayfalar
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/interviews')}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Röportajlar
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Hakkında
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Künye
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              İletişim
            </h3>
            <p className="text-gray-400 text-sm">
              Sorularınız için bize ulaşabilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Savaş Muhabiri. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
