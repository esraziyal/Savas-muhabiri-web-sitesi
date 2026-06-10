export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-black border-b border-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hakkında
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            <strong className="text-white">Savaş Muhabiri</strong>, savaş bölgelerinden gerçekleri
            dünyaya taşıyan gazetecilerin hikayelerini ve deneyimlerini paylaşan bir platformdur.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">
            Savaş Gazeteciliği Nedir?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Savaş gazeteciliği, silahlı çatışma bölgelerinden haber yapan gazetecilerin mesleğidir.
            Bu gazeteciler, hayatlarını riske atarak savaşın gerçeklerini, insani dramları ve
            cephe hatlarındaki durumu kamuoyuna aktarırlar. Tarihin en karanlık dönemlerinde
            bile gerçeği arama çabası, savaş muhabirlerinin en önemli misyonudur.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">
            Misyonumuz
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Bu platform, savaş muhabirlerinin sesini duyurmak, deneyimlerini paylaşmak ve
            savaşın insani yüzünü göstermek için kurulmuştur. Unutulmaması gereken hikayeleri
            belgelemek, yeni nesil gazetecilere ilham vermek ve kamuoyunu bilinçlendirmek
            temel hedeflerimizdir.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">
            Neden Önemli?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Savaş muhabirleri, tarihin tanıklarıdır. Onların çalışmaları sayesinde:
          </p>
          <ul className="text-gray-300 leading-relaxed mb-6 space-y-2">
            <li>Dünya, savaşların gerçek yüzünü görebilir.</li>
            <li>İnsanlık suçları belgelenir ve hesap sorulabilir.</li>
            <li>Mağdurların sesi duyurulur.</li>
            <li>Tarih, tarafsız ve doğru bir şekilde kaydedilir.</li>
            <li>Barış için farkındalık yaratılır.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">
            İçeriklerimiz
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Platformumuzda yer alan röportajlar, cephe hatlarından dönen savaş muhabirlerinin
            kendi ağızlarından anlattıkları deneyimler, gözlemler ve duygulardır. Her bir röportaj,
            gerçek bir insanın, gerçek bir hikayesidir.
          </p>

          <div className="bg-gray-900 border-l-4 border-red-600 p-6 mt-12">
            <p className="text-gray-300 italic">
              "Savaşı anlatmak, barışı savunmaktır. Her hikaye, bir hatırlatmadır:
              savaşın kaybedeni yoktur, sadece mağdurları vardır."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
