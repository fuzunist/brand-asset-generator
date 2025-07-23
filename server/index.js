require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const OpenAI = require('openai');
const assetGenerator = require('./assetGenerator');
const { generateLetterhead } = require('./letterheadGenerator');
const { generateSocialMediaKit, createZipStream } = require('./socialMediaKitGenerator');
const { generateDocument } = require('./documentGenerator');
const { generateWebsiteReport } = require('./websiteReportGenerator');
const AdKitGenerator = require('./adKitGenerator');
const setupDatabase = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-key-that-is-at-least-32-bytes';

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// --- Database Connection ---
let db;

// --- Multer Setup ---

// Storage for temporary files that will be processed and deleted
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  }
});

// Storage for persistent signature assets
const signatureStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/signatures';
        fs.mkdir(dir, { recursive: true }).then(() => {
            cb(null, dir);
        }).catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        // Use a timestamp and original name to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: tempStorage });
const uploadSignature = multer({ storage: signatureStorage });

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
// Serve generated assets statically for puppeteer
app.use('/generated', express.static(path.join(__dirname, 'generated')));
// Serve static files from project root (for example_logo.png)
app.use(express.static(path.join(__dirname, '..')));

// --- Auth Middleware (Placeholder) ---
// This middleware will protect our routes
const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authorization.split(' ')[1];
    
    // Development bypass for dev-token
    if (token === 'dev-token') {
        req.user = {
            id: 1,
            email: 'dev@example.com',
            accountId: 1,
            role: 'owner'
        };
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adds user payload (e.g., id, email, account_id, role) to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// --- Role-based Access Control Middleware ---
const rbacMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
};

// --- Auth Routes ---

// User registration
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, password, companyName } = req.body;
    if (!fullName || !email || !password || !companyName) {
        return res.status(400).json({ message: 'Please provide full name, email, password, and company name.' });
    }

    try {
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        // Use a transaction to ensure atomicity
        await db.run('BEGIN');
        
        const accountResult = await db.run('INSERT INTO accounts (name) VALUES (?)', companyName);
        const accountId = accountResult.lastID;

        const userResult = await db.run(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            fullName, email, passwordHash
        );
        const userId = userResult.lastID;

        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            accountId, userId, 'owner'
        );
        
        await db.run('COMMIT');

        res.status(201).json({ message: 'User registered successfully as owner of new account.' });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Fetch user's membership to include in the token
        const membership = await db.get('SELECT account_id, role FROM account_members WHERE user_id = ?', user.id);
        if (!membership) {
            return res.status(403).json({ message: 'User is not associated with any account.' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            accountId: membership.account_id,
            role: membership.role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: tokenPayload });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Team Management Routes ---

// Invite a new user
app.post('/api/invitations', authMiddleware, rbacMiddleware(['owner']), async (req, res) => {
    const { inviteeEmail } = req.body;
    const { id: inviterId, accountId } = req.user;

    if (!inviteeEmail) {
        return res.status(400).json({ message: 'Invitee email is required.' });
    }

    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 3600 * 1000); // 72 hours from now

        await db.run(
            'INSERT INTO invitations (account_id, inviter_id, invitee_email, token, expires_at) VALUES (?, ?, ?, ?, ?)',
            accountId, inviterId, inviteeEmail, token, expiresAt.toISOString()
        );

        // TODO: Send an actual email with the invitation link
        const invitationLink = `http://localhost:3000/accept-invitation?token=${token}`;
        console.log(`Invitation Link for ${inviteeEmail}: ${invitationLink}`);

        res.status(201).json({ message: 'Invitation sent successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: 'An invitation for this email already exists for this account.' });
        }
        console.error('Invitation error:', error);
        res.status(500).json({ message: 'Server error while sending invitation.' });
    }
});

// Accept an invitation
app.post('/api/invitations/accept', async (req, res) => {
    const { token, fullName, password } = req.body;
    if (!token || !fullName || !password) {
        return res.status(400).json({ message: 'Token, full name, and password are required.' });
    }

    try {
        const invitation = await db.get('SELECT * FROM invitations WHERE token = ? AND status = ?', token, 'pending');
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found, has expired, or has already been accepted.' });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return res.status(410).json({ message: 'Invitation has expired.' });
        }

        // Check if user already exists
        let user = await db.get('SELECT * FROM users WHERE email = ?', invitation.invitee_email);
        
        await db.run('BEGIN');

        if (user) {
            // User exists, just add them to the new account as a guest.
            // Check if they are already a member of the target account
            const existingMembership = await db.get('SELECT * FROM account_members WHERE account_id = ? AND user_id = ?', invitation.account_id, user.id);
            if (existingMembership) {
                await db.run('ROLLBACK');
                return res.status(409).json({ message: 'User is already a member of this account.' });
            }
        } else {
            // User does not exist, create a new user record.
            const passwordHash = await bcrypt.hash(password, 10);
            const userResult = await db.run(
                'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
                fullName, invitation.invitee_email, passwordHash
            );
            user = { id: userResult.lastID };
        }

        // Add user to the account as a guest
        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            invitation.account_id, user.id, 'guest'
        );

        // Mark invitation as accepted
        await db.run('UPDATE invitations SET status = ? WHERE id = ?', 'accepted', invitation.id);
        
        await db.run('COMMIT');

        res.status(200).json({ message: 'Invitation accepted successfully. You can now log in.' });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: 'Server error while accepting invitation.' });
    }
});

// Get team members
app.get('/api/team', authMiddleware, rbacMiddleware(['owner']), async (req, res) => {
    const { accountId } = req.user;
    try {
        const members = await db.all(
            `SELECT u.id, u.email, u.full_name, am.role
             FROM users u
             JOIN account_members am ON u.id = am.user_id
             WHERE am.account_id = ?`,
            accountId
        );
        res.json(members);
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ message: 'Server error while fetching team members.' });
    }
});

// Remove a team member
app.delete('/api/team/:memberId', authMiddleware, rbacMiddleware(['owner']), async (req, res) => {
    const { accountId, id: currentUserId } = req.user;
    const { memberId } = req.params;

    if (parseInt(memberId, 10) === currentUserId) {
        return res.status(400).json({ message: "You cannot remove yourself." });
    }

    try {
        const result = await db.run(
            'DELETE FROM account_members WHERE user_id = ? AND account_id = ? AND role = ?',
            memberId, accountId, 'guest'
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Guest member not found or you are not authorized to remove this member.' });
        }

        res.status(200).json({ message: 'Team member removed successfully.' });
    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({ message: 'Server error while removing team member.' });
    }
});

// --- Existing Endpoints (To be protected) ---

// --- New Email Signature Endpoints ---

// Development endpoint - temporarily bypassing auth for testing
app.get('/api/user/brand-identity', (req, res) => {
    // In a real app, this data should be fetched from the database based on req.user.accountId
    // For now, we keep the hardcoded version for compatibility.
    const brandIdentity = {
        "brandName": "Ficonica Inc.",
        "logoUrl": `http://localhost:${port}/example_logo.png`,
        "brandColors": { 
            "primary": "#4F46E5", 
            "secondary": "#EC4899",
            "text": "#111827" 
        },
        "brandFonts": { 
            "headline": "Inter",
            "body": "Inter" 
        },
        "userProfile": {
            "fullName": "Furkan Yılmaz",
            "title": "Founder & CEO",
            "email": "furkan@ficonica.com",
            "phone": "+90 555 123 4567",
            "website": "ficonica.com",
            "socials": {
                "linkedin": "https://linkedin.com/in/furkan",
                "twitter": "https://twitter.com/furkan"
            }
        }
    };
    res.json(brandIdentity);
});

app.post('/api/upload/signature-asset', uploadSignature.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No logo file uploaded.' });
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only PNG and JPEG files are allowed.' });
    }
    
    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size must be less than 5MB.' });
    }
    
    // Construct the public URL of the uploaded file
    const logoUrl = `${req.protocol}://${req.get('host')}/public/signatures/${req.file.filename}`;
    
    res.json({ logoUrl, success: true });
});

// This endpoint and others below should be protected
app.post('/api/business-card/generate-pdf', authMiddleware, async (req, res) => {
    const { templateId, data, backSideData, brandIdentity } = req.body;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Generate front side
        const frontTemplatePath = path.join(__dirname, 'templates', `${templateId}.html`);
        let frontHtml = await fs.readFile(frontTemplatePath, 'utf-8');

        // Inject data into the front template
        frontHtml = frontHtml.replace(/{{fullName}}/g, data.fullName)
                           .replace(/{{title}}/g, data.title)
                           .replace(/{{email}}/g, data.email)
                           .replace(/{{phone}}/g, data.phone)
                           .replace(/{{website}}/g, data.website)
                           .replace(/{{logoUrl}}/g, data.logoUrl)
                           .replace(/{{primaryColor}}/g, brandIdentity.colors.primary)
                           .replace(/{{textColor}}/g, brandIdentity.colors.text)
                           .replace(/{{fontHeadline}}/g, brandIdentity.fonts.headline)
                           .replace(/{{fontBody}}/g, brandIdentity.fonts.body);

        // Generate back side
        const backTemplatePath = path.join(__dirname, 'templates', `${templateId}_back.html`);
        let backHtml = await fs.readFile(backTemplatePath, 'utf-8');

        // Inject data into the back template
        backHtml = backHtml.replace(/{{services}}/g, backSideData.services)
                          .replace(/{{additionalInfo}}/g, backSideData.additionalInfo)
                          .replace(/{{logoUrl}}/g, data.logoUrl)
                          .replace(/{{primaryColor}}/g, brandIdentity.colors.primary)
                          .replace(/{{textColor}}/g, brandIdentity.colors.text)
                          .replace(/{{fontHeadline}}/g, brandIdentity.fonts.headline)
                          .replace(/{{fontBody}}/g, brandIdentity.fonts.body);

        // Create a combined HTML with both sides
        const combinedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Business Cards</title>
            <style>
                .page { 
                    page-break-after: always; 
                    width: 3.5in; 
                    height: 2in; 
                    margin: 0; 
                    padding: 0;
                }
                .page:last-child { 
                    page-break-after: avoid; 
                }
            </style>
        </head>
        <body>
            <div class="page">
                ${frontHtml.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '').replace('</body></html>', '')}
            </div>
            <div class="page">
                ${backHtml.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '').replace('</body></html>', '')}
            </div>
        </body>
        </html>
        `;

        await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            width: '3.5in',
            height: '2in',
            printBackground: true,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
        });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Development mode auth bypass for brand book generation
const isDevelopment = process.env.NODE_ENV !== 'production';
const brandBookAuthMiddleware = isDevelopment ? 
    (req, res, next) => {
        // Dev mode: set dummy user
        req.user = { id: 1, email: 'dev@example.com', accountId: 1, role: 'owner' };
        next();
    } : authMiddleware;

app.post('/api/brand-book/generate', brandBookAuthMiddleware, upload.single('logo'), async (req, res) => {
    console.log('Brand book generation request received');
    console.log('User:', req.user);
    console.log('File info:', req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    } : 'No file');
    
    if (!req.file) {
        console.log('Error: No logo file uploaded');
        return res.status(400).json({ error: 'No logo file uploaded.' });
    }

    if (!req.body.brandIdentity) {
        console.log('Error: No brand identity data provided');
        return res.status(400).json({ error: 'Brand identity data is required.' });
    }

    let brandIdentity;
    try {
        brandIdentity = JSON.parse(req.body.brandIdentity);
        console.log('Brand identity parsed:', {
            name: brandIdentity.name,
            hasColors: !!brandIdentity.colors,
            hasFonts: !!brandIdentity.fonts
        });
    } catch (err) {
        console.log('Error parsing brand identity:', err.message);
        return res.status(400).json({ error: 'Invalid brand identity data format.' });
    }

    const logoPath = req.file.path;
    const logoMimeType = req.file.mimetype;

    // Create a temporary directory for generated assets for this request
    const tempDir = path.join(__dirname, 'generated', Date.now().toString());
    await fs.mkdir(tempDir, { recursive: true });

    try {
        // 1. Generate all dynamic assets
        const clearspaceImg = await assetGenerator.generateClearspaceImage(logoPath, logoMimeType, tempDir);
        const minSizeImg = await assetGenerator.generateMinSizeImage(logoPath, logoMimeType, tempDir);
        const logoDontsImg = await assetGenerator.generateLogoDontsImage(logoPath, logoMimeType, tempDir);
        const colorsImg = await assetGenerator.generateColorPaletteImage(brandIdentity.colors, tempDir);
        const typographyImg = await assetGenerator.generateTypographyImage(brandIdentity.fonts, tempDir);

        // 2. Convert images to base64 for embedding
        const clearspaceBase64 = await fs.readFile(path.join(tempDir, clearspaceImg), 'base64');
        const minSizeBase64 = await fs.readFile(path.join(tempDir, minSizeImg), 'base64');
        const logoDontsBase64 = await fs.readFile(path.join(tempDir, logoDontsImg), 'base64');
        const colorsBase64 = await fs.readFile(path.join(tempDir, colorsImg), 'base64');
        const typographyBase64 = await fs.readFile(path.join(tempDir, typographyImg), 'base64');

        // 3. Color conversions
        const convert = require('color-convert');
        const primaryRGB = convert.hex.rgb(brandIdentity.colors.primary.substring(1));
        const primaryCMYK = convert.hex.cmyk(brandIdentity.colors.primary.substring(1));
        const secondaryRGB = convert.hex.rgb(brandIdentity.colors.secondary.substring(1));
        const secondaryCMYK = convert.hex.cmyk(brandIdentity.colors.secondary.substring(1));

        // 4. Read the master HTML template
        const templatePath = path.join(__dirname, 'templates', 'brand_book_template.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        // 5. Logo URL for external access
        const logoUrl = `http://localhost:${port}/${logoPath}`;
        
        // 6. Generate current date
        const generationDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // 7. Replace all placeholders
        html = html.replace(/{{brandName}}/g, brandIdentity.name || 'Your Brand')
                   .replace(/{{primaryColor}}/g, brandIdentity.colors.primary)
                   .replace(/{{secondaryColor}}/g, brandIdentity.colors.secondary)
                   .replace(/{{generationDate}}/g, generationDate)
                   .replace(/{{headlineFont}}/g, brandIdentity.fonts.headline)
                   .replace(/{{bodyFont}}/g, brandIdentity.fonts.body)
                   .replace(/{{primaryRGB}}/g, primaryRGB.join(', '))
                   .replace(/{{primaryCMYK}}/g, primaryCMYK.join(', '))
                   .replace(/{{secondaryRGB}}/g, secondaryRGB.join(', '))
                   .replace(/{{secondaryCMYK}}/g, secondaryCMYK.join(', '))
                   .replace(/{{LOGO_URL}}/g, logoUrl)
                   .replace(/{{CLEARSPACE_IMG_BASE64}}/g, clearspaceBase64)
                   .replace(/{{MIN_SIZE_IMG_BASE64}}/g, minSizeBase64)
                   .replace(/{{LOGO_DONTS_IMG_BASE64}}/g, logoDontsBase64)
                   .replace(/{{COLORS_IMG_BASE64}}/g, colorsBase64)
                   .replace(/{{TYPOGRAPHY_IMG_BASE64}}/g, typographyBase64);

        // 8. Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false, // Remove header/footer as they're built into the template
            margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
        });

        await browser.close();
        
        // 9. Send PDF response
        res.contentType('application/pdf');
        res.send(pdf);

    } catch (error) {
        console.error('Error generating Brand Book PDF:', error);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('ENOENT')) {
            res.status(400).json({ error: 'Logo file not found or corrupted. Please try uploading again.' });
        } else if (error.message.includes('Invalid image')) {
            res.status(400).json({ error: 'Invalid image format. Please upload a valid PNG, JPEG, or SVG file.' });
        } else {
            res.status(500).json({ error: 'Internal server error while generating brand book. Please try again.' });
        }
    } finally {
        // 10. Cleanup uploaded file and generated assets
        await fs.unlink(logoPath);
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});

app.post('/api/letterhead/generate', brandBookAuthMiddleware, async (req, res) => {
    const { templateId = 'modern_header', customizations = {}, format = 'docx', brand_identity_id } = req.body;
    const { accountId } = req.user;

    try {
        let brandIdentity;

        // Try to fetch brand identity from database first
        if (accountId) {
            try {
                const dbBrandIdentity = await db.get(
                    'SELECT * FROM brand_identities WHERE account_id = ?',
                    accountId
                );
                
                if (dbBrandIdentity) {
                    brandIdentity = {
                        companyName: dbBrandIdentity.brand_name,
                        address: "123 Business Ave, Suite 456, New York, NY 10001", // Default address
                        phone: "+1 (555) 123-4567", // Default phone
                        email: "contact@company.com", // Default email
                        website: "www.company.com", // Default website
                        logoPath: dbBrandIdentity.logo_url && dbBrandIdentity.logo_url.includes('localhost') 
                            ? dbBrandIdentity.logo_url.replace(`http://localhost:${port}`, path.join(__dirname, '..'))
                            : path.join(__dirname, '..', 'example_logo.png'),
                        colors: {
                            primary: dbBrandIdentity.primary_color || '#2563eb',
                            secondary: dbBrandIdentity.secondary_color || '#64748b',
                            accent: dbBrandIdentity.accent_color || '#f59e0b',
                            text: '#1f2937'
                        },
                        fonts: {
                            headline: 'Inter',
                            body: 'Inter'
                        }
                    };
                }
            } catch (dbError) {
                console.log('Database lookup failed, using fallback:', dbError.message);
            }
        }

        // Fallback to demo data if database lookup failed
        if (!brandIdentity) {
            brandIdentity = {
                companyName: "TechCorp Solutions",
                address: "123 Business Ave, Suite 456, New York, NY 10001",
                phone: "+1 (555) 123-4567",
                email: "contact@techcorp.com",
                website: "www.techcorp.com",
                logoPath: path.join(__dirname, '..', 'example_logo.png'),
                colors: {
                    primary: '#2563eb',
                    secondary: '#64748b',
                    accent: '#f59e0b',
                    text: '#1f2937'
                },
                fonts: {
                    headline: 'Inter',
                    body: 'Inter'
                }
            };
        }

        console.log('Generating letterhead with:', {
            templateId,
            format,
            customizations,
            brandName: brandIdentity.companyName
        });

        const buffer = await generateLetterhead(brandIdentity, templateId, customizations, format);

        // Set appropriate headers based on format
        switch (format) {
            case 'pdf':
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${brandIdentity.companyName}_Letterhead_${templateId}.pdf"`);
                break;
            case 'html':
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `attachment; filename="${brandIdentity.companyName}_Letterhead_${templateId}.html"`);
                break;
            default: // docx
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${brandIdentity.companyName}_Letterhead_${templateId}.docx"`);
        }

        res.send(buffer);

    } catch (error) {
        console.error('Error generating letterhead:', error);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('Logo file not found')) {
            res.status(400).json({ error: 'Logo file not found. Please upload a logo first.' });
        } else if (error.message.includes('Invalid template')) {
            res.status(400).json({ error: 'Invalid template ID provided.' });
        } else {
            res.status(500).json({ error: 'Error generating letterhead. Please try again.' });
        }
    }
});

// Document history endpoint
app.get('/api/documents/history', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    
    try {
        // For now, return mock data. In a real implementation, this would fetch from database
        const mockHistory = [
            {
                id: 1,
                name: 'Sales_Proposal_Acme_Corp.docx',
                type: 'proposal',
                client: 'Acme Corp',
                date: '2 days ago',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                name: 'Invoice_TechStart_Inc.docx',
                type: 'invoice',
                client: 'TechStart Inc',
                date: '1 week ago',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                name: 'Service_Agreement_BigCorp.docx',
                type: 'contract',
                client: 'BigCorp',
                date: '2 weeks ago',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        res.json(mockHistory);
    } catch (error) {
        console.error('Error fetching document history:', error);
        res.status(500).json({ message: 'Server error while fetching document history' });
    }
});

app.post('/api/documents/generate', authMiddleware, async (req, res) => {
    const { templateType, formData } = req.body;

    if (!templateType || !formData) {
        return res.status(400).send('Missing templateType or formData in request body.');
    }
    
    // Try to fetch brand identity from database first
    let brandIdentity;
    try {
        const dbBrandIdentity = await db.get(
            'SELECT * FROM brand_identities WHERE account_id = ?',
            req.user.accountId
        );
        
        if (dbBrandIdentity) {
            brandIdentity = {
                companyName: dbBrandIdentity.brand_name,
                colors: {
                    primary: dbBrandIdentity.primary_color,
                    secondary: dbBrandIdentity.secondary_color
                },
                contact: {
                    address: "123 Creative Lane, Innovation City, 12345",
                    phone: "555-123-4567",
                    website: "www.ficonica.com"
                },
                logoPath: path.join(__dirname, '..', 'example_logo.png')
            };
        }
    } catch (dbError) {
        console.log('Database lookup failed, using fallback:', dbError.message);
    }
    
    // Fallback to hardcoded brand identity if database lookup failed
    if (!brandIdentity) {
        brandIdentity = {
            companyName: "Ficonica Inc.",
            colors: {
                primary: "#4F46E5",
                secondary: "#10B981"
            },
            contact: {
                address: "123 Creative Lane, Innovation City, 12345",
                phone: "555-123-4567",
                website: "www.ficonica.com"
            },
            logoPath: path.join(__dirname, '..', 'example_logo.png')
        };
    }

    try {
        const buffer = await generateDocument(brandIdentity, templateType, formData);

        // Generate appropriate filename based on template type
        const typeMap = {
            'proposal': 'Proposal',
            'contract': 'Contract',
            'invoice': 'Invoice',
            'quote': 'Quote',
            'report': 'Report',
            'letter': 'Letter'
        };
        
        const typeName = typeMap[templateType] || 'Document';
        const filename = `${typeName}_${formData.clientName.replace(/ /g, '_')}.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        res.send(buffer);
    } catch (error) {
        console.error(`Error generating ${templateType} document:`, error);
        res.status(500).send(`Error generating ${templateType} document.`);
    }
});

app.get('/api/social-kit/generate', brandBookAuthMiddleware, async (req, res) => {
    try {
        let brandIdentity;
        let logoPath;

        // Try to fetch brand identity from database first
        if (req.user && req.user.accountId) {
            try {
                const dbBrandIdentity = await db.get(
                    'SELECT * FROM brand_identities WHERE account_id = ?',
                    req.user.accountId
                );
                
                if (dbBrandIdentity) {
                    brandIdentity = {
                        name: dbBrandIdentity.brand_name,
                        colors: {
                            primary: dbBrandIdentity.primary_color,
                            secondary: dbBrandIdentity.secondary_color
                        }
                    };
                    
                    // Use logo from brand identity if available, otherwise fallback to example
                    logoPath = dbBrandIdentity.logo_url && dbBrandIdentity.logo_url.includes('localhost') 
                        ? dbBrandIdentity.logo_url.replace(`http://localhost:${port}`, path.join(__dirname, '..'))
                        : path.join(__dirname, '..', 'example_logo.png');
                }
            } catch (dbError) {
                console.log('Database lookup failed, using fallback:', dbError.message);
            }
        }

        // Fallback to hardcoded values if database lookup failed
        if (!brandIdentity) {
            brandIdentity = {
                name: "Ficonica Inc.",
                colors: {
                    primary: "#4F46E5",
                    secondary: "#10B981"
                }
            };
            logoPath = path.join(__dirname, '..', 'example_logo.png');
        }

        // Verify logo file exists (for absolute paths)
        const fsSync = require('fs');
        if (logoPath.startsWith('/') && !fsSync.existsSync(logoPath)) {
            throw new Error('Logo file not found');
        }

        console.log('Generating social media kit with:', {
            brandName: brandIdentity.name,
            primaryColor: brandIdentity.colors.primary,
            secondaryColor: brandIdentity.colors.secondary,
            logoPath: logoPath
        });

        const imageFiles = await generateSocialMediaKit(
            logoPath,
            brandIdentity.colors.primary,
            brandIdentity.colors.secondary,
            brandIdentity.name
        );

        console.log(`Generated ${imageFiles.length} social media assets`);

        const zipStream = createZipStream(imageFiles);

        const brandNameSafe = brandIdentity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${brandNameSafe}_social_media_kit.zip"`);

        zipStream.pipe(res);

    } catch (error) {
        console.error('Error generating Social Media Kit:', error);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('Logo file not found')) {
            res.status(400).json({ error: 'Logo file not found. Please upload a logo first.' });
        } else if (error.message.includes('Invalid color')) {
            res.status(400).json({ error: 'Invalid color format. Please check your brand colors.' });
        } else {
            res.status(500).json({ error: 'Error generating Social Media Kit. Please try again.' });
        }
    }
});

// --- Press Kit API Endpoints ---

// Public endpoint to get press kit data by slug
app.get('/api/public/press-kit/:slug', async (req, res) => {
    const { slug } = req.params;
    
    try {
        // Get brand identity by slug
        const brandIdentity = await db.get(
            'SELECT * FROM brand_identities WHERE press_kit_slug = ?',
            slug
        );
        
        if (!brandIdentity) {
            return res.status(404).json({ message: 'Press kit not found' });
        }
        
        // Get associated assets
        const assets = await db.all(
            'SELECT asset_type, s3_url, label, display_order FROM brand_assets WHERE brand_identity_id = ? ORDER BY display_order, id',
            brandIdentity.id
        );
        
        // Format response
        const pressKitData = {
            brandName: brandIdentity.brand_name,
            boilerplate: brandIdentity.boilerplate,
            colors: {
                primary: brandIdentity.primary_color,
                secondary: brandIdentity.secondary_color,
                accent: brandIdentity.accent_color
            },
            assets: assets.map(asset => ({
                label: asset.label,
                type: asset.asset_type,
                url: asset.s3_url
            })),
            pressContact: brandIdentity.press_contact_email,
            logoUrl: brandIdentity.logo_url
        };
        
        res.json(pressKitData);
        
    } catch (error) {
        console.error('Error fetching press kit:', error);
        res.status(500).json({ message: 'Server error while fetching press kit' });
    }
});

// Get current user's press kit settings
app.get('/api/press-kit/settings', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    
    try {
        const brandIdentity = await db.get(
            'SELECT * FROM brand_identities WHERE account_id = ?',
            accountId
        );
        
        if (!brandIdentity) {
            // Create default brand identity if it doesn't exist
            const account = await db.get('SELECT name FROM accounts WHERE id = ?', accountId);
            const slug = account.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            
            const result = await db.run(
                'INSERT INTO brand_identities (account_id, brand_name, press_kit_slug, boilerplate, primary_color, secondary_color) VALUES (?, ?, ?, ?, ?, ?)',
                accountId, 
                account.name,
                slug,
                `${account.name} is a dynamic company dedicated to innovation and excellence.`,
                '#4F46E5',
                '#06B6D4'
            );
            
            const newBrandIdentity = await db.get('SELECT * FROM brand_identities WHERE id = ?', result.lastID);
            return res.json({
                ...newBrandIdentity,
                pressKitUrl: `http://localhost:3000/press/${newBrandIdentity.press_kit_slug}`
            });
        }
        
        res.json({
            ...brandIdentity,
            pressKitUrl: `http://localhost:3000/press/${brandIdentity.press_kit_slug}`
        });
        
    } catch (error) {
        console.error('Error fetching press kit settings:', error);
        res.status(500).json({ message: 'Server error while fetching press kit settings' });
    }
});

// Update press kit settings
app.put('/api/press-kit/settings', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    const { brand_name, boilerplate, primary_color, secondary_color, accent_color, press_contact_email, logo_url } = req.body;
    
    try {
        const result = await db.run(
            `UPDATE brand_identities 
             SET brand_name = ?, boilerplate = ?, primary_color = ?, secondary_color = ?, accent_color = ?, 
                 press_contact_email = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE account_id = ?`,
            brand_name, boilerplate, primary_color, secondary_color, accent_color, press_contact_email, logo_url, accountId
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Press kit not found' });
        }
        
        res.json({ message: 'Press kit settings updated successfully' });
        
    } catch (error) {
        console.error('Error updating press kit settings:', error);
        res.status(500).json({ message: 'Server error while updating press kit settings' });
    }
});

// Upload brand asset
app.post('/api/press-kit/upload-asset', authMiddleware, uploadSignature.single('asset'), async (req, res) => {
    const { accountId } = req.user;
    const { asset_type, label } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No asset file uploaded' });
    }
    
    try {
        // Get brand identity
        const brandIdentity = await db.get('SELECT id FROM brand_identities WHERE account_id = ?', accountId);
        if (!brandIdentity) {
            return res.status(404).json({ message: 'Brand identity not found' });
        }
        
        // Construct the public URL of the uploaded file
        const assetUrl = `${req.protocol}://${req.get('host')}/public/signatures/${req.file.filename}`;
        
        // Save asset to database
        await db.run(
            'INSERT INTO brand_assets (brand_identity_id, asset_type, s3_url, label) VALUES (?, ?, ?, ?)',
            brandIdentity.id, asset_type, assetUrl, label
        );
        
        res.json({ message: 'Asset uploaded successfully', assetUrl });
        
    } catch (error) {
        console.error('Error uploading asset:', error);
        res.status(500).json({ message: 'Server error while uploading asset' });
    }
});

// Get brand assets
app.get('/api/press-kit/assets', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    
    try {
        const brandIdentity = await db.get('SELECT id FROM brand_identities WHERE account_id = ?', accountId);
        if (!brandIdentity) {
            return res.json([]);
        }
        
        const assets = await db.all(
            'SELECT * FROM brand_assets WHERE brand_identity_id = ? ORDER BY display_order, created_at',
            brandIdentity.id
        );
        
        res.json(assets);
        
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ message: 'Server error while fetching assets' });
    }
});

// Delete brand asset
app.delete('/api/press-kit/assets/:assetId', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    const { assetId } = req.params;
    
    try {
        const brandIdentity = await db.get('SELECT id FROM brand_identities WHERE account_id = ?', accountId);
        if (!brandIdentity) {
            return res.status(404).json({ message: 'Brand identity not found' });
        }
        
        const result = await db.run(
            'DELETE FROM brand_assets WHERE id = ? AND brand_identity_id = ?',
            assetId, brandIdentity.id
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        
        res.json({ message: 'Asset deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({ message: 'Server error while deleting asset' });
    }
});

// --- Website Audit Report Generator Endpoint ---
app.post('/api/website-audit/generate', authMiddleware, async (req, res) => {
    const { url } = req.body;
    const { accountId } = req.user; // Get accountId from the authenticated user

    if (!url) {
        return res.status(400).json({ message: 'Website URL is required.' });
    }

    try {
        // The technical prompt mentions brand_identity_id, but the system uses accountId.
        // We will pass the accountId and the db instance to the generator function.
        const pdfBuffer = await generateWebsiteReport(url, accountId, db);
        
        // For now, the generator returns null. We will build the full implementation next.
        // This structure allows us to confirm the endpoint is working.
        if (!pdfBuffer) {
             return res.status(200).json({ message: `Request received for ${url}. PDF generation in progress.`});
        }
        
        const domainName = new URL(url).hostname;
        const safeDomainName = domainName.replace(/[^a-z0-9]/gi, '_');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Website_Audit_Report_${safeDomainName}.pdf"`);
        
        res.send(pdfBuffer);

    } catch (error) {
        console.error(`Error generating website report for ${url}:`, error);
        res.status(500).json({ message: 'Server error while generating your website report.' });
    }
});

// --- Email Template Generator Endpoint ---
app.post('/api/email-templates/generate', authMiddleware, async (req, res) => {
    const { purpose, tone } = req.body;
    const { accountId } = req.user;

    if (!purpose || !tone) {
        return res.status(400).json({ message: 'Purpose and tone are required.' });
    }

    try {
        // Fetch brand identity from database
        const brandIdentity = await db.get(
            'SELECT brand_name, primary_color FROM brand_identities WHERE account_id = ?',
            accountId
        );

        // If no brand identity, use defaults
        const brandName = brandIdentity?.brand_name || 'Your Company';
        const primaryColor = brandIdentity?.primary_color || '#4F46E5';

        // Purpose mapping
        const purposeMap = {
            'welcome_email': 'Welcome Email for New Customers',
            'new_feature_announcement': 'New Feature Announcement',
            'special_offer': 'Special Offer / Discount Campaign',
            'feedback_request': 'Customer Feedback Request'
        };

        // Tone mapping
        const toneMap = {
            'professional_formal': 'Professional and Formal',
            'friendly_casual': 'Friendly and Casual',
            'excited_energetic': 'Excited and Energetic'
        };

        const purposeDescription = purposeMap[purpose] || purpose;
        const toneDescription = toneMap[tone] || tone;

        // Master prompt template
        const prompt = `You are a world-class email designer specializing in creating beautiful, modern, high-converting email templates. Your expertise lies in crafting visually stunning emails that work flawlessly across all devices and email clients.

**CORE DESIGN REQUIREMENTS:**
1. ALL CSS MUST be inline - no <style> blocks or external stylesheets
2. Use modern table-based layouts with advanced responsive techniques
3. Implement cutting-edge mobile-first design that adapts perfectly from 320px to 800px+
4. Include comprehensive dark mode support with proper color schemes
5. Create accessible designs with ARIA labels, semantic structure, and proper alt text
6. Ensure perfect rendering in all major email clients (Outlook, Gmail, Apple Mail, etc.)

**MODERN DESIGN PRINCIPLES:**
- **Typography:** Use system fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial) with perfect hierarchy (12px-36px range), optimal line-height (1.4-1.6), and proper letter-spacing
- **Color Theory:** Create sophisticated palettes with proper contrast ratios (4.5:1+), subtle gradients, and strategic brand color application
- **Layout & Spacing:** Use generous white space (24px-48px between sections), card-based layouts with subtle shadows, consistent spacing scale (8px, 16px, 24px, 32px), and modern rounded corners (8px-12px)
- **Interactive Elements:** Design beautiful buttons with hover states, proper padding (12px 24px), modern styles (solid/outline/ghost), and engaging micro-interactions
- **Visual Enhancement:** Add subtle gradients, modern patterns, tasteful icons/emoji, optimized images with srcset, and engaging visual hierarchies

**BRAND INFORMATION:**
- Brand Name: ${brandName}
- Primary Color: ${primaryColor}

**EMAIL SPECIFICATIONS:**
- Purpose: ${purposeDescription}
- Tone of Voice: ${toneDescription}

**DESIGN EXCELLENCE:**
- Create a modern, visually stunning email that stands out in the inbox
- Use contemporary design patterns with clean geometries and smooth transitions
- Implement sophisticated color combinations and modern typography
- Include engaging visual elements while maintaining professional appeal
- Apply mobile-first responsive design with fluid grids
- Use modern button designs with proper accessibility and hover effects
- Include modern shadows (box-shadow: 0 2px 10px rgba(0,0,0,0.1)) and subtle animations

**TECHNICAL EXCELLENCE:**
- Fluid table layouts that adapt seamlessly across all screen sizes
- VML fallbacks for Outlook background images and gradients
- MSO conditional comments for Outlook-specific optimizations
- Semantic HTML structure for optimal deliverability
- Touch-friendly interactive elements (44px minimum height)
- Performance-optimized code without bloat

**CONTENT EXCELLENCE:**
- Write compelling, action-oriented copy that matches the specified tone
- Create scannable content with clear hierarchy and bullet points
- Include powerful CTAs that drive engagement and conversions
- Use emotional triggers appropriate for the brand and audience
- Implement storytelling elements that build brand connection

**FOOTER REQUIREMENTS:**
Include an elegant, modern footer with:
- Stylish unsubscribe link with proper legal compliance
- Company contact information and social media links
- Modern footer design that complements the overall aesthetic
- Privacy policy and terms of service links

**OUTPUT FORMAT:**
Generate a JSON response with these exact keys:
{
  "subject_line": "Compelling, modern subject line that drives opens",
  "preview_text": "Engaging preview text (40-90 chars) that complements the subject",
  "html_body": "Complete, production-ready HTML email from DOCTYPE to /html with stunning modern design"
}

Create an email masterpiece that recipients will be excited to engage with - visually beautiful, technically perfect, and highly converting. This should represent the pinnacle of modern email design and marketing excellence.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Try to parse JSON response
        let result;
        try {
            result = JSON.parse(aiResponse);
            // Ensure preview_text exists
            if (!result.preview_text) {
                result.preview_text = `${brandName} has something special for you`;
            }
        } catch (parseError) {
            // If JSON parsing fails, create a structured response
            const lines = aiResponse.split('\n');
            const subjectMatch = lines.find(line => line.toLowerCase().includes('subject'));
            const previewMatch = lines.find(line => line.toLowerCase().includes('preview'));
            
            const subject = subjectMatch ? subjectMatch.replace(/.*subject[:\-\s]*/i, '').trim() : `${purposeDescription} - ${brandName}`;
            const preview = previewMatch ? previewMatch.replace(/.*preview[:\-\s]*/i, '').trim() : `${brandName} has something special for you`;
            
            result = {
                subject_line: subject,
                preview_text: preview,
                html_body: aiResponse.includes('<!DOCTYPE') ? aiResponse : `<!DOCTYPE html><html><body>${aiResponse}</body></html>`
            };
        }

        res.json(result);

    } catch (error) {
        console.error('Error generating email template:', error);
        if (error.code === 'insufficient_quota') {
            res.status(402).json({ message: 'OpenAI API quota exceeded. Please check your billing.' });
        } else {
            res.status(500).json({ message: 'Server error while generating email template.' });
        }
    }
});

// --- Advanced Email Template Generator Endpoint ---
app.post('/api/email-templates/generate-advanced', authMiddleware, async (req, res) => {
    const { 
        purpose, 
        tone, 
        industry, 
        targetAudience, 
        emailLength, 
        templateStyle, 
        includeImages, 
        ctaStyle, 
        urgency, 
        personalization, 
        abTestVariants 
    } = req.body;
    const { accountId } = req.user;

    if (!purpose || !tone || !industry || !targetAudience) {
        return res.status(400).json({ message: 'Purpose, tone, industry, and target audience are required.' });
    }

    try {
        // Fetch brand identity from database
        const brandIdentity = await db.get(
            'SELECT brand_name, primary_color, secondary_color, accent_color FROM brand_identities WHERE account_id = ?',
            accountId
        );

        // If no brand identity, use defaults
        const brandName = brandIdentity?.brand_name || 'Your Company';
        const primaryColor = brandIdentity?.primary_color || '#4F46E5';
        const secondaryColor = brandIdentity?.secondary_color || '#10B981';
        const accentColor = brandIdentity?.accent_color || '#F59E0B';

        // Enhanced mappings
        const purposeMap = {
            'welcome_series': 'Welcome Email Series for New Customers',
            'welcome_email': 'Single Welcome Email for New Customers',
            'email_verification': 'Email Verification and Confirmation',
            'product_launch': 'Product Launch Announcement',
            'new_feature_announcement': 'New Feature Announcement',
            'company_update': 'Company News and Updates',
            'newsletter': 'Newsletter Content',
            'special_offer': 'Special Offer / Discount Campaign',
            'flash_sale': 'Flash Sale / Limited Time Offer',
            'abandoned_cart': 'Abandoned Cart Recovery',
            'upsell_crosssell': 'Upsell/Cross-sell Campaign',
            'feedback_request': 'Customer Feedback Request',
            'survey_invitation': 'Survey Invitation',
            'user_generated_content': 'User Generated Content Request',
            're_engagement': 'Re-engagement Campaign',
            'birthday_anniversary': 'Birthday/Anniversary Email',
            'milestone_celebration': 'Milestone Celebration',
            'thank_you': 'Thank You Email',
            'event_invitation': 'Event Invitation',
            'webinar_invitation': 'Webinar Invitation',
            'event_reminder': 'Event Reminder',
            'seasonal_holiday': 'Seasonal/Holiday Campaign',
            'back_to_school': 'Back to School Campaign',
            'black_friday': 'Black Friday/Cyber Monday Campaign'
        };

        const toneMap = {
            'professional_formal': 'Professional and Formal',
            'friendly_casual': 'Friendly and Casual',
            'excited_energetic': 'Excited and Energetic',
            'luxury_sophisticated': 'Luxury and Sophisticated',
            'playful_fun': 'Playful and Fun',
            'urgent_compelling': 'Urgent and Compelling',
            'educational_helpful': 'Educational and Helpful',
            'minimalist_clean': 'Minimalist and Clean'
        };

        const industryMap = {
            'technology': 'Technology/SaaS',
            'ecommerce': 'E-commerce/Retail',
            'healthcare': 'Healthcare/Medical',
            'finance': 'Finance/FinTech',
            'education': 'Education/EdTech',
            'real_estate': 'Real Estate',
            'food_beverage': 'Food & Beverage',
            'fashion_beauty': 'Fashion & Beauty',
            'travel_tourism': 'Travel & Tourism',
            'fitness_wellness': 'Fitness & Wellness',
            'automotive': 'Automotive',
            'non_profit': 'Non-Profit',
            'consulting': 'Consulting/Services',
            'other': 'General Business'
        };

        const audienceMap = {
            'b2b_executives': 'B2B Executives and Leadership',
            'b2b_decision_makers': 'B2B Decision Makers',
            'small_business_owners': 'Small Business Owners',
            'millennials': 'Millennials (25-40 years old)',
            'gen_z': 'Gen Z (18-25 years old)',
            'professionals': 'Young Professionals',
            'parents': 'Parents and Families',
            'students': 'Students',
            'seniors': 'Senior Citizens',
            'tech_enthusiasts': 'Technology Enthusiasts',
            'creative_professionals': 'Creative Professionals',
            'general_consumers': 'General Consumers'
        };

        const templateStyleMap = {
            'modern': 'Modern and Contemporary',
            'minimal': 'Minimalist and Clean',
            'corporate': 'Corporate and Professional',
            'creative': 'Creative and Artistic',
            'newsletter': 'Newsletter-style Content Layout',
            'promotional': 'Promotional and Sales-focused'
        };

        const purposeDescription = purposeMap[purpose] || purpose;
        const toneDescription = toneMap[tone] || tone;
        const industryDescription = industryMap[industry] || industry;
        const audienceDescription = audienceMap[targetAudience] || targetAudience;
        const styleDescription = templateStyleMap[templateStyle] || templateStyle;

        // Build personalization instructions
        let personalizationInstructions = '';
        if (personalization && personalization.length > 0) {
            const personalFields = personalization.map(field => {
                const fieldMap = {
                    'first_name': '{{first_name}} for first name',
                    'company_name': '{{company_name}} for company name',
                    'location': '{{location}} for location/city',
                    'purchase_history': '{{purchase_history}} for purchase history',
                    'browsing_behavior': '{{browsing_behavior}} for browsing behavior',
                    'signup_date': '{{signup_date}} for signup date',
                    'last_activity': '{{last_activity}} for last activity'
                };
                return fieldMap[field] || `{{${field}}}`;
            }).join(', ');
            
            personalizationInstructions = `\n\n**PERSONALIZATION:**
Include these personalization placeholders: ${personalFields}
Use them naturally in the email content where appropriate.`;
        }

        // Build length instructions
        const lengthInstructions = {
            'short': 'Keep the email concise and to the point (150-250 words)',
            'medium': 'Create a balanced email with moderate detail (250-400 words)',
            'long': 'Develop a comprehensive email with detailed information (400-600 words)'
        };

        // Build urgency instructions
        const urgencyInstructions = {
            'none': '',
            'low': '\n- Include subtle urgency cues',
            'medium': '\n- Include moderate urgency and time-sensitive language',
            'high': '\n- Include strong urgency, scarcity, and FOMO elements'
        };

        // Function to generate a single email variant
        const generateEmailVariant = async (variantIndex) => {
            const variantInstructions = variantIndex > 0 ? `\n\n**VARIANT ${variantIndex + 1}:**
Create a different approach from previous variants. Use different:
- Subject line style and angle
- Opening hook and approach
- Content structure and flow
- Call-to-action phrasing
- Overall messaging strategy` : '';

            const prompt = `You are a world-class email designer and developer who creates stunning, modern, high-converting email templates. Your specialty is crafting visually beautiful emails that work perfectly across all devices and email clients.

**CORE REQUIREMENTS:**
1. ALL CSS MUST be inline - no <style> blocks or external stylesheets
2. Use advanced table-based layout with modern techniques for maximum compatibility
3. Implement cutting-edge responsive design with fluid grids and adaptive layouts
4. Include comprehensive dark mode support with @media (prefers-color-scheme: dark)
5. Create accessible designs with proper ARIA labels, alt text, and semantic structure
6. Ensure flawless rendering in Outlook, Gmail, Apple Mail, and all major clients

**MODERN DESIGN PRINCIPLES:**
1. **Typography Excellence:**
   - Use system fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
   - Implement perfect font hierarchy with varied sizes (12px-48px)
   - Use line-height: 1.4-1.6 for optimal readability
   - Apply proper letter-spacing for headers (-0.02em to 0.02em)

2. **Advanced Color Theory:**
   - Create sophisticated color palettes with proper contrast ratios (4.5:1 minimum)
   - Use subtle gradients and color transitions
   - Implement dark mode with inverted color schemes
   - Apply brand colors strategically for maximum impact

3. **Modern Layout & Spacing:**
   - Use generous white space (24px-48px between sections)
   - Implement card-based layouts with subtle shadows
   - Create visual hierarchy with consistent spacing scale (8px, 16px, 24px, 32px, 48px)
   - Use border-radius: 8px-16px for modern rounded corners

4. **Interactive Elements:**
   - Design beautiful buttons with hover states and proper padding (16px 32px)
   - Use modern button styles: solid, outline, ghost variations
   - Implement subtle animations with CSS transitions
   - Create engaging micro-interactions where supported

5. **Visual Enhancement:**
   - Add subtle gradients and modern background patterns
   - Use tasteful icons and emoji for visual interest
   - Implement proper image optimization with srcset for retina displays
   - Create engaging visual hierarchies with contrast and scale

**BRAND INFORMATION:**
- Brand Name: ${brandName}
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Accent Color: ${accentColor}
- Industry: ${industryDescription}

**EMAIL SPECIFICATIONS:**
- Purpose: ${purposeDescription}
- Tone: ${toneDescription}
- Target Audience: ${audienceDescription}
- Template Style: ${styleDescription}
- Length: ${lengthInstructions[emailLength]}
- Include Images: ${includeImages ? 'Yes - use modern placeholder images with descriptive alt text and proper responsive sizing' : 'No - create visually stunning text-only design with typography and color'}
- CTA Style: ${ctaStyle === 'button' ? 'Modern button-style CTAs with hover effects and proper accessibility' : ctaStyle === 'link' ? 'Stylish text link CTAs with underline animations' : 'Mix of both modern buttons and elegant text links'}${urgencyInstructions[urgency]}${personalizationInstructions}${variantInstructions}

**ADVANCED TEMPLATE GUIDELINES:**
${templateStyle === 'modern' ? `
- Implement sleek, contemporary design with clean geometries
- Use subtle gradients and modern shadows (box-shadow: 0 4px 20px rgba(0,0,0,0.1))
- Apply modern card layouts with proper spacing
- Include contemporary iconography and visual elements
- Use cutting-edge color combinations and smooth transitions` :
templateStyle === 'minimal' ? `
- Create zen-like simplicity with abundant white space (40px+ margins)
- Focus on perfect typography hierarchy and readability
- Use monochromatic or limited color palette
- Implement clean lines and geometric precision
- Emphasize content through strategic use of negative space` :
templateStyle === 'corporate' ? `
- Design professional, trustworthy layout with formal structure
- Use authoritative typography and conservative color schemes
- Implement traditional business email patterns with modern touches
- Include professional header/footer and company branding
- Apply sophisticated color palette with navy, gray, and accent colors` :
templateStyle === 'creative' ? `
- Design unique, artistic layouts that break conventional email patterns
- Use bold typography combinations and creative spacing
- Implement artistic color schemes and creative visual elements
- Include unique geometric shapes and creative backgrounds
- Apply innovative layout techniques while maintaining functionality` :
templateStyle === 'newsletter' ? `
- Create magazine-style multi-column layouts with clear content hierarchy
- Use editorial typography with varied font sizes and weights
- Implement content blocks with proper visual separation
- Include newsletter-style headers with publication feel
- Apply content-focused design with scannable information architecture` :
`- Design sales-optimized layouts with prominent offers and deals
- Use high-contrast colors and attention-grabbing elements
- Implement urgency-inducing visual cues and countdown aesthetics
- Include prominent discount badges and promotional elements
- Apply conversion-focused design with clear value propositions`}

**TECHNICAL EXCELLENCE:**
1. **Mobile-First Responsive Design:**
   - Fluid tables that adapt from 320px to 800px+ widths
   - Stack columns vertically on mobile with proper spacing
   - Scale text appropriately for different screen sizes
   - Ensure touch-friendly button sizes (44px minimum height)

2. **Cross-Client Compatibility:**
   - Use VML for Outlook background images and gradients
   - Implement MSO conditional comments for Outlook-specific fixes
   - Test-worthy code for Gmail, Apple Mail, Outlook (all versions)
   - Yahoo Mail and AOL compatibility considerations

3. **Performance Optimization:**
   - Minimize code bloat while maintaining visual excellence
   - Use semantic HTML structure for better deliverability
   - Implement proper image alt text for accessibility and spam filters
   - Optimize for fast loading across all connections

**CONTENT EXCELLENCE:**
- Write compelling, action-oriented copy that matches the specified tone
- Create scannable content with bullet points and clear hierarchy
- Include powerful CTAs that drive engagement and conversions
- Use emotional triggers appropriate for the target audience
- Implement storytelling elements that build brand connection

**FOOTER REQUIREMENTS:**
Include a modern, comprehensive footer with:
- Elegant unsubscribe link with proper legal compliance
- Company contact information and social media links
- Privacy policy and terms of service links
- Modern footer design that complements the overall aesthetic

**OUTPUT FORMAT:**
Generate a JSON response with these exact keys:
{
  "subject_line": "Compelling, modern subject line that drives opens",
  "preview_text": "Engaging preview text (40-90 chars) that complements subject",
  "html_body": "Complete, production-ready HTML email from DOCTYPE to /html with beautiful, modern design"
}

The final email should be a masterpiece of modern email design - visually stunning, technically perfect, and highly converting. Make it something that recipients will be excited to engage with and that reflects the highest standards of contemporary email marketing.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 3000,
                temperature: 0.7 + (variantIndex * 0.1), // Slightly different temperature for variants
            });

            const aiResponse = completion.choices[0].message.content;
            
            try {
                return JSON.parse(aiResponse);
            } catch (parseError) {
                // Fallback parsing if JSON fails
                const lines = aiResponse.split('\n');
                const subjectMatch = lines.find(line => line.toLowerCase().includes('subject'));
                const subject = subjectMatch ? subjectMatch.replace(/.*subject[:\-\s]*/i, '').trim() : `${purposeDescription} - ${brandName}`;
                
                return {
                    subject_line: subject,
                    preview_text: `${brandName} has something special for you`,
                    html_body: aiResponse.includes('<!DOCTYPE') ? aiResponse : `<!DOCTYPE html><html><body>${aiResponse}</body></html>`
                };
            }
        };

        // Generate multiple variants based on abTestVariants setting
        const numVariants = Math.min(abTestVariants || 1, 3); // Cap at 3 variants
        const results = [];

        for (let i = 0; i < numVariants; i++) {
            const variant = await generateEmailVariant(i);
            results.push(variant);
            
            // Add small delay between API calls to avoid rate limiting
            if (i < numVariants - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        res.json(results);

    } catch (error) {
        console.error('Error generating advanced email template:', error);
        if (error.code === 'insufficient_quota') {
            res.status(402).json({ message: 'OpenAI API quota exceeded. Please check your billing.' });
        } else {
            res.status(500).json({ message: 'Server error while generating email template.' });
        }
    }
});

// --- Email Template Save/Load Endpoints ---
app.post('/api/email-templates/save', authMiddleware, async (req, res) => {
    const { subject_line, html_body, preview_text, formData } = req.body;
    const { accountId } = req.user;

    try {
        // Create email_templates table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS email_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                name TEXT,
                subject_line TEXT NOT NULL,
                html_body TEXT NOT NULL,
                preview_text TEXT,
                form_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts (id)
            )
        `);

        const templateName = `${formData.purpose} - ${formData.tone} - ${new Date().toISOString().split('T')[0]}`;
        
        await db.run(
            'INSERT INTO email_templates (account_id, name, subject_line, html_body, preview_text, form_data) VALUES (?, ?, ?, ?, ?, ?)',
            accountId, templateName, subject_line, html_body, preview_text, JSON.stringify(formData)
        );

        res.json({ message: 'Template saved successfully' });
    } catch (error) {
        console.error('Error saving email template:', error);
        res.status(500).json({ message: 'Server error while saving template.' });
    }
});

app.get('/api/email-templates/saved', authMiddleware, async (req, res) => {
    const { accountId } = req.user;

    try {
        const templates = await db.all(
            'SELECT * FROM email_templates WHERE account_id = ? ORDER BY created_at DESC',
            accountId
        );

        const formattedTemplates = templates.map(template => ({
            ...template,
            form_data: template.form_data ? JSON.parse(template.form_data) : null
        }));

        res.json(formattedTemplates);
    } catch (error) {
        console.error('Error fetching saved templates:', error);
        res.status(500).json({ message: 'Server error while fetching templates.' });
    }
});

// --- Ad Kit Generation Endpoint ---
app.post('/api/ad-kit/generate', authMiddleware, async (req, res) => {
    try {
        const { dynamicText, brand_identity_id } = req.body;
        
        // Validate input
        if (!dynamicText || !dynamicText.headline) {
            return res.status(400).json({ 
                message: 'Missing required fields. At least headline is required.' 
            });
        }

        // For MVP, we'll use mock data for brand identity
        // In production, this would be fetched from the database using brand_identity_id
        const brandIdentity = {
            name: 'Brand OS',
            logoUrl: `${req.protocol}://${req.get('host')}/example_logo.png`,
            primaryColor: '#4F46E5',
            secondaryColor: '#EC4899',
            fontFamily: 'Inter'
        };

        // If brand_identity_id is provided and not using mock data
        if (brand_identity_id && !isDevelopment) {
            // TODO: Fetch brand identity from database
            // const brandData = await db.get('SELECT * FROM brand_identities WHERE id = ?', [brand_identity_id]);
            // if (brandData) {
            //     brandIdentity = {
            //         name: brandData.name,
            //         logoUrl: brandData.logo_url,
            //         primaryColor: brandData.primary_color,
            //         secondaryColor: brandData.secondary_color,
            //         fontFamily: brandData.font_family
            //     };
            // }
        }

        // Initialize the ad kit generator
        const adKitGenerator = new AdKitGenerator();
        
        // Check if we have API credentials
        const hasApiCredentials = process.env.BANNERBEAR_API_KEY && 
                                 process.env.BANNERBEAR_TEMPLATE_SQUARE;
        
        let zipBuffer;
        
        if (hasApiCredentials) {
            // Generate using actual API
            zipBuffer = await adKitGenerator.generateAdKit(dynamicText, brandIdentity);
        } else {
            // Use mock generator for testing
            console.log('Using mock ad generator (no API credentials configured)');
            zipBuffer = await adKitGenerator.generateMockAdKit(dynamicText, brandIdentity);
        }

        // Set headers for ZIP download
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${brandIdentity.name.replace(/[^a-z0-9]/gi, '_')}_Ad_Kit.zip"`,
            'Content-Length': zipBuffer.length
        });

        res.send(zipBuffer);

    } catch (error) {
        console.error('Error generating ad kit:', error);
        res.status(500).json({ 
            message: 'Failed to generate ad kit', 
            error: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

async function main() {
    db = await setupDatabase();
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

main().catch(console.error); 