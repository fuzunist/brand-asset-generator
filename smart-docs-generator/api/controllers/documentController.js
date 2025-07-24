const { Document, Packer } = require('docx');
const { generateProposal } = require('../services/proposalGenerator');
const { generateContract } = require('../services/contractGenerator');
const { getUserBrandData } = require('../services/userService');
const { processLogo } = require('../../utils/imageProcessor');

const generateDocument = async (req, res) => {
  try {
    const { templateType, formData } = req.body;
    
    // Get user brand data (mock for now - in production this would come from auth/DB)
    const brandData = await getUserBrandData(req.userId || 'demo-user');
    
    // Process logo if exists
    let logoBuffer = null;
    if (brandData.logoPath) {
      logoBuffer = await processLogo(brandData.logoPath);
    }

    // Merge brand data with form data
    const documentData = {
      ...formData,
      ...brandData,
      logoBuffer
    };

    // Generate document based on template type
    let doc;
    switch (templateType) {
      case 'proposal':
        doc = await generateProposal(documentData);
        break;
      case 'contract':
        doc = await generateContract(documentData);
        break;
      default:
        throw new Error('Invalid template type');
    }

    // Convert document to buffer
    const buffer = await Packer.toBuffer(doc);

    // Set response headers
    // Clean filename from special characters
    const cleanClientName = formData.clientName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_'); // Replace spaces with underscore
    
    const filename = templateType === 'proposal' 
      ? `Teklif_${cleanClientName}.docx`
      : `Sozlesme_${cleanClientName}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the document
    res.send(buffer);

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate document',
        details: error.message
      }
    });
  }
};

module.exports = {
  generateDocument
};