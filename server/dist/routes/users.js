"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
// Change to export a function that accepts db
exports.default = (db) => {
    const router = (0, express_1.Router)();
    // Get user profile
    router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const user = await db.get('SELECT id, email, first_name, last_name, phone, is_admin, created_at FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin,
                    createdAt: user.created_at
                }
            }
        });
    }));
    // Update user profile
    router.put('/profile', [
        (0, express_validator_1.body)('firstName').trim().notEmpty().isLength({ min: 2, max: 50 }),
        (0, express_validator_1.body)('lastName').trim().notEmpty().isLength({ min: 2, max: 50 }),
        (0, express_validator_1.body)('phone').optional().isMobilePhone('any')
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { firstName, lastName, phone } = req.body;
        await db.run('UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [firstName, lastName, phone || null, userId]);
        const updatedUser = await db.get('SELECT id, email, first_name, last_name, phone, is_admin FROM users WHERE id = ?', [userId]);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    phone: updatedUser.phone,
                    isAdmin: updatedUser.is_admin
                }
            }
        });
    }));
    // Change password
    router.put('/password', [
        (0, express_validator_1.body)('currentPassword').notEmpty(),
        (0, express_validator_1.body)('newPassword').isLength({ min: 6 })
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get current password hash
        const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password
        const bcrypt = require('bcryptjs');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        // Update password
        await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPasswordHash, userId]);
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    }));
    // Get user addresses
    router.get('/addresses', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const addresses = await db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
        const formattedAddresses = addresses.map((addr) => ({
            id: addr.id,
            type: addr.type,
            firstName: addr.first_name,
            lastName: addr.last_name,
            company: addr.company,
            addressLine1: addr.address_line_1,
            addressLine2: addr.address_line_2,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postal_code,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.is_default === 1,
            createdAt: addr.created_at,
            updatedAt: addr.updated_at
        }));
        res.json({
            success: true,
            data: { addresses: formattedAddresses }
        });
    }));
    // Add new address
    router.post('/addresses', [
        (0, express_validator_1.body)('type').isIn(['billing', 'shipping']),
        (0, express_validator_1.body)('firstName').trim().notEmpty(),
        (0, express_validator_1.body)('lastName').trim().notEmpty(),
        (0, express_validator_1.body)('addressLine1').trim().notEmpty(),
        (0, express_validator_1.body)('city').trim().notEmpty(),
        (0, express_validator_1.body)('postalCode').trim().notEmpty(),
        (0, express_validator_1.body)('country').trim().notEmpty(),
        (0, express_validator_1.body)('isDefault').optional().isBoolean()
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { type, firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault = false } = req.body;
        // If setting as default, remove default from other addresses of same type
        if (isDefault) {
            await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND type = ?', [userId, type]);
        }
        const result = await db.run(`
    INSERT INTO addresses (
      user_id, type, first_name, last_name, company, address_line_1, 
      address_line_2, city, state, postal_code, country, phone, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
            userId, type, firstName, lastName, company || null, addressLine1,
            addressLine2 || null, city, state || null, postalCode, country, phone || null, isDefault ? 1 : 0
        ]);
        const addressId = result.lastID;
        const newAddress = await db.get('SELECT * FROM addresses WHERE id = ?', [addressId]);
        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: {
                address: {
                    id: newAddress.id,
                    type: newAddress.type,
                    firstName: newAddress.first_name,
                    lastName: newAddress.last_name,
                    company: newAddress.company,
                    addressLine1: newAddress.address_line_1,
                    addressLine2: newAddress.address_line_2,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.postal_code,
                    country: newAddress.country,
                    phone: newAddress.phone,
                    isDefault: newAddress.is_default === 1
                }
            }
        });
    }));
    // Update address
    router.put('/addresses/:addressId', [
        (0, express_validator_1.body)('type').isIn(['billing', 'shipping']),
        (0, express_validator_1.body)('firstName').trim().notEmpty(),
        (0, express_validator_1.body)('lastName').trim().notEmpty(),
        (0, express_validator_1.body)('addressLine1').trim().notEmpty(),
        (0, express_validator_1.body)('city').trim().notEmpty(),
        (0, express_validator_1.body)('postalCode').trim().notEmpty(),
        (0, express_validator_1.body)('country').trim().notEmpty(),
        (0, express_validator_1.body)('isDefault').optional().isBoolean()
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { addressId } = req.params;
        const { type, firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault = false } = req.body;
        // Verify address belongs to user
        const address = await db.get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        // If setting as default, remove default from other addresses of same type
        if (isDefault) {
            await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND type = ?', [userId, type]);
        }
        await db.run(`
    UPDATE addresses SET 
      type = ?, first_name = ?, last_name = ?, company = ?, 
      address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, 
      postal_code = ?, country = ?, phone = ?, is_default = ?, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `, [
            type, firstName, lastName, company || null, addressLine1,
            addressLine2 || null, city, state || null, postalCode, country,
            phone || null, isDefault ? 1 : 0, addressId, userId
        ]);
        const updatedAddress = await db.get('SELECT * FROM addresses WHERE id = ?', [addressId]);
        res.json({
            success: true,
            message: 'Address updated successfully',
            data: {
                address: {
                    id: updatedAddress.id,
                    type: updatedAddress.type,
                    firstName: updatedAddress.first_name,
                    lastName: updatedAddress.last_name,
                    company: updatedAddress.company,
                    addressLine1: updatedAddress.address_line_1,
                    addressLine2: updatedAddress.address_line_2,
                    city: updatedAddress.city,
                    state: updatedAddress.state,
                    postalCode: updatedAddress.postal_code,
                    country: updatedAddress.country,
                    phone: updatedAddress.phone,
                    isDefault: updatedAddress.is_default === 1
                }
            }
        });
    }));
    // Delete address
    router.delete('/addresses/:addressId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { addressId } = req.params;
        const address = await db.get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    }));
    return router;
};
//# sourceMappingURL=users.js.map