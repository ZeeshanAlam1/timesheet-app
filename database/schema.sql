-- Supabase Database Schema for Timesheet Application
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    reporting_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT FALSE,
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_location VARCHAR(255),
    check_out_location VARCHAR(255),
    total_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'incomplete' CHECK (status IN ('present', 'absent', 'incomplete')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Locations Table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    terminal_id VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reporting_manager ON users(reporting_manager_id);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_locations_terminal_id ON locations(terminal_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate total hours on attendance update
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
        NEW.total_hours = EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600;
        NEW.status = 'present';
    ELSIF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NULL THEN
        NEW.status = 'incomplete';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate hours
CREATE TRIGGER calculate_hours_trigger BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION calculate_attendance_hours();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Service role can do anything (for backend API)
CREATE POLICY "Service role has full access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to attendance" ON attendance
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to locations" ON locations
    FOR ALL USING (true);

-- Insert default admin user (password is 'Admin@123' - hashed with bcrypt)
-- Note: You should change this password immediately after first login
INSERT INTO users (employee_id, name, email, password_hash, role, department, position)
VALUES (
    'ADMIN001',
    'System Administrator',
    'admin@timesheet.com',
    '$2a$10$rEZQqZ9qY5qZ9qY5qZ9qYOqZ9qY5qZ9qY5qZ9qY5qZ9qY5qZ9qY5q',  -- This is a placeholder, will be created by server
    'admin',
    'IT',
    'System Administrator'
);

-- Insert sample locations
INSERT INTO locations (name, terminal_id, description, address) VALUES
    ('Main Office', 'TERMINAL-001', 'Main entrance terminal', '123 Business Street'),
    ('Branch Office', 'TERMINAL-002', 'Branch office entrance', '456 Commerce Avenue');

-- Helpful Views for Reports

-- View for user details with manager info
CREATE OR REPLACE VIEW user_details AS
SELECT 
    u.id,
    u.employee_id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.position,
    u.totp_enabled,
    u.is_active,
    m.name as manager_name,
    m.employee_id as manager_employee_id,
    u.created_at
FROM users u
LEFT JOIN users m ON u.reporting_manager_id = m.id;

-- View for attendance with user info
CREATE OR REPLACE VIEW attendance_details AS
SELECT 
    a.id,
    a.date,
    a.check_in_time,
    a.check_out_time,
    a.check_in_location,
    a.check_out_location,
    a.total_hours,
    a.status,
    a.notes,
    u.employee_id,
    u.name as user_name,
    u.department,
    u.position
FROM attendance a
JOIN users u ON a.user_id = u.id;

-- Function to get monthly attendance summary
CREATE OR REPLACE FUNCTION get_monthly_attendance_summary(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    total_days BIGINT,
    present_days BIGINT,
    incomplete_days BIGINT,
    total_hours NUMERIC,
    average_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE status = 'present') as present_days,
        COUNT(*) FILTER (WHERE status = 'incomplete') as incomplete_days,
        COALESCE(SUM(total_hours), 0) as total_hours,
        COALESCE(AVG(total_hours) FILTER (WHERE status = 'present'), 0) as average_hours
    FROM attendance
    WHERE user_id = p_user_id
        AND EXTRACT(YEAR FROM date) = p_year
        AND EXTRACT(MONTH FROM date) = p_month;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE users IS 'Stores user/employee information';
COMMENT ON TABLE attendance IS 'Stores daily attendance records';
COMMENT ON TABLE locations IS 'Stores office location/terminal information';
