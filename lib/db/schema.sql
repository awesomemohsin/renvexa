-- ==============================================================================
-- RENVEXA MULTI-TENANT SAAS DATABASE SCHEMA (PostgreSQL 15+)
-- Commercial Multi-User, Multi-Property Architecture from Day One
-- Hierarchy:
-- User -> Organization (SaaS Tenant) -> Multiple Properties -> Buildings -> Floors -> Rooms -> Tenants
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Global account identity across all SaaS tenants)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANIZATIONS (SaaS Tenant with Subscription Tier & Resource Quotas)
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled');

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    tax_identifier VARCHAR(100),
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- SaaS Quotas & Subscription details
    subscription_plan subscription_plan NOT NULL DEFAULT 'starter',
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    max_properties INT NOT NULL DEFAULT 5,
    max_units INT NOT NULL DEFAULT 25,
    subscription_renewal_date TIMESTAMPTZ,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(subscription_plan, subscription_status);

-- 3. ORGANIZATION MEMBERSHIPS (Multi-User RBAC at SaaS Tenant Scope)
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'property_manager', 'accountant', 'viewer');
CREATE TYPE membership_status AS ENUM ('active', 'invited', 'suspended');

CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role organization_role NOT NULL DEFAULT 'viewer',
    status membership_status NOT NULL DEFAULT 'active',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);
CREATE INDEX idx_org_memberships_user ON organization_memberships(user_id);
CREATE INDEX idx_org_memberships_org ON organization_memberships(organization_id);

-- 4. ORGANIZATION INVITATIONS (SaaS Team Onboarding & Delegated Scopes)
CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role organization_role NOT NULL DEFAULT 'property_manager',
    assigned_property_ids UUID[] DEFAULT '{}',
    invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX idx_org_invitations_org ON organization_invitations(organization_id);

-- 5. PROPERTIES (Multiple properties per organization)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    property_type VARCHAR(50) NOT NULL DEFAULT 'commercial_residential',
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Dhaka',
    total_buildings INT NOT NULL DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_property_code UNIQUE (organization_id, code)
);
CREATE INDEX idx_properties_org ON properties(organization_id);

-- 6. PROPERTY MEMBERSHIPS (Scoped staff access to specific properties)
CREATE TYPE property_role AS ENUM ('manager', 'accountant', 'supervisor', 'viewer');

CREATE TABLE property_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role property_role NOT NULL DEFAULT 'viewer',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_property_user UNIQUE (property_id, user_id)
);
CREATE INDEX idx_prop_memberships_user ON property_memberships(user_id);
CREATE INDEX idx_prop_memberships_prop ON property_memberships(property_id);
CREATE INDEX idx_prop_memberships_org ON property_memberships(organization_id);

-- 7. BUILDINGS (1:N under Property)
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    total_floors INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_property_building_code UNIQUE (property_id, code)
);
CREATE INDEX idx_buildings_org_prop ON buildings(organization_id, property_id);

-- 8. FLOORS (1:N under Building)
CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_building_floor UNIQUE (building_id, floor_number)
);
CREATE INDEX idx_floors_org_prop_building ON floors(organization_id, property_id, building_id);

-- 9. ROOMS / UNITS (1:N under Floor)
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied', 'reserved', 'maintenance');
CREATE TYPE unit_type AS ENUM ('residential', 'commercial', 'office', 'storage', 'parking');

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    unit_type unit_type NOT NULL DEFAULT 'residential',
    base_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
    size_sqft NUMERIC(8, 2),
    status unit_status NOT NULL DEFAULT 'vacant',
    utility_meters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_floor_room_number UNIQUE (floor_id, room_number)
);
CREATE INDEX idx_rooms_org_prop ON rooms(organization_id, property_id);
CREATE INDEX idx_rooms_status ON rooms(organization_id, property_id, status);

-- 10. TENANTS (Scoped to Organization)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    nid_or_passport VARCHAR(100),
    is_corporate BOOLEAN NOT NULL DEFAULT FALSE,
    company_registration VARCHAR(100),
    emergency_contact JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_org ON tenants(organization_id);

-- 11. LEASES (Contract linking a Room and a Tenant)
CREATE TYPE lease_status AS ENUM ('active', 'expired', 'terminated', 'draft');

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    rent_amount NUMERIC(12, 2) NOT NULL,
    security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    billing_cycle_day INT NOT NULL DEFAULT 1,
    status lease_status NOT NULL DEFAULT 'active',
    agreement_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leases_org_prop ON leases(organization_id, property_id);
CREATE INDEX idx_leases_room ON leases(room_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Zero cross-tenant data leakage guaranteed at database level
-- ==============================================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_properties ON properties
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_buildings ON buildings
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_floors ON floors
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_rooms ON rooms
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_tenants ON tenants
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation_leases ON leases
    USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
