-- ==============================================================================
-- Triggers and Automated Audit Functions
-- Course: DBMS Level 3 Mini-Project
-- Demonstrates: Triggers, Audit Trails, and Timestamp Automation
-- ==============================================================================

-- 1. Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

-- Apply trigger to research_paper table
DROP TRIGGER IF EXISTS trg_research_paper_updated_at ON research_paper;
CREATE TRIGGER trg_research_paper_updated_at
BEFORE UPDATE ON research_paper
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

-- ==============================================================================
-- AUDIT LOGGING TRIGGER
-- Enterprise audit table to track paper modifications and deletions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS paper_audit_log (
    audit_id SERIAL PRIMARY KEY,
    paper_id INT NOT NULL,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('UPDATE', 'DELETE')),
    old_title VARCHAR(500),
    new_title VARCHAR(500),
    changed_by_user_id INT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_paper_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO paper_audit_log (paper_id, action_type, old_title, new_title, changed_by_user_id)
        VALUES (OLD.paper_id, 'UPDATE', OLD.title, NEW.title, NEW.user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO paper_audit_log (paper_id, action_type, old_title, new_title, changed_by_user_id)
        VALUES (OLD.paper_id, 'DELETE', OLD.title, NULL, OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_paper_changes ON research_paper;
CREATE TRIGGER trg_audit_paper_changes
AFTER UPDATE OR DELETE ON research_paper
FOR EACH ROW
EXECUTE FUNCTION log_paper_changes();
