import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Star } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');

    console.log('LandingPage bileşeni yüklendi.');

    const handleStart = () => {
        console.log('LandingPage - "Başlayın" veya "Hemen Başla" butonuna tıklandı.');
        console.log(`'Başlayın' butonuna tıklandı. Şirket adı: "${companyName}"`);
        console.log('Logo sonuçları sayfasına yönlendiriliyor...');
        navigate('/logo-results', { state: { formData: { companyName: companyName || 'My Awesome Company' } } });
    };

    const handleCompanyNameChange = (e) => {
        console.log(`Şirket adı input değeri değişti: "${e.target.value}"`);
        setCompanyName(e.target.value);
    };

    const features = [
        "Saniyeler içinde Yapay Zeka Destekli Logo Üretimi",
        "Kapsamlı Marka Kiti (Renkler, Yazı Tipleri)",
        "Sosyal Medya ve Baskıya Hazır Dosyalar",
        "Kartvizit ve Antetli Kağıt Tasarımları"
    ];

    const testimonials = [
        {
            name: "Selin K.",
            title: "Kurucu, TechNova",
            avatar: "https://i.pravatar.cc/48?u=selin",
            text: "Markamız için mükemmel logoyu dakikalar içinde bulduk. Süreç inanılmaz derecede sezgisel ve sonuçlar profesyoneldi."
        },
        {
            name: "Murat E.",
            title: "Pazarlama Müdürü, CreativeHub",
            avatar: "https://i.pravatar.cc/48?u=murat",
            text: "Ficonica, marka kimliğimizi oluşturma şeklimizde devrim yarattı. Kaliteden ödün vermeden zamandan ve paradan tasarruf sağladık."
        },
        {
            name: "Elif A.",
            title: "Serbest Tasarımcı",
            avatar: "https://i.pravatar.cc/48?u=elif",
            text: "Müşterilerime hızlı bir şekilde yüksek kaliteli logo seçenekleri sunmak için vazgeçilmez bir araç. Herkese şiddetle tavsiye ederim!"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
            {/* Gradient Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-400 rounded-full blur-3xl opacity-25 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10">
                <div className="container mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">Ficonica</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">Özellikler</a>
                        <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Referanslar</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Fiyatlandırma</a>
                    </nav>
                    <button 
                        onClick={() => console.log('LandingPage - "Giriş Yap" butonuna tıklandı.')}
                        className="hidden md:block bg-white/10 backdrop-blur-md text-white font-semibold px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                        Giriş Yap
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-40 pb-20 text-center relative z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                            Yapay Zeka Destekli Marka Oluşturucu
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                            Harika Bir Marka <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Yaratın, Anında.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            İşletmeniz için sadece bir logo değil, eksiksiz bir marka kimliği oluşturun. Yapay zeka gücüyle fikirlerinizi saniyeler içinde hayata geçirin.
                        </p>

                        <div className="flex justify-center mb-8">
                            <div className="relative w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Şirket adınızı girin..."
                                    value={companyName}
                                    onChange={handleCompanyNameChange}
                                    className="w-full text-lg px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none text-white placeholder-gray-400"
                                />
                                <button
                                    onClick={handleStart}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-full flex items-center hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                                >
                                    Başlayın <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">Kredi kartı gerekmez. Anında başlayın.</p>
                    </div>
                </div>
            </main>

            {/* Logo Showcase */}
            <section className="py-12 relative z-10">
                <div className="container mx-auto px-6">
                    <p className="text-center text-gray-400 mb-6 font-semibold">BİNLERCE GİRİŞİMCİ TARAFINDAN GÜVENİLİYOR</p>
                    <div className="relative h-40 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black via-transparent to-black z-10"></div>
                        <div className="flex animate-scroll">
                           {/* Örnek logo veya resimler buraya eklenebilir */}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section id="features" className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Sadece Bir Logo Değil, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Tam Bir Marka Kimliği</span></h2>
                        <p className="text-lg text-gray-300">Başarılı bir marka oluşturmak için ihtiyacınız olan her şey tek bir yerde.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{feature}</h3>
                                        <p className="text-gray-300">Yüksek kaliteli ve profesyonel sonuçlar.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 transform rotate-3 shadow-2xl border border-white/10">
                           <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/10">
                               <h4 className="font-bold text-lg mb-4 text-white">Marka Kitiniz</h4>
                               <p className="text-gray-300">Logonuz, renk paletiniz, yazı tipleriniz ve daha fazlası - hepsi markanızla tutarlı.</p>
                           </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Girişimciler <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Ficonica'yı Seviyor</span></h2>
                        <p className="text-lg text-gray-300">Gerçek kullanıcılardan gerçek yorumlar.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col hover:bg-white/10 transition-all">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                                </div>
                                <p className="text-gray-300 mb-6 flex-grow">"{testimonial.text}"</p>
                                <div className="flex items-center">
                                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <p className="font-semibold text-white">{testimonial.name}</p>
                                        <p className="text-gray-400">{testimonial.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 p-12 rounded-3xl shadow-2xl text-center relative overflow-hidden">
                        {/* Additional gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-400/20 rounded-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4 text-white">Markanızı Bugün Hayata Geçirin</h2>
                            <p className="text-xl opacity-90 mb-8 text-white">Tek seferlik ödeme ile tüm özelliklere ömür boyu erişim.</p>
                            <div className="text-5xl font-extrabold mb-2 text-white">
                                ₺299
                                <span className="text-lg font-normal opacity-80 ml-2">/ tek seferlik</span>
                            </div>
                            <p className="opacity-80 mb-8 text-white">Gizli ücretler yok. Abonelik yok.</p>
                            <button onClick={handleStart} className="bg-white text-purple-600 font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-lg">
                                Hemen Başla ve Markanı Yarat
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 relative z-10">
                <div className="container mx-auto px-6 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Ficonica. Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 