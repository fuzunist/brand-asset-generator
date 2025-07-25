import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, 
    Sparkles, 
    Package, 
    Cpu,
    CheckCircle,
    Star,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Target,
    BarChart3,
    FileText,
    Globe,
    MessageSquare,
    Calendar,
    Search,
    FileCheck,
    Award,
    Eye,
    Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const LandingPage = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const features = [
        {
            icon: <Zap className="h-8 w-8 text-indigo-500" />,
            title: "Tek Tıkla Reklam Kiti",
            description: "Marka kimliğinizle uyumlu, Google & Meta için anında reklam görselleri oluşturun.",
            benefit: "Tasarımcı beklemeden, reklam kampanyalarınızı saatler içinde yayına alın, ajans masrafından kurtulun."
        },
        {
            icon: <MessageSquare className="h-8 w-8 text-indigo-500" />,
            title: "E-posta Şablonları",
            description: "Marka sesinize göre yazılmış, Mailchimp uyumlu, hazır pazarlama e-postaları.",
            benefit: "Boş sayfa sendromuna son. Müşterilerinizle her zaman profesyonel ve tutarlı bir dilde iletişim kurun."
        },
        {
            icon: <Calendar className="h-8 w-8 text-indigo-500" />,
            title: "İçerik Takvimi",
            description: "Sektörünüzdeki trendleri ve özel günleri takip edip, size özel içerik fikirleri sunar.",
            benefit: "Sosyal medyanızda 'bugün ne paylaşsam?' derdine son. Sürekli güncel ve etkileşim odaklı kalın."
        },
        {
            icon: <Target className="h-8 w-8 text-indigo-500" />,
            title: "Mikro Anketler",
            description: "Web sitenizde anlık geri bildirim toplayın, ürün ve sloganlarınızı test edin.",
            benefit: "Tahmin yürütmeyi bırakın, doğrudan müşterinize sorun. Büyük lansmanlar öncesi riski azaltın."
        },
        {
            icon: <Search className="h-8 w-8 text-indigo-500" />,
            title: "SEO Fırsat Radarı",
            description: "Rakiplerinizin zayıf olduğu, hedef kitlenizin aradığı 'düşük rekabetli' anahtar kelimeleri tespit eder.",
            benefit: "Pahalı SEO ajanslarına ihtiyaç duymadan, Google'da rakiplerinizin önüne geçin."
        },
        {
            icon: <FileText className="h-8 w-8 text-indigo-500" />,
            title: "Akıllı Teklif Şablonları",
            description: "Markanıza özel, profesyonel satış teklifi ve sözleşme taslakları oluşturarak satış sürecinizi hızlandırın.",
            benefit: "Müşterilerinizin gözünde daha kurumsal ve güvenilir bir imaj çizin, satışlarınızı daha hızlı kapatın."
        },
        {
            icon: <Globe className="h-8 w-8 text-indigo-500" />,
            title: "Canlı Medya Kiti",
            description: "Gazeteciler ve partnerler için her zaman güncel olan, tek linkle paylaşılabilir bir basın odası oluşturun.",
            benefit: "Bir daha asla 'yüksek çözünürlüklü logonuz var mı?' e-postasıyla vakit kaybetmeyin."
        },
        {
            icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
            title: "Düşünce Liderliği Planı",
            description: "Sektörünüzdeki trendleri analiz ederek, LinkedIn ve blog için uzmanlık gösteren içerik başlıkları önerir.",
            benefit: "Sadece ürün satan değil, sektörüne yön veren bir uzman olarak konumlanın."
        },
        {
            icon: <CheckCircle className="h-8 w-8 text-indigo-500" />,
            title: "Marka Tutarlılık Denetçisi",
            description: "Web sitenizi periyodik olarak tarar, marka kılavuzunuza uymayan renk veya font kullanımını raporlar.",
            benefit: "Farklı departmanların yarattığı görsel karmaşayı önleyin. Markanızın her yerde profesyonel görünmesini garantileyin."
        },
        {
            icon: <Users className="h-8 w-8 text-indigo-500" />,
            title: "Partner & Ajans Portalı",
            description: "Freelancer ve ajanslarınız için sadece onaylı marka varlıklarına ulaşabilecekleri, kısıtlı bir erişim paneli.",
            benefit: "Ajansınızın yanlış logo kullanma riskini sıfırlayın. Marka kontrolünü kaybetmeden güvenle iş birliği yapın."
        },
        {
            icon: <Eye className="h-8 w-8 text-indigo-500" />,
            title: "Algı Analizi",
            description: "Markanız hakkındaki sosyal medya konuşmalarının duygu analizini yapın.",
            benefit: "Müşterilerinizin sizin hakkınızda ne konuştuğunu ilk siz duyun. Potansiyel krizleri büyümeden önce tespit edin."
        },
        {
            icon: <Settings className="h-8 w-8 text-indigo-500" />,
            title: "Web Sitesi Raporu",
            description: "Sitenizin marka tutarlılığını, hızını ve mobil uyumunu otomatik olarak denetleyin.",
            benefit: "Yavaş veya kullanışsız bir site yüzünden müşteri kaybetmeye son. Ziyaretçi deneyimini iyileştirerek satışlarınızı artırın."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-pink-100/50"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        Bir <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Logodan</span> Daha Fazlası.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Markanız bir resimle başlamaz, bir vizyonla başlar. Biz o vizyonu önce bir logoya, sonra bir kimliğe, en sonunda ise markanızın atan kalbi olan bir işletim sistemine dönüştürüyoruz.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard">
                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full transform hover:scale-105 transition-all">
                                Yolculuğu Keşfet
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="font-bold py-4 px-8 rounded-full"
                            onClick={() => {
                                const step3Section = document.getElementById('step3');
                                if (step3Section) {
                                    step3Section.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            Nasıl Çalışır?
                        </Button>
                    </div>
                </div>
            </section>

            {/* Step 1: Logo - Kanca */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 p-8">
                        <div className="text-indigo-600 font-bold tracking-wider mb-2">AŞAMA 1: KANCA</div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Her Şey Bir Fikirle Başlar</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Markanızın ilk izlenimi, ilk tanışması. Logo tasarımı sadece bir görsel değil, markanızın DNA'sının görsel ifadesidir.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Profesyonel logo tasarımı</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Farklı formatlarda teslim</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Marka kimliği kılavuzu</span>
                            </div>
                        </div>
                        <Link to="/dashboard">
                            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                                Logo Oluştur
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="md:w-1/2 p-8 flex justify-center">
                        <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-8 rounded-2xl shadow-2xl">
                            <Sparkles className="h-32 w-32 text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-indigo-800 text-center">Logo Generator</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Kit - Lansman Paketi */}
            <section className="py-20 md:py-32 bg-gray-50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row-reverse items-center">
                    <div className="md:w-1/2 p-8">
                        <div className="text-pink-500 font-bold tracking-wider mb-2">AŞAMA 2: KİT</div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Markanızı Hayata Geçirin</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Logo sadece başlangıç. Şimdi markanızı her platformda tutarlı ve etkileyici gösterecek tüm araçları oluşturun.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Kartvizit tasarımları</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>E-posta imzası</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Basın kiti</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                <span>Marka kitabı</span>
                            </div>
                        </div>
                        <Link to="/dashboard">
                            <Button className="mt-6 bg-pink-600 hover:bg-pink-700">
                                Marka Kitini Oluştur
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="md:w-1/2 p-8 flex justify-center">
                        <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-8 rounded-2xl shadow-2xl">
                            <Package className="h-32 w-32 text-pink-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-pink-800 text-center">Brand Launch Kit</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 3: Brand OS - İşletim Sistemi */}
            <section id="step3" className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-bold tracking-wider mb-2">AŞAMA 3: BRAND OS</div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Markanızın Merkezi Sinir Sistemi</h2>
                        <p className="text-lg text-gray-600">
                            Lansman bir sondur, ama büyüme sürekli bir yolculuktur. Brand OS, markanızın günlük operasyonlarını yürüten, rakipleri izleyen, içerik üreten ve sizi koruyan akıllı bir işletim sistemidir.
                        </p>
                    </div>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center mb-3">
                                        {feature.icon}
                                        <h3 className="font-bold text-lg ml-3">{feature.title}</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                                    <div className="pt-3 border-t border-gray-100">
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Faydası Ne?</h4>
                                        <p className="text-xs text-gray-600 italic">{feature.benefit}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/dashboard">
                            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full">
                                Brand OS'a Geç
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-20">
                <div className="container mx-auto text-center px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Bir Sonraki Büyük Marka Siz Olun.</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        Fikirden imparatorluğa giden yolda, her adımda yanınızdayız. Sadece bir logo ile başlayın ve markanızın potansiyelini bizimle ortaya çıkarın.
                    </p>
                    <Link to="/dashboard">
                        <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-full">
                            Ücretsiz Başlayın ve Markanızı İnşa Edin
                        </Button>
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 