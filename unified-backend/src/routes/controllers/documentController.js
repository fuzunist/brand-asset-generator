// unified-backend/src/routes/controllers/documentController.js
const { Packer } = require('docx');
const { generateProposal } = require('../../services/proposalGenerator');
const { generateContract } = require('../../services/contractGenerator');
const { getUserBrandData } = require('../../services/userService');
const { processLogo } = require('../../utils/imageProcessor');
const logger = require('../../utils/logger');

const generateDocument = async (req, res, next) => {
  try {
    const { templateType, formData } = req.body;
    logger.info(`Generating document of type '${templateType}' for client: ${formData.clientName}`);
    
    // In a real app, userId would come from a JWT token or session.
    const userId = req.user?.id || 'demo-user';
    const brandData = await getUserBrandData(userId);
    
    let logoBuffer = null;
    if (brandData.logoPath) {
      logoBuffer = await processLogo(brandData.logoPath);
    }

    const documentData = { ...formData, ...brandData, logoBuffer };

    let doc;
    switch (templateType) {
      case 'proposal':
        doc = await generateProposal(documentData);
        break;
      case 'contract':
        doc = await generateContract(documentData);
        break;
      default:
        // This case should be caught by validation, but as a safeguard:
        return res.status(400).json({ error: 'Invalid template type' });
    }

    const buffer = await Packer.toBuffer(doc);

    const cleanClientName = (formData.clientName || 'document')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const filename = `${templateType}_${cleanClientName}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    logger.info(`Successfully generated and sending document: ${filename}`);
    res.send(buffer);

  } catch (error) {
    logger.error('Document generation error:', {
        message: error.message,
        stack: error.stack,
        requestBody: req.body
    });
    next(error); // Pass to the centralized error handler
  }
};

module.exports = {
  generateDocument
}; 