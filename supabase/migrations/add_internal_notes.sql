-- Migration: Add internal_notes column to merchants table
-- Run this once in your Supabase SQL Editor

ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS internal_notes TEXT;
