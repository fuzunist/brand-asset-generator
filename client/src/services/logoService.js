import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    doc,
    getDoc
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
            const logosRef = collection(db, 'logos');
            const q = query(
                logosRef,
                where('status', '==', 'published'),
                where('tags', 'array-contains', industry.toLowerCase()),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const logos = [];

            for (const doc of querySnapshot.docs) {
                const logoData = doc.data();
                try {
                    // PNG dosyasının download URL'ini al
                    const pngRef = ref(storage, logoData.storagePath_png_source);
                    const pngUrl = await getDownloadURL(pngRef);

                    logos.push({
                        id: doc.id,
                        ...logoData,
                        pngUrl,
                        previewUrl: pngUrl // PNG'yi preview olarak kullan
                    });
                } catch (error) {
                    console.error(`PNG URL alınamadı: ${doc.id}`, error);
                    // Hata durumunda bu logoyu atla
                }
            }

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
                        const pngRef = ref(storage, logoData.storagePath_png_source);
                        const pngUrl = await getDownloadURL(pngRef);

                        logos.push({
                            id: doc.id,
                            ...logoData,
                            pngUrl,
                            previewUrl: pngUrl
                        });
                    } catch (error) {
                        console.error(`PNG URL alınamadı: ${doc.id}`, error);
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
     * Tüm yayınlanmış logoları getir
     * @param {number} limit - Kaç logo getirileceği
     * @returns {Promise<Array>} Logo listesi
     */
    static async getAllPublishedLogos(limitCount = 20) {
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
                try {
                    const pngRef = ref(storage, logoData.storagePath_png_source);
                    const pngUrl = await getDownloadURL(pngRef);

                    logos.push({
                        id: doc.id,
                        ...logoData,
                        pngUrl,
                        previewUrl: pngUrl
                    });
                } catch (error) {
                    console.error(`PNG URL alınamadı: ${doc.id}`, error);
                }
            }

            return logos;
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
            const pngRef = ref(storage, logoData.storagePath_png_source);
            const pngUrl = await getDownloadURL(pngRef);

            return {
                id: logoDoc.id,
                ...logoData,
                pngUrl,
                previewUrl: pngUrl
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
                previewUrl: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Logo+1',
                pngUrl: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Logo+1'
            },
            {
                id: '2',
                name: 'Classic Professional',
                description: 'Geleneksel ve güvenilir',
                tags: [industry.toLowerCase(), 'klasik', 'profesyonel', 'güvenilir'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Logo+2',
                pngUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Logo+2'
            },
            {
                id: '3',
                name: 'Creative Bold',
                description: 'Yaratıcı ve dikkat çekici',
                tags: [industry.toLowerCase(), 'yaratıcı', 'dikkat çekici', 'enerjik'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Logo+3',
                pngUrl: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Logo+3'
            },
            {
                id: '4',
                name: 'Tech Future',
                description: 'Teknolojik ve gelecekçi',
                tags: [industry.toLowerCase(), 'teknolojik', 'gelecekçi', 'inovasyon'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=Logo+4',
                pngUrl: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=Logo+4'
            },
            {
                id: '5',
                name: 'Elegant Simple',
                description: 'Zarif ve basit',
                tags: [industry.toLowerCase(), 'zarif', 'basit', 'şık'],
                industry: industry,
                status: 'published',
                createdAt: new Date(),
                previewUrl: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Logo+5',
                pngUrl: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Logo+5'
            }
        ];

        return mockLogos;
    }
} 