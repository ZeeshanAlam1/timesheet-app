const { supabase } = require('../config/supabase');

class AttendanceService {
  // Find attendance record for user on specific date
  async findByUserAndDate(userId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', startOfDay.toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to find attendance');
    }
  }

  // Create attendance record (check-in)
  async createCheckIn(userId, locationName) {
    try {
      const now = new Date();
      const dateOnly = now.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          user_id: userId,
          date: dateOnly,
          check_in_time: now.toISOString(),
          check_in_location: locationName
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create check-in');
    }
  }

  // Update attendance record (check-out)
  async updateCheckOut(attendanceId, locationName) {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now.toISOString(),
          check_out_location: locationName
        })
        .eq('id', attendanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update check-out');
    }
  }

  // Get attendance records for a user in a date range
  async getAttendanceByDateRange(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch attendance records');
    }
  }

  // Get monthly statistics
  async getMonthlyStats(userId, year, month) {
    try {
      const { data, error } = await supabase
        .rpc('get_monthly_attendance_summary', {
          p_user_id: userId,
          p_year: year,
          p_month: month
        });

      if (error) throw error;
      return data[0] || {
        total_days: 0,
        present_days: 0,
        incomplete_days: 0,
        total_hours: 0,
        average_hours: 0
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch monthly stats');
    }
  }

  // Get all attendance for a specific month
  async getMonthlyAttendance(userId, year, month) {
    try {
      // Calculate date range
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch monthly attendance');
    }
  }

  // Update attendance record
  async updateAttendance(id, updates) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update attendance');
    }
  }
}

module.exports = new AttendanceService();
