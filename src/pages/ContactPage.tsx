export function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-black border-b border-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Künye
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Yayın Bilgileri</h2>
            <div className="bg-gray-900 rounded p-6 space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Yayın Adı</p>
                <p className="text-white font-semibold">Savaş Muhabiri</p>
              </div>
               <div>
                <p className="text-gray-500 text-sm mb-1">Yayın Sahibi</p>
                <p className="text-white">Bünyamin Aygün</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Yayın Türü</p>
                <p className="text-white">Dijital Haber ve Röportaj Platformu</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">İçerik Türü</p>
                <p className="text-white">Savaş Gazeteciliği, Röportajlar, Belgeseller</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Yayın Amacı</p>
                <p className="text-white">
                  Üsküdar Üniversitesi Gazetecilik Bölümü (Bitirme Ödevi)
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">İletişim</h2>
            <div className="bg-gray-900 rounded p-6 space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">E-posta</p>
                <p className="text-white">turkishwarjournalist@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Adres</p>
                <p className="text-white">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Yasal Bilgiler</h2>
            <div className="bg-gray-900 rounded p-6">
              <p className="text-gray-300 leading-relaxed">
                Bu platformda yayınlanan tüm içerikler telif hakkı ile korunmaktadır.
                İçeriklerin izinsiz kullanımı yasaktır. Röportajlarda ifade edilen görüşler
                ilgili kişilere aittir ve platform yönetiminin görüşlerini yansıtmayabilir.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Katkıda Bulunun</h2>
            <div className="bg-gray-900 rounded p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Siz de bir savaş muhabiri iseniz veya paylaşmak istediğiniz bir hikayeniz varsa,
                bizimle iletişime geçebilirsiniz. Her hikaye değerlidir ve unutulmamalıdır.
              </p>
              <p className="text-white font-semibold">turkishwarjournalist@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
