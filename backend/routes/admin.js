const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const attendanceService = require('../services/attendanceService');
const locationService = require('../services/locationService');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    // Format response
    const formattedUsers = users.map(user => ({
      _id: user.id,
      employeeId: user.employee_id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      totpEnabled: user.totp_enabled,
      isActive: user.is_active,
      reportingManager: user.manager ? {
        id: user.manager.id,
        name: user.manager.name,
        email: user.manager.email,
        employeeId: user.manager.employee_id
      } : null,
      createdAt: user.created_at
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (Admin only)
router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { employeeId, name, email, password, role, reportingManager, department, position } = req.body;

    // Check if user already exists
    const existingUserByEmail = await userService.findByEmail(email);
    const existingUserByEmpId = await userService.findByEmployeeId(employeeId);

    if (existingUserByEmail || existingUserByEmpId) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    // Create new user
    const user = await userService.createUser({
      employeeId,
      name,
      email,
      password,
      role: role || 'employee',
      reportingManagerId: reportingManager || null,
      department,
      position
    });

    // Format response
    const userResponse = {
      _id: user.id,
      employeeId: user.employee_id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      totpEnabled: user.totp_enabled,
      isActive: user.is_active,
      createdAt: user.created_at
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// Update user (Admin only)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, role, reportingManager, department, position, isActive } = req.body;

    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updatedUser = await userService.updateUser(req.params.id, {
      name,
      email,
      role,
      reportingManagerId: reportingManager,
      department,
      position,
      isActive
    });

    // Format response
    const userResponse = {
      _id: updatedUser.id,
      employeeId: updatedUser.employee_id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      totpEnabled: updatedUser.totp_enabled,
      isActive: updatedUser.is_active
    };

    res.json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Get user's monthly timesheet (Admin/Manager can view any, employees can view their own)
router.get('/timesheet/:userId/:year/:month', auth, async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    // Check permissions
    if (req.user.role === 'employee' && req.user.id !== userId) {
      // Check if requesting user is the reporting manager
      const targetUser = await userService.findById(userId);
      if (!targetUser || !targetUser.reporting_manager_id || 
          targetUser.reporting_manager_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Get user info
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get attendance records
    const attendanceRecords = await attendanceService.getMonthlyAttendance(
      userId, 
      parseInt(year), 
      parseInt(month)
    );

    // Get statistics
    const stats = await attendanceService.getMonthlyStats(
      userId,
      parseInt(year),
      parseInt(month)
    );

    // Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    res.json({
      user: {
        name: user.name,
        employeeId: user.employee_id,
        email: user.email,
        department: user.department,
        position: user.position
      },
      period: {
        year: parseInt(year),
        month: parseInt(month),
        startDate,
        endDate
      },
      statistics: {
        totalDays: parseInt(stats.total_days),
        presentDays: parseInt(stats.present_days),
        incompleteDays: parseInt(stats.incomplete_days),
        totalHours: parseFloat(stats.total_hours),
        averageHoursPerDay: parseFloat(stats.average_hours)
      },
      records: attendanceRecords.map(record => ({
        _id: record.id,
        date: record.date,
        checkInTime: record.check_in_time,
        checkInLocation: record.check_in_location,
        checkOutTime: record.check_out_time,
        checkOutLocation: record.check_out_location,
        totalHours: parseFloat(record.total_hours),
        status: record.status,
        notes: record.notes
      }))
    });
  } catch (error) {
    console.error('Get timesheet error:', error);
    res.status(500).json({ message: 'Server error fetching timesheet' });
  }
});

// Get all team members for a manager
router.get('/team', auth, managerAuth, async (req, res) => {
  try {
    const teamMembers = await userService.getTeamMembers(req.user.id);

    // Format response
    const formattedTeam = teamMembers.map(member => ({
      _id: member.id,
      employeeId: member.employee_id,
      name: member.name,
      email: member.email,
      department: member.department,
      position: member.position,
      totpEnabled: member.totp_enabled,
      isActive: member.is_active
    }));

    res.json(formattedTeam);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Location management routes

// Get all locations
router.get('/locations', auth, async (req, res) => {
  try {
    const locations = await locationService.getAllLocations();

    // Format response
    const formattedLocations = locations.map(loc => ({
      _id: loc.id,
      name: loc.name,
      terminalId: loc.terminal_id,
      description: loc.description,
      address: loc.address,
      isActive: loc.is_active,
      createdAt: loc.created_at
    }));

    res.json(formattedLocations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create location (Admin only)
router.post('/locations', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, address, terminalId } = req.body;

    const location = await locationService.createLocation({
      name,
      description,
      address,
      terminalId
    });

    // Format response
    const formattedLocation = {
      _id: location.id,
      name: location.name,
      terminalId: location.terminal_id,
      description: location.description,
      address: location.address,
      isActive: location.is_active,
      createdAt: location.created_at
    };

    res.status(201).json({
      message: 'Location created successfully',
      location: formattedLocation
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Server error creating location' });
  }
});

// Update location (Admin only)
router.put('/locations/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, address, isActive } = req.body;

    const location = await locationService.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const updatedLocation = await locationService.updateLocation(req.params.id, {
      name,
      description,
      address,
      isActive
    });

    // Format response
    const formattedLocation = {
      _id: updatedLocation.id,
      name: updatedLocation.name,
      terminalId: updatedLocation.terminal_id,
      description: updatedLocation.description,
      address: updatedLocation.address,
      isActive: updatedLocation.is_active
    };

    res.json({
      message: 'Location updated successfully',
      location: formattedLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

module.exports = router;
