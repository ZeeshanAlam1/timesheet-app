const { supabase } = require('../config/supabase');

class LocationService {
  // Create new location
  async createLocation(locationData) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: locationData.name,
          terminal_id: locationData.terminalId,
          description: locationData.description,
          address: locationData.address
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create location');
    }
  }

  // Find location by terminal ID
  async findByTerminalId(terminalId) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('terminal_id', terminalId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find location');
    }
  }

  // Get all locations
  async getAllLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch locations');
    }
  }

  // Get active locations only
  async getActiveLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active locations');
    }
  }

  // Update location
  async updateLocation(id, updates) {
    try {
      const updateData = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update location');
    }
  }

  // Find location by ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find location');
    }
  }
}

module.exports = new LocationService();
