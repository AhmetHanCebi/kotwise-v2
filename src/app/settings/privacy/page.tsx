'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Gizlilik Politikası</h1>
      </div>

      <div className="flex-1 px-5 py-5 pb-20">
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Son güncelleme: 25 Mart 2026
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>1. Giriş</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kotwise (&quot;Platform&quot;, &quot;biz&quot;), Erasmus ve değişim öğrencilerine konaklama, topluluk ve mentörlük hizmetleri sunan bir dijital platformdur. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, işlendiğini, saklandığını ve korunduğunu açıklar. Platform, Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) başta olmak üzere ilgili veri koruma mevzuatına uygun şekilde faaliyet gösterir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>2. Toplanan Kişisel Veriler</h2>
          <p className="text-sm leading-relaxed mb-2">Platformu kullanırken aşağıdaki kişisel veriler toplanabilir:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
            <li><strong>Eğitim Bilgileri:</strong> Üniversite adı, bölüm, değişim programı detayları</li>
            <li><strong>Profil Bilgileri:</strong> Fotoğraf, biyografi, ilgi alanları, dil bilgileri</li>
            <li><strong>Konum Bilgileri:</strong> Memleket şehri, değişim şehri tercihi</li>
            <li><strong>Kullanım Verileri:</strong> Platform içi etkileşimler, arama geçmişi, favori ilanlar</li>
            <li><strong>İletişim Verileri:</strong> Platform içi mesajlar, bildirim tercihleri</li>
            <li><strong>Ödeme Bilgileri:</strong> Rezervasyon ve ödeme işlem kayıtları (kredi kartı bilgileri doğrudan tarafımızca saklanmaz; ödeme işlemcisi tarafından işlenir)</li>
            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgileri, cihaz bilgileri, oturum verileri</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>3. Verilerin İşlenme Amaçları</h2>
          <p className="text-sm leading-relaxed mb-2">Kişisel verileriniz aşağıdaki amaçlarla işlenir:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li>Hesap oluşturma ve kimlik doğrulama</li>
            <li>Konaklama ilanlarının eşleştirilmesi ve önerilmesi</li>
            <li>Oda arkadaşı eşleştirme ve uyumluluk hesaplama</li>
            <li>Rezervasyon ve ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Platform içi mesajlaşma ve bildirim hizmetleri</li>
            <li>Topluluk ve etkinlik özelliklerinin sunulması</li>
            <li>Mentörlük programının yönetimi</li>
            <li>Platform güvenliğinin sağlanması ve dolandırıcılığın önlenmesi</li>
            <li>Hizmet kalitesinin iyileştirilmesi ve analiz</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>4. Verilerin İşlenme Hukuki Dayanağı</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kişisel verileriniz; sözleşmenin ifası, meşru menfaat, yasal yükümlülük ve açık rızanız kapsamında GDPR Madde 6 ve KVKK Madde 5 hükümlerine uygun olarak işlenir. Özel nitelikli kişisel veriler yalnızca açık rızanızla işlenir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>5. Verilerin Paylaşımı</h2>
          <p className="text-sm leading-relaxed mb-2">Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li><strong>Hizmet Sağlayıcılar:</strong> Supabase (veri tabanı ve kimlik doğrulama), ödeme işlemcileri, e-posta hizmetleri gibi teknik altyapı sağlayıcıları</li>
            <li><strong>Platform Kullanıcıları:</strong> Profil bilgileriniz (ayarlarınıza bağlı olarak) diğer kullanıcılara görünür olabilir</li>
            <li><strong>Ev Sahipleri:</strong> Rezervasyon yapıldığında iletişim bilgileriniz ev sahibiyle paylaşılır</li>
            <li><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı veya yasal yükümlülükler gereği yetkili makamlarla paylaşılabilir</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>6. Veri Saklama ve Güvenlik</h2>
          <p className="text-sm leading-relaxed mb-4">
            Verileriniz, hizmet süresince ve yasal saklama yükümlülükleri kapsamında saklanır. Hesabınızı sildiğinizde, kişisel verileriniz yasal zorunluluklar hariç 30 gün içinde kalıcı olarak silinir. Verileriniz, endüstri standardı şifreleme (TLS/SSL) ve güvenlik önlemleriyle korunur. Veri tabanı erişimi rol tabanlı yetkilendirme ile sınırlandırılmıştır.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>7. Uluslararası Veri Aktarımı</h2>
          <p className="text-sm leading-relaxed mb-4">
            Platformun teknik altyapısı AB/AEA bölgesinde ve güvenli üçüncü ülkelerde konumlandırılmıştır. Veri aktarımı, GDPR Madde 46 kapsamında uygun güvenceler (Standart Sözleşme Hükümleri) ile gerçekleştirilir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>8. KVKK ve GDPR Kapsamındaki Haklarınız</h2>
          <p className="text-sm leading-relaxed mb-2">Aşağıdaki haklara sahipsiniz:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li><strong>Erişim Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini ve işlenen verilere erişim talep etme</li>
            <li><strong>Düzeltme Hakkı:</strong> Eksik veya yanlış verilerin düzeltilmesini isteme</li>
            <li><strong>Silme Hakkı (Unutulma Hakkı):</strong> Kişisel verilerinizin silinmesini talep etme</li>
            <li><strong>İşlemeyi Kısıtlama Hakkı:</strong> Belirli koşullarda veri işlemenin sınırlandırılmasını isteme</li>
            <li><strong>Veri Taşınabilirliği Hakkı:</strong> Verilerinizi yapılandırılmış formatta alma</li>
            <li><strong>İtiraz Hakkı:</strong> Meşru menfaat temelinde yapılan veri işlemeye itiraz etme</li>
            <li><strong>Otomatik Karar Alma:</strong> Tamamen otomatik işleme dayalı kararlara itiraz etme</li>
          </ul>
          <p className="text-sm leading-relaxed mb-4">
            Bu haklarınızı Ayarlar sayfası üzerinden veya destek@kotwise.com adresine başvurarak kullanabilirsiniz. Hesabınızı ve tüm verilerinizi Ayarlar &gt; Hesabı Sil bölümünden kalıcı olarak silebilirsiniz.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>9. Çerezler ve Yerel Depolama</h2>
          <p className="text-sm leading-relaxed mb-2">Platform aşağıdaki teknolojileri kullanır:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi ve kimlik doğrulama için gerekli çerezler</li>
            <li><strong>Yerel Depolama:</strong> Kullanıcı tercihleri (dil, para birimi, tema) ve uygulama ayarları</li>
            <li><strong>Analiz:</strong> Anonim kullanım istatistikleri için analiz araçları (tercihinize bağlı olarak)</li>
          </ul>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>10. Çocukların Gizliliği</h2>
          <p className="text-sm leading-relaxed mb-4">
            Platform, 18 yaşından büyük üniversite öğrencilerine yöneliktir. 16 yaşından küçük bireylerin kişisel verilerini bilerek toplamaz veya işlemez.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>11. Politika Değişiklikleri</h2>
          <p className="text-sm leading-relaxed mb-4">
            Bu Gizlilik Politikası gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içi bildirim ve/veya e-posta yoluyla duyurulur. Platformu kullanmaya devam etmeniz, güncel politikayı kabul ettiğiniz anlamına gelir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>12. Şikayet ve Başvuru</h2>
          <p className="text-sm leading-relaxed mb-2">Veri koruma haklarınızla ilgili endişeleriniz için:</p>
          <ul className="text-sm leading-relaxed mb-4 list-disc pl-5 space-y-1">
            <li><strong>Platform İletişim:</strong> destek@kotwise.com</li>
            <li><strong>KVKK Başvuru:</strong> Kişisel Verileri Koruma Kurumu (kvkk.gov.tr)</li>
            <li><strong>GDPR Başvuru:</strong> İlgili AB veri koruma otoritesine başvurabilirsiniz</li>
          </ul>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 20%, transparent)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Bu gizlilik politikası taslak niteliğindedir ve hukuki danışmanlık yerine geçmez. Nihai metin, bir hukuk profesyoneli tarafından incelenmeli ve onaylanmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
