-- Migration: Add ON DELETE CASCADE to completed_blogs foreign key
-- Purpose: Fix Bug #4 - Allow permanent project deletion when completed blog exists
-- Date: 2025-12-30

-- Drop existing foreign key constraint
ALTER TABLE completed_blogs
DROP CONSTRAINT IF EXISTS completed_blogs_project_id_fkey;

-- Re-add foreign key constraint with CASCADE
ALTER TABLE completed_blogs
ADD CONSTRAINT completed_blogs_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;
