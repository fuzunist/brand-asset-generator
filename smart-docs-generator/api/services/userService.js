// Mock user service - In production, this would fetch from database
const getUserBrandData = async (userId) => {
  // Mock brand data for demo
  return {
    companyName: 'TechStart Solutions',
    companyTagline: 'Dijital Dönüşümün Lideri',
    companyAddress: 'Levent, Büyükdere Cad. No:123',
    companyCity: 'İstanbul',
    companyPostalCode: '34394',
    companyCountry: 'Türkiye',
    companyPhone: '+90 212 123 45 67',
    companyEmail: 'info@techstart.com',
    companyWebsite: 'www.techstart.com',
    primaryColor: '#2563eb', // Blue-600
    secondaryColor: '#1e40af', // Blue-800
    fontFamily: 'Calibri',
    logoPath: null, // Will be set to actual S3 path in production
    taxNumber: '1234567890',
    taxOffice: 'Büyük Mükellefler VD'
  };
};

module.exports = {
  getUserBrandData
};