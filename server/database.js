const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDatabase() {
    const db = await open({
        filename: './brandos.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        -- Use PRAGMA foreign_keys=ON to enforce foreign key constraints.
        PRAGMA foreign_keys=ON;

        -- accounts table: Represents a company or workspace.
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- users table: Stores user credentials and basic info.
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- account_members table: Links users to accounts with specific roles.
        -- This is the core of the RBAC system.
        CREATE TABLE IF NOT EXISTS account_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            -- 'owner' has full access, 'guest' has read-only access.
            role TEXT NOT NULL CHECK(role IN ('owner', 'guest')), 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(account_id, user_id) -- A user can only have one role per account
        );

        -- invitations table: Manages pending invites for users to join an account.
        CREATE TABLE IF NOT EXISTS invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            inviter_id INTEGER NOT NULL,
            invitee_email TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            -- 'pending' invitations are active, 'accepted' are completed.
            status TEXT NOT NULL CHECK(status IN ('pending', 'accepted')) DEFAULT 'pending',
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(account_id, invitee_email) -- Prevent duplicate pending invitations
        );

        -- brand_identities table: Stores brand information for press kits.
        CREATE TABLE IF NOT EXISTS brand_identities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            brand_name TEXT NOT NULL,
            boilerplate TEXT,
            primary_color TEXT,
            secondary_color TEXT,
            accent_color TEXT,
            headline_font TEXT DEFAULT 'Inter',
            body_font TEXT DEFAULT 'Inter',
            approved_colors TEXT, -- JSON array of approved brand colors
            approved_fonts TEXT, -- JSON array of approved brand fonts
            press_kit_slug TEXT UNIQUE,
            press_contact_email TEXT,
            logo_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
        );

        -- brand_assets table: Manages media files for press kits.
        CREATE TABLE IF NOT EXISTS brand_assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_identity_id INTEGER NOT NULL,
            asset_type TEXT NOT NULL CHECK(asset_type IN ('logo_primary', 'logo_white', 'logo_black', 'founder_photo', 'product_shot', 'company_photo')),
            s3_url TEXT NOT NULL,
            label TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE
        );

        -- brand_mentions table: Stores social media mentions and their sentiment analysis
        CREATE TABLE IF NOT EXISTS brand_mentions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_identity_id INTEGER NOT NULL,
            source TEXT NOT NULL CHECK(source IN ('twitter')),
            source_id TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            source_url TEXT NOT NULL,
            sentiment TEXT NOT NULL CHECK(sentiment IN ('positive', 'negative', 'neutral')),
            sentiment_score REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE,
            UNIQUE(source, source_id) -- Prevent duplicate mentions from the same source
        );

        -- sentiment_tracking_config table: Stores configuration for sentiment tracking
        CREATE TABLE IF NOT EXISTS sentiment_tracking_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_identity_id INTEGER NOT NULL,
            tracking_enabled BOOLEAN DEFAULT 1,
            keywords TEXT NOT NULL, -- JSON array of keywords to track
            last_fetch_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE,
            UNIQUE(brand_identity_id)
        );

        -- thought_leadership_settings table: Stores user preferences for content generation
        CREATE TABLE IF NOT EXISTS thought_leadership_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            industry TEXT NOT NULL,
            target_audience TEXT NOT NULL,
            preferred_platform TEXT NOT NULL CHECK(preferred_platform IN ('LinkedIn Post', 'Blog Article')),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            UNIQUE(account_id)
        );

        -- content_ideas table: Stores AI-generated content ideas
        CREATE TABLE IF NOT EXISTS content_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            talking_points TEXT NOT NULL, -- JSON array stored as text
            generation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0,
            is_used BOOLEAN DEFAULT 0,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
        );
    `);

    // TODO: For testing, seed the database with an initial owner if it's empty.
    // This should be removed or moved to a separate seed script for production.
    const user = await db.get('SELECT * FROM users');
    if (!user) {
        // Note: In a real app, passwords must be securely hashed.
        // Using a placeholder hash for now.
        const demoPasswordHash = '$2b$10$NotARealHashJustForDemoPurposes....'; // Example using bcrypt hash format
        
        await db.run('INSERT INTO accounts (name) VALUES (?)', 'My Test Company');
        const account = await db.get('SELECT id FROM accounts WHERE name = ?', 'My Test Company');
        
        await db.run(
            'INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)',
            'owner@example.com',
        'Initial Owner',
            demoPasswordHash
        );
        const newUser = await db.get('SELECT id FROM users WHERE email = ?', 'owner@example.com');
        
        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            account.id,
            newUser.id,
            'owner'
        );

        // Create default brand identity
        await db.run(
            'INSERT INTO brand_identities (account_id, brand_name, boilerplate, primary_color, secondary_color, press_kit_slug, press_contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
            account.id,
            'My Test Company',
            'My Test Company is a leading innovator in the technology sector, dedicated to creating solutions that empower businesses and individuals to achieve their goals.',
            '#4F46E5',
            '#06B6D4',
            'my-test-company',
            'press@example.com'
        );
        
        console.log('Database seeded with an initial owner, account, and brand identity.');
    }


    return db;
}

module.exports = setupDatabase; 