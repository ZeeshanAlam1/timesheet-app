const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class UserService {
  // Create new user
  async createUser(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      const { data, error } = await supabase
        .from('users')
        .insert([{
          employee_id: userData.employeeId,
          name: userData.name,
          email: userData.email,
          password_hash: passwordHash,
          role: userData.role || 'employee',
          reporting_manager_id: userData.reportingManagerId || null,
          department: userData.department,
          position: userData.position
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create user');
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find user');
    }
  }

  // Find user by employee ID
  async findByEmployeeId(employeeId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find user');
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          manager:reporting_manager_id(id, name, email, employee_id)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find user');
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          manager:reporting_manager_id(id, name, email, employee_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  // Update user
  async updateUser(id, updates) {
    try {
      const updateData = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.role) updateData.role = updates.role;
      if (updates.reportingManagerId !== undefined) updateData.reporting_manager_id = updates.reportingManagerId;
      if (updates.department) updateData.department = updates.department;
      if (updates.position) updateData.position = updates.position;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.totpSecret) updateData.totp_secret = updates.totpSecret;
      if (updates.totpEnabled !== undefined) updateData.totp_enabled = updates.totpEnabled;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get team members (for managers)
  async getTeamMembers(managerId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('reporting_manager_id', managerId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch team members');
    }
  }

  // Get managers (for dropdown)
  async getManagers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, employee_id')
        .in('role', ['admin', 'manager'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch managers');
    }
  }
}

module.exports = new UserService();
