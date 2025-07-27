// unified-backend/src/services/userService.js
const logger = require('../utils/logger');
// In the future, this would be replaced with a real database call
// const { getMainDb } = require('../database');

// Mock user service - In production, this would fetch from a database
const getUserBrandData = async (userId) => {
  logger.info(`Fetching mock brand data for userId: ${userId}`);
  
  // This is mock data. In a real application, you would query
  // the main SQLite database using `getMainDb()` to fetch brand
  // details associated with the user's account.
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
    logoPath: null, // This would be an S3 or public URL in a real app
    taxNumber: '1234567890',
    taxOffice: 'Büyük Mükellefler VD'
  };
};

module.exports = {
  getUserBrandData
}; 