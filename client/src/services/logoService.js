import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    doc,
    getDoc,
    startAfter
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export class LogoService {
    /**
     * Belirli bir sektör için logoları getir
     * @param {string} industry - Sektör adı
     * @param {number} limit - Kaç logo getirileceği
     * @returns {Promise<Array>} Logo listesi
     */
    static async getLogosByIndustry(industry, limitCount = 10) {
        try {
            console.log(`🔍 Sektöre göre logo aranıyor: ${industry}`);
            console.log(`🏭 Aranan sektör: ${industry.toLowerCase()}`);
            
            const logosRef = collection(db, 'logos');
            // Tüm logoları getir, client-side filtreleme yap
            const q = query(
                logosRef,
                where('status', '==', 'published'),
                limit(limitCount * 2) // Daha fazla logo getir
            );

            console.log('📋 Firestore sorgusu oluşturuldu');
            const querySnapshot = await getDocs(q);
            console.log(`📊 Sorgu sonucu: ${querySnapshot.docs.length} doküman bulundu`);
            
            const logos = [];

            for (const doc of querySnapshot.docs) {
                const logoData = doc.data();
                console.log(`📄 Logo dokümanı: ${doc.id}`, logoData);
                
                // Client-side filtreleme - sektör eşleşmesi veya benzer tag'ler
                const logoTags = logoData.tags || [];
                const hasMatchingIndustry = logoTags.some(tag => 
                    tag.toLowerCase() === industry.toLowerCase() ||
                    tag.toLowerCase().includes(industry.toLowerCase()) ||
                    industry.toLowerCase().includes(tag.toLowerCase())
                );
                
                // Eğer sektör eşleşmesi yoksa, benzer tag'leri kontrol et
                const hasSimilarTags = !hasMatchingIndustry && logoTags.some(tag => {
                    const similarTags = {
                        'technology': ['tech', 'digital', 'innovation', 'modern', 'future'],
                        'agriculture': ['farming', 'nature', 'organic', 'growth', 'sustainability'],
                        'healthcare': ['health', 'medical', 'care', 'wellness', 'healing'],
                        'education': ['learning', 'school', 'academic', 'knowledge'],
                        'automotive': ['car', 'vehicle', 'transport', 'mobility'],
                        'beauty': ['cosmetics', 'aesthetics', 'wellness', 'care'],
                        'construction': ['building', 'architecture', 'development'],
                        'marketing': ['advertising', 'promotion', 'branding'],
                        'legal': ['law', 'justice', 'professional'],
                        'real estate': ['property', 'housing', 'development'],
                        'manufacturing': ['production', 'industrial', 'factory'],
                        'finance': ['banking', 'investment', 'money'],
                        'e-commerce': ['online', 'digital', 'retail'],
                        'food & beverage': ['restaurant', 'catering', 'dining'],
                        'fashion': ['clothing', 'style', 'apparel'],
                        'sports': ['fitness', 'athletic', 'training'],
                        'art': ['creative', 'design', 'culture'],
                        'consulting': ['business', 'professional', 'advice'],
                        'tourism': ['travel', 'hospitality', 'vacation']
                    };
                    
                    const industrySimilar = similarTags[industry.toLowerCase()] || [];
                    return industrySimilar.includes(tag.toLowerCase());
                });
                
                if (hasMatchingIndustry || hasSimilarTags) {
                    try {
                        // SVG dosyasının download URL'ini al
                        if (logoData.storagePath_svg) {
                            const svgRef = ref(storage, logoData.storagePath_svg);
                            const svgUrl = await getDownloadURL(svgRef);
                            console.log(`✅ SVG URL alındı: ${svgUrl}`);

                            logos.push({
                                id: doc.id,
                                ...logoData,
                                svgUrl,
                                previewUrl: svgUrl // SVG'yi preview olarak kullan
                            });
                        }
                    } catch (error) {
                        console.error(`❌ SVG URL alınamadı: ${doc.id}`, error);
                        if (logoData.storagePath_svg) {
                            console.error(`🔍 Storage path: ${logoData.storagePath_svg}`);
                        }
                        // Hata durumunda bu logoyu atla
                    }
                }
            }

            console.log(`🎨 Toplam ${logos.length} logo başarıyla yüklendi`);
            return logos;
        } catch (error) {
            console.error('Logolar getirilirken hata:', error);
            throw error;
        }
    }

    /**
     * Belirli anahtar kelimeler için logoları getir
     * @param {Array} keywords - Anahtar kelimeler
     * @param {number} limit - Kaç logo getirileceği
     * @returns {Promise<Array>} Logo listesi
     */
    static async getLogosByKeywords(keywords, limitCount = 10) {
        try {
            const logosRef = collection(db, 'logos');
            const q = query(
                logosRef,
                where('status', '==', 'published'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const logos = [];

            for (const doc of querySnapshot.docs) {
                const logoData = doc.data();
                
                // Anahtar kelimelerle eşleşme kontrolü
                const logoTags = logoData.tags || [];
                const hasMatchingKeyword = keywords.some(keyword => 
                    logoTags.some(tag => 
                        tag.toLowerCase().includes(keyword.toLowerCase())
                    )
                );

                if (hasMatchingKeyword) {
                    try {
                        if (logoData.storagePath_svg) {
                            const svgRef = ref(storage, logoData.storagePath_svg);
                            const svgUrl = await getDownloadURL(svgRef);

                            logos.push({
                                id: doc.id,
                                ...logoData,
                                svgUrl,
                                previewUrl: svgUrl
                            });
                        }
                    } catch (error) {
                        console.error(`SVG URL alınamadı: ${doc.id}`, error);
                    }
                }
            }

            return logos;
        } catch (error) {
            console.error('Logolar getirilirken hata:', error);
            throw error;
        }
    }

    /**
     * Tüm yayınlanmış logoları sayfalanmış olarak getir
     * @param {Object} options - Sayfalama seçenekleri
     * @param {number} options.limitCount - Kaç logo getirileceği
     * @param {import('firebase/firestore').Timestamp} options.lastVisibleTimestamp - Hangi dokümandan sonra başlanacağı (timestamp)
     * @returns {Promise<{logos: Array, lastTimestamp: import('firebase/firestore').Timestamp}>} Logo listesi ve bir sonraki sayfa için son dokümanın timestamp'i
     */
    static async getAllPublishedLogos({ limitCount = 4, lastVisibleTimestamp = null }) {
        try {
            console.log(`📋 Yayınlanmış logolar getiriliyor... Limit: ${limitCount}`);
            
            const logosRef = collection(db, 'logos');
            
            const queryConstraints = [
                where('status', '==', 'published'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            ];

            if (lastVisibleTimestamp) {
                queryConstraints.push(startAfter(lastVisibleTimestamp));
            }
            
            const q = query(logosRef, ...queryConstraints);

            console.log('📋 Firestore sorgusu oluşturuldu');
            const querySnapshot = await getDocs(q);
            console.log(`📊 Sorgu sonucu: ${querySnapshot.docs.length} doküman bulundu`);
            
            const logos = [];

            for (const doc of querySnapshot.docs) {
                const logoData = doc.data();
                try {
                    if (logoData.storagePath_svg) {
                        const svgRef = ref(storage, logoData.storagePath_svg);
                        const svgUrl = await getDownloadURL(svgRef);

                        logos.push({
                            id: doc.id,
                            ...logoData,
                            svgUrl,
                            previewUrl: svgUrl,
                            // Firestore Document'ını sonradan kullanabilmek için ekliyoruz
                            firestoreDoc: doc 
                        });
                    }
                } catch (error) {
                    console.error(`SVG URL alınamadı: ${doc.id}`, error);
                }
            }
            
            // Bir sonraki sorgu için son görünür dokümanın timestamp'ini al
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            const lastTimestamp = lastDoc ? lastDoc.data().createdAt : null;

            return { logos, lastTimestamp };
        } catch (error) {
            console.error('Logolar getirilirken hata:', error);
            throw error;
        }
    }

    /**
     * Belirli bir logoyu ID ile getir
     * @param {string} logoId - Logo ID'si
     * @returns {Promise<Object>} Logo verisi
     */
    static async getLogoById(logoId) {
        try {
            const logoRef = doc(db, 'logos', logoId);
            const logoDoc = await getDoc(logoRef);

            if (!logoDoc.exists()) {
                throw new Error('Logo bulunamadı');
            }

            const logoData = logoDoc.data();

            if (!logoData.storagePath_svg) {
                throw new Error("Logo için SVG depolama yolu bulunamadı.");
            }

            const svgRef = ref(storage, logoData.storagePath_svg);
            const svgUrl = await getDownloadURL(svgRef);

            return {
                id: logoDoc.id,
                ...logoData,
                svgUrl,
                previewUrl: svgUrl
            };
        } catch (error) {
            console.error('Logo getirilirken hata:', error);
            throw error;
        }
    }

    /**
     * Mock logo verileri (Firebase bağlantısı olmadığında kullanılır)
     * @param {string} industry - Sektör
     * @returns {Array} Mock logo listesi
     */
    static getMockLogos(industry = 'teknoloji') {
        const mockLogos = [
            {
                id: '1',
                name: 'Modern Minimalist',
                description: 'Temiz ve modern tasarım',
                tags: [industry.toLowerCase(), 'modern', 'minimalist', 'teknoloji'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://picsum.photos/300/200?random=1',
                svgUrl: 'https://picsum.photos/300/200?random=1'
            },
            {
                id: '2',
                name: 'Classic Professional',
                description: 'Geleneksel ve güvenilir',
                tags: [industry.toLowerCase(), 'klasik', 'profesyonel', 'güvenilir'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://picsum.photos/300/200?random=2',
                svgUrl: 'https://picsum.photos/300/200?random=2'
            },
            {
                id: '3',
                name: 'Creative Bold',
                description: 'Yaratıcı ve dikkat çekici',
                tags: [industry.toLowerCase(), 'yaratıcı', 'dikkat çekici', 'enerjik'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://picsum.photos/300/200?random=3',
                svgUrl: 'https://picsum.photos/300/200?random=3'
            },
            {
                id: '4',
                name: 'Tech Future',
                description: 'Teknolojik ve gelecekçi',
                tags: [industry.toLowerCase(), 'teknolojik', 'gelecekçi', 'inovasyon'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://picsum.photos/300/200?random=4',
                svgUrl: 'https://picsum.photos/300/200?random=4'
            },
            {
                id: '5',
                name: 'Elegant Simple',
                description: 'Zarif ve basit',
                tags: [industry.toLowerCase(), 'zarif', 'basit', 'şık'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://picsum.photos/300/200?random=5',
                svgUrl: 'https://picsum.photos/300/200?random=5'
            }
        ];

        return mockLogos;
    }
} 