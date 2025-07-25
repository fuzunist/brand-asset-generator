const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setupDatabase() {
    const db = await open({
        filename: './brandos.db',
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA journal_mode = WAL;');
    await db.exec('PRAGMA foreign_keys=ON;');

    // Schema versioning
    const { user_version: currentVersion } = await db.get('PRAGMA user_version;');

    // Migration scripts
    const migrations = [
        {
            version: 1,
            script: `
                -- Initial tables
                CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
        
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    full_name TEXT,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
        
                CREATE TABLE IF NOT EXISTS account_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('owner', 'guest')), 
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(account_id, user_id)
                );
        
                CREATE TABLE IF NOT EXISTS invitations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id INTEGER NOT NULL,
                    inviter_id INTEGER NOT NULL,
                    invitee_email TEXT NOT NULL,
                    token TEXT NOT NULL UNIQUE,
                    status TEXT NOT NULL CHECK(status IN ('pending', 'accepted')) DEFAULT 'pending',
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(account_id, invitee_email)
                );
            `
        },
        {
            version: 2,
            script: `
                -- Brand Identities & Assets
                CREATE TABLE IF NOT EXISTS brand_identities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id INTEGER NOT NULL,
                    brand_name TEXT NOT NULL,
                    boilerplate TEXT,
                    primary_color TEXT,
                    secondary_color TEXT,
                    accent_color TEXT,
                    press_kit_slug TEXT UNIQUE,
                    press_contact_email TEXT,
                    logo_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
                );

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
            `
        },
        {
            version: 3,
            script: `
                -- Sentiment Analysis tables
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
                    UNIQUE(source, source_id)
                );
        
                CREATE TABLE IF NOT EXISTS sentiment_tracking_config (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    brand_identity_id INTEGER NOT NULL,
                    tracking_enabled BOOLEAN DEFAULT 1,
                    keywords TEXT NOT NULL,
                    last_fetch_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (brand_identity_id) REFERENCES brand_identities(id) ON DELETE CASCADE,
                    UNIQUE(brand_identity_id)
                );
            `
        },
        {
            version: 4,
            script: `
                -- Thought Leadership tables
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
        
                CREATE TABLE IF NOT EXISTS content_ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    talking_points TEXT NOT NULL,
                    generation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_read BOOLEAN DEFAULT 0,
                    is_used BOOLEAN DEFAULT 0,
                    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
                );
            `
        },
        {
            version: 5,
            script: `
                -- Add fonts and approved assets to brand_identities
                ALTER TABLE brand_identities ADD COLUMN headline_font TEXT DEFAULT 'Inter';
                ALTER TABLE brand_identities ADD COLUMN body_font TEXT DEFAULT 'Inter';
                ALTER TABLE brand_identities ADD COLUMN approved_colors TEXT;
                ALTER TABLE brand_identities ADD COLUMN approved_fonts TEXT;
            `
        }
    ];

    console.log(`Current DB version: ${currentVersion}`);

    for (const migration of migrations) {
        if (migration.version > currentVersion) {
            console.log(`Applying migration version ${migration.version}...`);
            await db.exec(migration.script);
            await db.exec(`PRAGMA user_version = ${migration.version}`);
            console.log(`DB version updated to ${migration.version}`);
        }
    }
    
    // Seeding logic (optional, for development)
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
        console.log('Database is empty. Seeding initial data...');
        const demoPasswordHash = await require('bcryptjs').hash('demopassword', 10);
        
        const accountResult = await db.run('INSERT INTO accounts (name) VALUES (?)', 'Ficonica');
        const accountId = accountResult.lastID;
        
        const userResult = await db.run(
            'INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)',
            'dev@ficonica.com', 'Dev User', demoPasswordHash
        );
        const userId = userResult.lastID;
        
        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            accountId, userId, 'owner'
        );

        await db.run(
            `INSERT INTO brand_identities 
            (account_id, brand_name, boilerplate, primary_color, secondary_color, accent_color, press_kit_slug, press_contact_email, logo_url, headline_font, body_font, approved_colors, approved_fonts) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                accountId,
                'Ficonica',
                'Ficonica is a leading innovator in the technology sector...',
                '#4F46E5',
                '#EC4899',
                '#10B981',
                'ficonica-press',
                'press@ficonica.com',
                `http://localhost:3001/example_logo.png`,
                'Inter',
                'Roboto',
                '["#4F46E5", "#EC4899", "#10B981", "#F59E0B", "#ffffff", "#000000"]',
                '["Inter", "Roboto", "Georgia"]'
            ]
        );
        
        console.log('Database seeded successfully.');
    }

    return db;
}

module.exports = setupDatabase; 