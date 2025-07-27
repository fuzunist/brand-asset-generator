# Unified Backend for BrandOS

## 1. Proje Amacı ve Genel Bakış

Bu proje, daha önce projenin farklı klasörlerinde dağınık olarak bulunan çok sayıda Node.js backend sunucusunu **tek bir çatı altında birleştirmeyi** amaçlamaktadır. Bu birleştirme işlemi, geliştirme süreçlerini basitleştirmek, tek bir port üzerinden hizmet vermek ve kod tekrarını önleyerek bakımı kolaylaştırmak için yapılmıştır.

Orijinal projede her biri kendi bağımlılıklarına (`node_modules`) ve kendi portuna sahip olan `server/`, `content-calendar-module/backend/`, `micro-survey-widget/backend/` ve `smart-docs-generator/` gibi servisler, bu proje altında modüler bir Express.js uygulaması olarak yeniden yapılandırılmıştır.

**Temel Hedefler:**
- **Tek Port:** Tüm backend servislerinin tek bir port üzerinden çalışmasını sağlamak.
- **Merkezi Yönetim:** Bağımlılıkları, konfigürasyonu ve veritabanı bağlantılarını merkezileştirmek.
- **Modülerlik:** Her bir işlevselliği (kimlik doğrulama, takvim, anketler vb.) kendi başına bir modül olarak koruyarak kodun okunabilirliğini ve yönetilebilirliğini artırmak.
- **Gelişmiş Loglama:** Tüm istekleri, hataları ve önemli sistem olaylarını loglayarak hata ayıklama sürecini kolaylaştırmak.

---

## 2. Proje Mimarisi ve Klasör Yapısı

Proje, ölçeklenebilir ve yönetilebilir bir mimari üzerine kurulmuştur. Ana klasör yapısı aşağıdaki gibidir:

```
unified-backend/
├── src/
│   ├── app.js                 # Ana Express uygulamasının yapılandırıldığı yer
│   ├── config/                # Proje konfigürasyonları (örn: .env'den okunanlar)
│   ├── database/              # Veritabanı bağlantı yöneticisi (SQLite & PostgreSQL)
│   ├── middleware/            # Ara katman yazılımları (auth, logger, error handler vb.)
│   ├── routes/                # API endpoint'lerinin ve yönlendiricilerin tanımlandığı yer
│   │   ├── controllers/       # Route'ların mantığını içeren controller'lar
│   │   ├── authRoutes.js
│   │   ├── calendarRoutes.js
│   │   └── ...
│   ├── services/              # İş mantığının bulunduğu servisler (örn: PDF oluşturma, AI servisleri)
│   ├── utils/                 # Yardımcı fonksiyonlar (logger, validation vb.)
│   └── index.js               # Sunucuyu başlatan ana giriş noktası
├── logs/                      # Üretim ortamı için log dosyalarının tutulduğu yer
├── node_modules/              # Proje bağımlılıkları
├── .env                       # Ortam değişkenleri (manuel olarak oluşturulmalı)
├── package.json
└── README.md
```

### Klasörlerin Açıklamaları

- **`src/config`**: Ortam değişkenlerini (`.env`) okuyarak projeye dağıtan merkezi yapılandırma dosyalarını içerir.
- **`src/database`**: Projenin kullandığı tüm veritabanları (SQLite ve PostgreSQL) için merkezi bağlantı yöneticisini barındırır. Uygulamanın herhangi bir yerinden veritabanına bu modül üzerinden erişilir.
- **`src/middleware`**: Gelen isteklere ve giden cevaplara müdahale eden ara katmanları içerir. Örneğin, `authMiddleware` (kimlik doğrulama), `requestLogger` (istek loglama) ve `errorHandler` (merkezi hata yakalama) burada bulunur.
- **`src/routes`**: API'nin tüm endpoint'lerini modüler dosyalara ayırır. Her bir ana işlevselliğin (`auth`, `team`, `calendar` vb.) kendine ait bir route dosyası vardır. Bu dosyalar, istekleri ilgili `controller`'lara yönlendirir.
- **`src/services`**: Uygulamanın ana iş mantığını içerir. Veritabanı işlemleri, harici API çağrıları, dosya oluşturma gibi karmaşık işlemler bu katmanda gerçekleştirilir.
- **`src/utils`**: Projenin genelinde kullanılan yardımcı araçları barındırır. **Winston** ile yapılandırılmış olan merkezi `logger` en önemlilerindendir.

---

## 3. Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- npm

### Adımlar

1.  **Bağımlılıkları Yükleyin:**
    Projenin ana dizininde (`unified-backend/`) aşağıdaki komutu çalıştırın:
    ```bash
    npm install
    ```

2.  **.env Dosyasını Oluşturun:**
    Projenin çalışabilmesi için gerekli olan ortam değişkenlerini içeren bir `.env` dosyası oluşturmanız gerekmektedir. `unified-backend` klasörünün ana dizinine `.env` adında bir dosya oluşturun ve aşağıdakine benzer şekilde doldurun:

    ```env
    # Sunucu Portu
    PORT=3001

    # JWT Anahtarı
    JWT_SECRET="COK_GUCLU_VE_UZUN_BIR_ANAHTAR_GIRINIZ"

    # Veritabanı Bilgileri
    DB_SQLITE_PATH="../server/brandos.db" # Ana SQLite DB yolu
    DB_CALENDAR_SQLITE_PATH="../content-calendar-module/backend/db.sqlite" # Takvim DB yolu

    DB_POSTGRES_USER=postgres
    DB_POSTGRES_HOST=localhost
    DB_POSTGRES_DATABASE=micro_survey_db
    DB_POSTGRES_PASSWORD="sifreniz"
    DB_POSTGRES_PORT=5432

    # API Anahtarları
    OPENAI_API_KEY="sk-..."
    ```
    *Not: Veritabanı yolları, projenin ana kök dizinine göre verilmelidir.*

3.  **Sunucuyu Başlatın:**
    Geliştirme ortamında sunucuyu başlatmak ve dosya değişikliklerini otomatik olarak algılayan `nodemon`'u kullanmak için:
    ```bash
    npm run dev
    ```
    Sunucu varsayılan olarak `http://localhost:3001` adresinde çalışmaya başlayacaktır.

---

## 4. Önemli Mimari Kararlar

- **Merkezi Hata Yakalama:** Tüm `try-catch` bloklarından ve asenkron işlemlerden gelen hatalar, `errorHandler` middleware'ine `next(error)` ile iletilir. Bu, tüm hataların tek bir yerden loglanmasını ve standart bir formatta kullanıcıya cevap dönülmesini sağlar.
- **Veritabanı Soyutlaması:** `src/database/index.js` modülü, farklı veritabanı türlerini (SQLite, PostgreSQL) soyutlar. Servisler, hangi veritabanını kullandıklarını bilmeden sadece bu modül üzerinden bağlantı talep eder.
- **Loglama Seviyeleri:** Winston logger, farklı log seviyeleri (`info`, `http`, `warn`, `error`) kullanır. Geliştirme ortamında konsola renkli çıktılar verirken, üretim ortamında `logs/` klasöründeki dosyalara yazar.
- **Modüler Rotalar:** `server/index.js` dosyasındaki devasa yapı, her biri kendi sorumluluğuna sahip küçük ve yönetilebilir route dosyalarına bölünmüştür. Bu, yeni endpoint'ler eklemeyi veya mevcutları düzenlemeyi kolaylaştırır. 