// unified-backend/src/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getMainDb } = require('../database');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Invite a new user
router.post('/invitations', authMiddleware, rbacMiddleware(['owner']), async (req, res, next) => {
    const { inviteeEmail } = req.body;
    const { id: inviterId, accountId } = req.user;

    if (!inviteeEmail) {
        return res.status(400).json({ message: 'Invitee email is required.' });
    }

    let db;
    try {
        db = await getMainDb();
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 3600 * 1000); // 72 hours

        await db.run(
            'INSERT INTO invitations (account_id, inviter_id, invitee_email, token, expires_at) VALUES (?, ?, ?, ?, ?)',
            accountId, inviterId, inviteeEmail, token, expiresAt.toISOString()
        );

        const invitationLink = `http://localhost:3000/accept-invitation?token=${token}`;
        logger.info(`Invitation sent to ${inviteeEmail} for account ${accountId}. Link: ${invitationLink}`);
        
        res.status(201).json({ message: 'Invitation sent successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: 'An invitation for this email already exists for this account.' });
        }
        logger.error('Invitation error:', error);
        next(error);
    }
});

// Accept an invitation
router.post('/invitations/accept', async (req, res, next) => {
    const { token, fullName, password } = req.body;
    if (!token || !fullName || !password) {
        return res.status(400).json({ message: 'Token, full name, and password are required.' });
    }

    let db;
    try {
        db = await getMainDb();
        const invitation = await db.get('SELECT * FROM invitations WHERE token = ? AND status = ?', token, 'pending');
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found, has expired, or has already been accepted.' });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return res.status(410).json({ message: 'Invitation has expired.' });
        }

        let user = await db.get('SELECT * FROM users WHERE email = ?', invitation.invitee_email);
        
        await db.run('BEGIN');

        if (user) {
            const existingMembership = await db.get('SELECT * FROM account_members WHERE account_id = ? AND user_id = ?', invitation.account_id, user.id);
            if (existingMembership) {
                await db.run('ROLLBACK');
                return res.status(409).json({ message: 'User is already a member of this account.' });
            }
        } else {
            const bcrypt = require('bcryptjs');
            const passwordHash = await bcrypt.hash(password, 10);
            const userResult = await db.run(
                'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
                fullName, invitation.invitee_email, passwordHash
            );
            user = { id: userResult.lastID };
        }

        await db.run(
            'INSERT INTO account_members (account_id, user_id, role) VALUES (?, ?, ?)',
            invitation.account_id, user.id, 'guest'
        );

        await db.run('UPDATE invitations SET status = ? WHERE id = ?', 'accepted', invitation.id);
        
        await db.run('COMMIT');

        logger.info(`User ${invitation.invitee_email} accepted invitation for account ${invitation.account_id}`);
        res.status(200).json({ message: 'Invitation accepted successfully. You can now log in.' });

    } catch (error) {
        if (db) await db.run('ROLLBACK');
        logger.error('Accept invitation error:', error);
        next(error);
    }
});

// Get team members
router.get('/', authMiddleware, rbacMiddleware(['owner', 'guest']), async (req, res, next) => {
    const { accountId } = req.user;
    try {
        const db = await getMainDb();
        const members = await db.all(
            `SELECT u.id, u.email, u.full_name, am.role
             FROM users u
             JOIN account_members am ON u.id = am.user_id
             WHERE am.account_id = ?`,
            accountId
        );
        res.json(members);
    } catch (error) {
        logger.error('Get team error:', error);
        next(error);
    }
});

// Remove a team member
router.delete('/:memberId', authMiddleware, rbacMiddleware(['owner']), async (req, res, next) => {
    const { accountId, id: currentUserId } = req.user;
    const { memberId } = req.params;

    if (parseInt(memberId, 10) === currentUserId) {
        return res.status(400).json({ message: "You cannot remove yourself." });
    }

    try {
        const db = await getMainDb();
        const result = await db.run(
            'DELETE FROM account_members WHERE user_id = ? AND account_id = ? AND role <> ?',
            memberId, accountId, 'owner'
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Member not found or you are not authorized to remove this member.' });
        }

        logger.info(`Member ${memberId} removed from account ${accountId} by user ${currentUserId}`);
        res.status(200).json({ message: 'Team member removed successfully.' });
    } catch (error) {
        logger.error('Remove team member error:', error);
        next(error);
    }
});


module.exports = router; 