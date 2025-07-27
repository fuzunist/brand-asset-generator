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
     * @param {string} options.industry - Filtrelenecek sektör (null ise tüm logoları getir)
     * @returns {Promise<{logos: Array, lastTimestamp: import('firebase/firestore').Timestamp}>} Logo listesi ve bir sonraki sayfa için son dokümanın timestamp'i
     */
    static async getAllPublishedLogos({ limitCount = 4, lastVisibleTimestamp = null, industry = null }) {
        try {
            console.log(`📋 Yayınlanmış logolar getiriliyor... Limit: ${limitCount}, Industry: ${industry || 'Tümü'}`);
            
            const logosRef = collection(db, 'logos');
            
            // Basit sorgu - industry filtresi varsa daha çok al, sonra client-side filtrele
            const fetchLimit = industry ? limitCount * 5 : limitCount;
            
            const queryConstraints = [
                where('status', '==', 'published'),
                orderBy('createdAt', 'desc'),
                limit(fetchLimit)
            ];

            if (lastVisibleTimestamp) {
                queryConstraints.push(startAfter(lastVisibleTimestamp));
            }
            
            const q = query(logosRef, ...queryConstraints);
            const querySnapshot = await getDocs(q);
            console.log(`📊 Sorgu sonucu: ${querySnapshot.docs.length} doküman bulundu`);
            
            const logos = [];
            let processedCount = 0;

            for (const doc of querySnapshot.docs) {
                const logoData = doc.data();
                processedCount++;
                
                // Client-side industry filtresi
                if (industry && logoData.industry !== industry) {
                    continue; // Bu logoyu atla
                }
                
                try {
                    if (logoData.storagePath_svg) {
                        const svgRef = ref(storage, logoData.storagePath_svg);
                        const svgUrl = await getDownloadURL(svgRef);

                        logos.push({
                            id: doc.id,
                            ...logoData,
                            svgUrl,
                            previewUrl: svgUrl,
                            firestoreDoc: doc 
                        });
                        
                        // Tam istenen sayıya ulaştığında dur
                        if (logos.length >= limitCount) {
                            break;
                        }
                    }
                } catch (error) {
                    console.error(`❌ SVG URL alınamadı: ${doc.id}`, error);
                }
            }
            
            // Son dokümanın timestamp'ini al (pagination için)
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            const lastTimestamp = lastDoc ? lastDoc.data().createdAt : null;
            
            console.log(`✅ ${logos.length} logo yüklendi (${processedCount} doküman işlendi)`);
            
            return { 
                logos, 
                lastTimestamp,
                hasMore: querySnapshot.docs.length === fetchLimit && lastTimestamp !== null
            };
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
     * Firebase'deki tüm logoları inceleyip industry dağılımını çıkarır
     * @returns {Promise<Object>} Industry değerleri ve sayıları
     */
    static async getIndustryDistribution() {
        try {
            console.log('🔍 Firebase\'deki tüm logolar inceleniyor...');
            
            const logosRef = collection(db, 'logos');
            const q = query(
                logosRef,
                where('status', '==', 'published')
            );

            const querySnapshot = await getDocs(q);
            console.log(`📊 Toplam ${querySnapshot.docs.length} published logo bulundu`);
            
            const industryCount = {};
            let totalLogos = 0;

            querySnapshot.docs.forEach(doc => {
                const logoData = doc.data();
                const industry = logoData.industry;
                
                if (industry) {
                    industryCount[industry] = (industryCount[industry] || 0) + 1;
                    totalLogos++;
                } else {
                    console.warn(`⚠️ Industry değeri olmayan logo: ${doc.id}`);
                }
            });

            // Sonuçları sırala (en çoktan aza)
            const sortedIndustries = Object.entries(industryCount)
                .sort(([,a], [,b]) => b - a)
                .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

            console.log('🎯 INDUSTRY DAĞILIMI:');
            console.log('='.repeat(50));
            Object.entries(sortedIndustries).forEach(([industry, count]) => {
                const percentage = ((count / totalLogos) * 100).toFixed(1);
                console.log(`📈 ${industry.padEnd(25)} : ${count.toString().padStart(3)} logo (${percentage}%)`);
            });
            console.log('='.repeat(50));
            console.log(`📊 TOPLAM: ${totalLogos} logo, ${Object.keys(sortedIndustries).length} farklı sektör`);

            return {
                distribution: sortedIndustries,
                totalLogos,
                uniqueIndustries: Object.keys(sortedIndustries).length
            };
        } catch (error) {
            console.error('Industry dağılımı alınamadı:', error);
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