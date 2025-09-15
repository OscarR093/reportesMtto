-- Migration script to update Reports table for multiple evidence support
-- Run this script on your PostgreSQL database

-- Add new columns for multiple evidence support
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS evidence_images TEXT,
ADD COLUMN IF NOT EXISTS evidence_filenames TEXT;

-- Migrate existing evidence_url data to evidence_images format
UPDATE reports 
SET evidence_images = CASE 
  WHEN evidence_url IS NOT NULL THEN '["' || evidence_url || '"]'
  ELSE NULL 
END,
evidence_filenames = CASE 
  WHEN evidence_filename IS NOT NULL THEN '["' || evidence_filename || '"]'
  ELSE NULL 
END
WHERE evidence_url IS NOT NULL OR evidence_filename IS NOT NULL;

-- Optionally drop old columns after verifying migration
-- ALTER TABLE reports DROP COLUMN IF EXISTS evidence_url;
-- ALTER TABLE reports DROP COLUMN IF EXISTS evidence_filename;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_equipment_area ON reports(equipment_area);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
