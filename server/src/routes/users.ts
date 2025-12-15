// src/routes/users.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { database } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await database.get(`
      SELECT 
        id, email, first_name, last_name, phone, is_admin, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [req.user.userId]);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (firstName) {
      paramCount++;
      updates.push(`first_name = $${paramCount}`);
      params.push(firstName);
    }

    if (lastName) {
      paramCount++;
      updates.push(`last_name = $${paramCount}`);
      params.push(lastName);
    }

    if (phone) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided'
      });
    }

    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.user.userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, is_admin
    `;

    const updatedUser = await database.get(updateQuery, params);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await database.all(`
      SELECT 
        id, type, first_name, last_name, company, address_line_1,
        address_line_2, city, state, postal_code, country, phone,
        is_default, created_at, updated_at
      FROM addresses 
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `, [req.user.userId]);

    res.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      error: 'Failed to fetch addresses',
      message: error.message
    });
  }
});

// Add new address
router.post('/addresses', authenticateToken, [
  body('type').isIn(['billing', 'shipping']).withMessage('Type must be billing or shipping'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('addressLine1').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('postalCode').trim().notEmpty(),
  body('country').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      type, firstName, lastName, company, addressLine1, addressLine2,
      city, state, postalCode, country, phone, isDefault
    } = req.body;

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await database.run(`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = $1 AND type = $2
      `, [req.user.userId, type]);
    }

    const result = await database.run(`
      INSERT INTO addresses (
        user_id, type, first_name, last_name, company, address_line_1,
        address_line_2, city, state, postal_code, country, phone, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      req.user.userId, type, firstName, lastName, company, addressLine1,
      addressLine2, city, state, postalCode, country, phone, isDefault
    ]);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addressId: result.lastID
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      error: 'Failed to add address',
      message: error.message
    });
  }
});

// Update address
router.put('/addresses/:id', authenticateToken, [
  body('type').isIn(['billing', 'shipping']).optional(),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('addressLine1').optional().trim().notEmpty(),
  body('city').optional().trim().notEmpty(),
  body('postalCode').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const {
      type, firstName, lastName, company, addressLine1, addressLine2,
      city, state, postalCode, country, phone, isDefault
    } = req.body;

    // Check if address belongs to user
    const address = await database.get(
      'SELECT id, type FROM addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (!address) {
      return res.status(404).json({
        error: 'Address not found'
      });
    }

    // If setting as default, unset other defaults of same type
    if (isDefault && type !== address.type) {
      await database.run(`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = $1 AND type = $2
      `, [req.user.userId, type]);
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    const fields = {
      type, firstName, lastName, company, addressLine1, addressLine2,
      city, state, postalCode, country, phone, isDefault
    };

    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        paramCount++;
        const dbField = field === 'firstName' ? 'first_name' :
                       field === 'lastName' ? 'last_name' :
                       field === 'addressLine1' ? 'address_line_1' :
                       field === 'addressLine2' ? 'address_line_2' :
                       field === 'postalCode' ? 'postal_code' : field;
        
        updates.push(`${dbField} = $${paramCount}`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided'
      });
    }

    paramCount++;
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, req.user.userId);

    const updateQuery = `
      UPDATE addresses 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id
    `;

    await database.run(updateQuery, params);

    res.json({
      success: true,
      message: 'Address updated successfully'
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      error: 'Failed to update address',
      message: error.message
    });
  }
});

// Delete address
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await database.run(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      error: 'Failed to delete address',
      message: error.message
    });
  }
});

export default router;