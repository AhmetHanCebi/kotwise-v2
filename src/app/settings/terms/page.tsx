'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button onClick={() => router.back()} className="p-1.5 rounded-full active:opacity-70" style={{ color: 'var(--color-text-primary)' }} aria-label="Geri">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Kullanım Koşulları</h1>
      </div>

      <div className="flex-1 px-5 py-5 pb-20">
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Son güncelleme: 25 Mart 2026
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>1. Genel Koşullar</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kotwise (&quot;Platform&quot;), Erasmus ve değişim öğrencilerine konaklama bulma, topluluk oluşturma, oda arkadaşı eşleştirme ve mentörlük hizmetleri sunan bir dijital platformdur. Platformu kullanarak veya hesap oluşturarak bu Kullanım Koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız platformu kullanmamanız gerekmektedir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>2. Hesap ve Üyelik</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Platformu kullanmak için 18 yaşından büyük olmanız ve geçerli bir e-posta adresiyle hesap oluşturmanız gerekir.</li>
            <li>Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olması zorunludur.</li>
            <li>Hesap güvenliğinizden (şifre, oturum bilgileri) siz sorumlusunuz. Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlu tutulursunuz.</li>
            <li>Her kullanıcı yalnızca bir hesap oluşturabilir. Birden fazla hesap tespit edildiğinde platformun hesapları askıya alma veya silme hakkı saklıdır.</li>
            <li>Hesabınızı Ayarlar &gt; Hesabı Sil bölümünden kalıcı olarak kapatabilirsiniz.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>3. İlan ve Konaklama Kuralları</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Yayınlanan ilanlar gerçek, doğru ve güncel bilgiler içermelidir. Fotoğraflar ilanın mevcut durumunu yansıtmalıdır.</li>
            <li>Yanıltıcı, sahte veya ayrımcı içerik barındıran ilanlar tespit edildiğinde kaldırılabilir ve hesap askıya alınabilir.</li>
            <li>Ev sahipleri, ilanlarını güncel tutmakla ve kiralanmış mülkleri platformdan kaldırmakla yükümlüdür.</li>
            <li>Kotwise, ilan veren ile kiracı arasındaki anlaşmazlıklarda taraf değildir; yalnızca aracı platform olarak hizmet verir.</li>
            <li>Fiyatlar doğru para birimi ve net tutarla belirtilmelidir. Gizli ücret veya ek masraf belirtilmeden fiyat gösterilmesi yasaktır.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>4. Rezervasyon ve Ödeme</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Rezervasyonlar platform üzerinden oluşturulur ve ev sahibinin onayına tabidir.</li>
            <li>Ödeme işlemleri güvenli üçüncü taraf ödeme altyapısı üzerinden gerçekleştirilir. Kredi kartı bilgileriniz doğrudan platformda saklanmaz.</li>
            <li>İptal koşulları, ilan sahibi tarafından belirlenen ve ilan detayında belirtilen politikaya tabidir.</li>
            <li>Onaylanan rezervasyonların iptali halinde iade koşulları, iptal tarihine ve ilan sahibinin politikasına göre belirlenir.</li>
            <li>Platform, komisyon veya hizmet bedeli alabilir. Bu bedeller, işlem öncesinde açıkça gösterilir.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>5. Topluluk ve İletişim Kuralları</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Platform içi mesajlaşma, topluluk paylaşımları ve etkinlik katılımı sırasında saygılı ve yapıcı bir dil kullanılmalıdır.</li>
            <li>Nefret söylemi, taciz, tehdit, spam, reklam veya yasadışı içerik paylaşımı kesinlikle yasaktır.</li>
            <li>Diğer kullanıcıların kişisel bilgilerini izinsiz paylaşmak veya kötüye kullanmak yasaktır.</li>
            <li>Uygunsuz içerik veya davranışlar bildirim mekanizması aracılığıyla raporlanabilir.</li>
            <li>Platform, topluluk kurallarını ihlal eden içeriği kaldırma ve ilgili hesapları askıya alma veya sonlandırma hakkını saklı tutar.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>6. Oda Arkadaşı Eşleştirme</h2>
          <p className="text-sm leading-relaxed mb-4">
            Oda arkadaşı eşleştirme özelliği, kullanıcıların profil bilgileri ve tercihlerine dayalı öneri sunar. Platform, eşleştirme sonuçlarının doğruluğunu veya uyumluluğunu garanti etmez. Kullanıcılar, tanıştıkları kişilerle iletişim ve konaklama kararlarını kendi sorumluluklarında alır.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>7. Mentörlük Programı</h2>
          <p className="text-sm leading-relaxed mb-4">
            Mentörlük hizmeti, deneyimli öğrencilerin yeni gelen öğrencilere rehberlik etmesini sağlar. Mentörlerin verdiği tavsiyeler kişisel görüştür ve platform tarafından garanti edilmez. Mentörler ve mentee&apos;ler arasındaki ilişki platform kurallarına tabidir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>8. Fikri Mülkiyet</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Platform tasarımı, logoları, yazılımı ve içeriği Kotwise&apos;ın fikri mülkiyetindedir.</li>
            <li>Kullanıcılar, yükledikleri içerik (fotoğraflar, metinler, yorumlar) üzerinde sahiplik haklarını korur, ancak platformun bu içerikleri hizmet kapsamında kullanmasına lisans vermiş sayılır.</li>
            <li>Başka kullanıcıların veya platformun içeriklerini izinsiz kopyalamak, dağıtmak veya ticari amaçla kullanmak yasaktır.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>9. Sorumluluk Sınırlaması</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Kotwise bir aracı platform olarak hizmet verir; ev sahipleri ile kiracılar arasındaki sözleşmelerin tarafı değildir.</li>
            <li>Platform, ilanların doğruluğunu, konaklama kalitesini veya kullanıcıların güvenilirliğini garanti etmez.</li>
            <li>Kullanıcılar arasındaki anlaşmazlıklar, kayıplar veya zararlardan Kotwise sorumlu tutulamaz.</li>
            <li>Platform teknik arızalar, bakım çalışmaları veya mücbir sebeplerle geçici olarak erişilemez olabilir.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>10. Hesap Feshi ve Askıya Alma</h2>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Kullanım koşullarını ihlal eden, sahte bilgi sağlayan veya diğer kullanıcılara zarar veren hesaplar uyarı yapılarak veya doğrudan askıya alınabilir ya da silinebilir.</li>
            <li>Hesap feshi durumunda devam eden rezervasyonlar ve yükümlülükler ilgili koşullara göre değerlendirilir.</li>
            <li>Kullanıcılar, hesaplarını istedikleri zaman Ayarlar sayfasından kapatabilir.</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>11. Uyuşmazlık Çözümü</h2>
          <p className="text-sm leading-relaxed mb-4">
            Bu Kullanım Koşullarından doğan uyuşmazlıklar öncelikle iyi niyet çerçevesinde çözülmeye çalışılır. Çözülemeyen uyuşmazlıklarda Türkiye Cumhuriyeti mevzuatı ve ilgili AB düzenlemeleri uygulanır. Tüketiciler, AB çevrimiçi uyuşmazlık çözüm platformuna (ec.europa.eu/odr) başvurabilir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>12. Koşul Değişiklikleri</h2>
          <p className="text-sm leading-relaxed mb-4">
            Bu Kullanım Koşulları gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içi bildirim ve/veya e-posta yoluyla önceden duyurulur. Değişiklikten sonra platformu kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>13. İletişim</h2>
          <p className="text-sm leading-relaxed mb-4">
            Bu Kullanım Koşulları veya platform hizmetleri hakkında sorularınız için destek@kotwise.com adresine e-posta gönderebilirsiniz.
          </p>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 20%, transparent)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Bu kullanım koşulları taslak niteliğindedir ve hukuki danışmanlık yerine geçmez. Nihai metin, bir hukuk profesyoneli tarafından incelenmeli ve onaylanmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
