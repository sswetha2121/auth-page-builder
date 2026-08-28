-- =========================================================
-- AUTH PAGE BUILDER - DATABASE SCHEMA (PHASE 1)
-- Safe, Non-Destructive Migrations
-- =========================================================

-- 1. Dedicated Users Table
CREATE TABLE IF NOT EXISTS auth_user (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auth_user_mobile (mobile)
);

-- 2. Dedicated Configurations Table
CREATE TABLE IF NOT EXISTS auth_configurations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    configuration_name VARCHAR(255) NOT NULL,
    landing_url TEXT NULL,
    redirect_url TEXT NULL,
    configuration_data JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auth_configurations_user_id (user_id),
    CONSTRAINT fk_auth_configurations_user
        FOREIGN KEY (user_id)
        REFERENCES auth_user(id)
        ON DELETE CASCADE
);
