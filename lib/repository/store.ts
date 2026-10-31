import {
  Building,
  Floor,
  Lease,
  Organization,
  OrganizationInvitation,
  OrganizationMemberDetail,
  OrganizationMembership,
  Property,
  PropertyHierarchy,
  PropertyMembership,
  Room,
  RoomWithTenant,
  Tenant,
  User,
} from '../domain/hierarchy'

// ==============================================================================
// SEED USERS (Multiple distinct SaaS account holders & team members)
// ==============================================================================

export const SEED_USERS: User[] = [
  {
    id: 'user_owner_mohsin',
    email: 'mohsin@renvexa.io',
    fullName: 'Mohsin Alam',
    phone: '+8801711000001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_owner_sarah',
    email: 'sarah.khan@bengalassets.com',
    fullName: 'Sarah Khan',
    phone: '+8801711000099',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_pm_tanvir',
    email: 'tanvir.manager@renvexa.io',
    fullName: 'Tanvir Rahman',
    phone: '+8801811000002',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_accountant_nafis',
    email: 'nafis.cpa@renvexa.io',
    fullName: 'Nafis Ahmed',
    phone: '+8801911000003',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
  },
]

// ==============================================================================
// SEED ORGANIZATIONS (Separate SaaS Customers / Landlord Companies)
// ==============================================================================

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_prime_holdings',
    name: 'Renvexa Prime Holdings',
    slug: 'prime-holdings',
    currency: 'BDT',
    taxIdentifier: 'BIN-948102931',
    createdByUserId: 'user_owner_mohsin',
    subscription: {
      plan: 'growth',
      status: 'active',
      maxProperties: 5,
      maxUnits: 50,
      renewalDate: '2027-01-15T08:00:00Z',
    },
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'org_bengal_assets',
    name: 'Bengal Asset Management',
    slug: 'bengal-assets',
    currency: 'BDT',
    taxIdentifier: 'BIN-110293847',
    createdByUserId: 'user_owner_sarah',
    subscription: {
      plan: 'starter',
      status: 'active',
      maxProperties: 2,
      maxUnits: 20,
      renewalDate: '2026-12-01T09:00:00Z',
    },
    createdAt: '2026-02-01T09:00:00Z',
  },
]

export const SEED_ORG_MEMBERSHIPS: OrganizationMembership[] = [
  // Mohsin is Owner of Prime Holdings
  {
    id: 'om_1',
    organizationId: 'org_prime_holdings',
    userId: 'user_owner_mohsin',
    role: 'owner',
    status: 'active',
    joinedAt: '2026-01-15T08:00:00Z',
  },
  // Tanvir is Property Manager inside Prime Holdings
  {
    id: 'om_2',
    organizationId: 'org_prime_holdings',
    userId: 'user_pm_tanvir',
    role: 'property_manager',
    status: 'active',
    joinedAt: '2026-02-10T10:00:00Z',
  },
  // Nafis is Accountant inside Prime Holdings
  {
    id: 'om_3',
    organizationId: 'org_prime_holdings',
    userId: 'user_accountant_nafis',
    role: 'accountant',
    status: 'active',
    joinedAt: '2026-02-12T11:00:00Z',
  },
  // Sarah is Owner of Bengal Asset Management
  {
    id: 'om_4',
    organizationId: 'org_bengal_assets',
    userId: 'user_owner_sarah',
    role: 'owner',
    status: 'active',
    joinedAt: '2026-02-01T09:00:00Z',
  },
  // Mohsin is also an external advisory Viewer in Bengal Asset Management (Multi-org SaaS demonstration)
  {
    id: 'om_5',
    organizationId: 'org_bengal_assets',
    userId: 'user_owner_mohsin',
    role: 'viewer',
    status: 'active',
    joinedAt: '2026-02-15T10:00:00Z',
  },
]

export const SEED_PROPERTIES: Property[] = [
  // --- Org 1: Prime Holdings Properties ---
  {
    id: 'prop_green_tower',
    organizationId: 'org_prime_holdings',
    name: 'Green Tower',
    code: 'GT-01',
    propertyType: 'commercial_residential',
    address: 'Plot 42, Road 11, Block D, Gulshan-2',
    city: 'Dhaka',
    timezone: 'Asia/Dhaka',
    totalBuildings: 2,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'prop_lake_view',
    organizationId: 'org_prime_holdings',
    name: 'Lake View Apartments',
    code: 'LV-02',
    propertyType: 'residential',
    address: 'House 18, Road 27, Dhanmondi',
    city: 'Dhaka',
    timezone: 'Asia/Dhaka',
    totalBuildings: 1,
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'prop_blue_residence',
    organizationId: 'org_prime_holdings',
    name: 'Blue Residence',
    code: 'BR-03',
    propertyType: 'residential',
    address: 'Sector 3, Road 7, Uttara',
    city: 'Dhaka',
    timezone: 'Asia/Dhaka',
    totalBuildings: 1,
    createdAt: '2026-02-15T12:00:00Z',
  },

  // --- Org 2: Bengal Asset Management Properties (Strictly isolated from Org 1) ---
  {
    id: 'prop_padma_heights',
    organizationId: 'org_bengal_assets',
    name: 'Padma Heights',
    code: 'PH-01',
    propertyType: 'commercial_residential',
    address: 'Block E, Road 17, Banani',
    city: 'Dhaka',
    timezone: 'Asia/Dhaka',
    totalBuildings: 1,
    createdAt: '2026-02-05T10:00:00Z',
  },
]

export const SEED_PROPERTY_MEMBERSHIPS: PropertyMembership[] = [
  // Tanvir is only assigned to Green Tower inside Prime Holdings
  {
    id: 'pm_1',
    organizationId: 'org_prime_holdings',
    propertyId: 'prop_green_tower',
    userId: 'user_pm_tanvir',
    role: 'manager',
    assignedAt: '2026-02-10T10:00:00Z',
  },
]

export const SEED_INVITATIONS: OrganizationInvitation[] = [
  {
    id: 'inv_1',
    organizationId: 'org_prime_holdings',
    email: 'kazi.supervisor@renvexa.io',
    role: 'property_manager',
    assignedPropertyIds: ['prop_lake_view'],
    invitedByUserId: 'user_owner_mohsin',
    status: 'pending',
    createdAt: '2026-03-01T10:00:00Z',
    expiresAt: '2026-03-08T10:00:00Z',
  },
]

export const SEED_BUILDINGS: Building[] = [
  // Green Tower (Org 1)
  {
    id: 'bld_gt_a',
    organizationId: 'org_prime_holdings',
    propertyId: 'prop_green_tower',
    name: 'Tower A (Commercial)',
    code: 'TWR-A',
    totalFloors: 3,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'bld_gt_b',
    organizationId: 'org_prime_holdings',
    propertyId: 'prop_green_tower',
    name: 'Tower B (Executive Suites)',
    code: 'TWR-B',
    totalFloors: 2,
    createdAt: '2026-01-20T10:00:00Z',
  },
  // Lake View (Org 1)
  {
    id: 'bld_lv_main',
    organizationId: 'org_prime_holdings',
    propertyId: 'prop_lake_view',
    name: 'Lake View Main',
    code: 'LV-MAIN',
    totalFloors: 2,
    createdAt: '2026-02-01T11:00:00Z',
  },
  // Blue Residence (Org 1)
  {
    id: 'bld_br_main',
    organizationId: 'org_prime_holdings',
    propertyId: 'prop_blue_residence',
    name: 'Blue Heights',
    code: 'BH-MAIN',
    totalFloors: 2,
    createdAt: '2026-02-15T12:00:00Z',
  },
  // Padma Heights (Org 2 - Bengal Asset Management)
  {
    id: 'bld_ph_main',
    organizationId: 'org_bengal_assets',
    propertyId: 'prop_padma_heights',
    name: 'Padma Tower Complex',
    code: 'PTC-01',
    totalFloors: 2,
    createdAt: '2026-02-05T10:00:00Z',
  },
]

export const SEED_FLOORS: Floor[] = [
  // Green Tower Floors (Org 1)
  { id: 'flr_gt_a_1', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorNumber: 1, label: 'Floor 1 (Retail & Commercial)' },
  { id: 'flr_gt_a_2', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorNumber: 2, label: 'Floor 2 (Tech Offices)' },
  { id: 'flr_gt_a_3', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorNumber: 3, label: 'Floor 3 (Corporate Wing)' },
  { id: 'flr_gt_b_4', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorNumber: 4, label: 'Floor 4 (Suites)' },
  { id: 'flr_gt_b_5', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorNumber: 5, label: 'Floor 5 (Penthouses)' },

  // Lake View Floors (Org 1)
  { id: 'flr_lv_1', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorNumber: 1, label: 'Floor 1' },
  { id: 'flr_lv_2', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorNumber: 2, label: 'Floor 2' },

  // Blue Residence Floors (Org 1)
  { id: 'flr_br_1', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', buildingId: 'bld_br_main', floorNumber: 1, label: 'Floor 1' },
  { id: 'flr_br_2', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', buildingId: 'bld_br_main', floorNumber: 2, label: 'Floor 2' },

  // Padma Heights Floors (Org 2)
  { id: 'flr_ph_1', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', buildingId: 'bld_ph_main', floorNumber: 1, label: 'Level 1 Commercial' },
  { id: 'flr_ph_2', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', buildingId: 'bld_ph_main', floorNumber: 2, label: 'Level 2 Offices' },
]

export const SEED_ROOMS: Room[] = [
  // Green Tower A - Floor 1 (Org 1)
  { id: 'room_gt_a_101', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorId: 'flr_gt_a_1', roomNumber: '101', unitType: 'commercial', baseRent: 120000, sizeSqft: 1250, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-101' }, createdAt: '2026-01-22T08:00:00Z' },
  { id: 'room_gt_a_102', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorId: 'flr_gt_a_1', roomNumber: '102', unitType: 'commercial', baseRent: 85000, sizeSqft: 900, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-102' }, createdAt: '2026-01-22T08:00:00Z' },

  // Green Tower A - Floor 2
  { id: 'room_gt_a_201', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorId: 'flr_gt_a_2', roomNumber: '201', unitType: 'office', baseRent: 145000, sizeSqft: 1500, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-201' }, createdAt: '2026-01-22T08:00:00Z' },
  { id: 'room_gt_a_202', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorId: 'flr_gt_a_2', roomNumber: '202', unitType: 'office', baseRent: 95000, sizeSqft: 1000, status: 'vacant', utilityMeters: { electricityMeterNo: 'E-GT-202' }, createdAt: '2026-01-22T08:00:00Z' },

  // Green Tower A - Floor 3
  { id: 'room_gt_a_301', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_a', floorId: 'flr_gt_a_3', roomNumber: '301', unitType: 'office', baseRent: 130000, sizeSqft: 1350, status: 'maintenance', utilityMeters: { electricityMeterNo: 'E-GT-301' }, createdAt: '2026-01-22T08:00:00Z' },

  // Green Tower B - Floor 4
  { id: 'room_gt_b_401', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorId: 'flr_gt_b_4', roomNumber: '4B', unitType: 'residential', baseRent: 28500, sizeSqft: 1400, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-401' }, createdAt: '2026-01-22T08:00:00Z' },
  { id: 'room_gt_b_402', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorId: 'flr_gt_b_4', roomNumber: '4C', unitType: 'residential', baseRent: 32000, sizeSqft: 1550, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-402' }, createdAt: '2026-01-22T08:00:00Z' },

  // Green Tower B - Floor 5
  { id: 'room_gt_b_501', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorId: 'flr_gt_b_5', roomNumber: '5A (Penthouse)', unitType: 'residential', baseRent: 65000, sizeSqft: 2200, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-GT-501' }, createdAt: '2026-01-22T08:00:00Z' },
  { id: 'room_gt_b_502', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', buildingId: 'bld_gt_b', floorId: 'flr_gt_b_5', roomNumber: '5B', unitType: 'residential', baseRent: 40000, sizeSqft: 1600, status: 'reserved', utilityMeters: { electricityMeterNo: 'E-GT-502' }, createdAt: '2026-01-22T08:00:00Z' },

  // Lake View - Floor 1 & 2 (Org 1)
  { id: 'room_lv_101', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorId: 'flr_lv_1', roomNumber: '1A', unitType: 'residential', baseRent: 26000, sizeSqft: 1100, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-LV-101' }, createdAt: '2026-02-05T08:00:00Z' },
  { id: 'room_lv_102', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorId: 'flr_lv_1', roomNumber: '1B', unitType: 'residential', baseRent: 25000, sizeSqft: 1050, status: 'vacant', utilityMeters: { electricityMeterNo: 'E-LV-102' }, createdAt: '2026-02-05T08:00:00Z' },
  { id: 'room_lv_201', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorId: 'flr_lv_2', roomNumber: '2A', unitType: 'residential', baseRent: 30000, sizeSqft: 1250, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-LV-201' }, createdAt: '2026-02-05T08:00:00Z' },
  { id: 'room_lv_202', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', buildingId: 'bld_lv_main', floorId: 'flr_lv_2', roomNumber: '2B', unitType: 'residential', baseRent: 29000, sizeSqft: 1200, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-LV-202' }, createdAt: '2026-02-05T08:00:00Z' },

  // Blue Residence - Floor 1 & 2 (Org 1)
  { id: 'room_br_101', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', buildingId: 'bld_br_main', floorId: 'flr_br_1', roomNumber: '101', unitType: 'residential', baseRent: 22000, sizeSqft: 950, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-BR-101' }, createdAt: '2026-02-20T08:00:00Z' },
  { id: 'room_br_102', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', buildingId: 'bld_br_main', floorId: 'flr_br_1', roomNumber: '102', unitType: 'residential', baseRent: 23000, sizeSqft: 980, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-BR-102' }, createdAt: '2026-02-20T08:00:00Z' },
  { id: 'room_br_201', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', buildingId: 'bld_br_main', floorId: 'flr_br_2', roomNumber: '201', unitType: 'residential', baseRent: 24000, sizeSqft: 1000, status: 'vacant', utilityMeters: { electricityMeterNo: 'E-BR-201' }, createdAt: '2026-02-20T08:00:00Z' },

  // Padma Heights (Org 2 - Bengal Asset Management)
  { id: 'room_ph_101', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', buildingId: 'bld_ph_main', floorId: 'flr_ph_1', roomNumber: 'G-1', unitType: 'commercial', baseRent: 95000, sizeSqft: 1100, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-PH-101' }, createdAt: '2026-02-06T08:00:00Z' },
  { id: 'room_ph_201', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', buildingId: 'bld_ph_main', floorId: 'flr_ph_2', roomNumber: '201', unitType: 'office', baseRent: 110000, sizeSqft: 1300, status: 'occupied', utilityMeters: { electricityMeterNo: 'E-PH-201' }, createdAt: '2026-02-06T08:00:00Z' },
]

export const SEED_TENANTS: Tenant[] = [
  // Org 1 Tenants
  { id: 'tnt_techcorp', organizationId: 'org_prime_holdings', legalName: 'TechCorp BD Ltd.', email: 'contact@techcorp.com.bd', phone: '+8801712999001', nidOrPassport: 'BIN-192837465', isCorporate: true, companyRegistration: 'C-998822', createdAt: '2026-01-25T10:00:00Z' },
  { id: 'tnt_gloria_jeans', organizationId: 'org_prime_holdings', legalName: 'Gloria Jeans Gulshan Franchise', email: 'accounts@gjgulshan.bd', phone: '+8801819283741', nidOrPassport: 'BIN-298374112', isCorporate: true, companyRegistration: 'C-774411', createdAt: '2026-01-25T11:00:00Z' },
  { id: 'tnt_apex_cloud', organizationId: 'org_prime_holdings', legalName: 'Apex Cloud Solutions', email: 'finance@apexcloud.io', phone: '+8801911928374', nidOrPassport: 'BIN-482910394', isCorporate: true, companyRegistration: 'C-442211', createdAt: '2026-01-26T09:00:00Z' },
  { id: 'tnt_nusrat', organizationId: 'org_prime_holdings', legalName: 'Nusrat Jahan', email: 'nusrat.jahan@email.com', phone: '+8801715888222', nidOrPassport: 'NID-1988273645192', isCorporate: false, createdAt: '2026-01-28T14:00:00Z' },
  { id: 'tnt_dr_rafiqul', organizationId: 'org_prime_holdings', legalName: 'Dr. Rafiqul Islam', email: 'dr.rafiqul@hospital.edu.bd', phone: '+8801718333444', nidOrPassport: 'NID-1975482910384', isCorporate: false, createdAt: '2026-01-29T10:00:00Z' },
  { id: 'tnt_mahbubur', organizationId: 'org_prime_holdings', legalName: 'Mahbubur Rahman', email: 'mahbub.ceo@group.com', phone: '+8801711223344', nidOrPassport: 'NID-1969482710394', isCorporate: false, createdAt: '2026-01-30T16:00:00Z' },
  { id: 'tnt_arif_hossain', organizationId: 'org_prime_holdings', legalName: 'Md. Arif Hossain', email: 'arif.hossain@bank.com.bd', phone: '+8801817555666', nidOrPassport: 'NID-1983948271029', isCorporate: false, createdAt: '2026-02-06T12:00:00Z' },
  { id: 'tnt_anisul', organizationId: 'org_prime_holdings', legalName: 'Anisul Haque', email: 'anisul.haque@consulting.com', phone: '+8801714777888', nidOrPassport: 'NID-1981293847561', isCorporate: false, createdAt: '2026-02-08T15:00:00Z' },
  { id: 'tnt_kamrul', organizationId: 'org_prime_holdings', legalName: 'Kamrul Hasan', email: 'kamrul.hasan@soft.com', phone: '+8801912666777', nidOrPassport: 'NID-1990482910283', isCorporate: false, createdAt: '2026-02-22T10:00:00Z' },
  { id: 'tnt_sabrina', organizationId: 'org_prime_holdings', legalName: 'Sabrina Chowdhury', email: 'sabrina.c@design.io', phone: '+8801719111222', nidOrPassport: 'NID-1992384710293', isCorporate: false, createdAt: '2026-02-23T11:00:00Z' },

  // Org 2 Tenants (Sarah's Organization)
  { id: 'tnt_kazi_media', organizationId: 'org_bengal_assets', legalName: 'Kazi Media Network', email: 'accounts@kazimedia.bd', phone: '+8801713000111', nidOrPassport: 'BIN-771122334', isCorporate: true, companyRegistration: 'C-112233', createdAt: '2026-02-07T10:00:00Z' },
  { id: 'tnt_dr_farhana', organizationId: 'org_bengal_assets', legalName: 'Dr. Farhana Yasmin', email: 'dr.farhana@clinic.bd', phone: '+8801814000222', nidOrPassport: 'NID-1984223344551', isCorporate: false, createdAt: '2026-02-08T11:00:00Z' },
]

export const SEED_LEASES: Lease[] = [
  // Org 1 Leases
  { id: 'lse_gt_101', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_a_101', tenantId: 'tnt_techcorp', startDate: '2026-02-01', endDate: '2028-01-31', rentAmount: 120000, securityDeposit: 360000, billingCycleDay: 1, status: 'active', createdAt: '2026-01-26T10:00:00Z' },
  { id: 'lse_gt_102', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_a_102', tenantId: 'tnt_gloria_jeans', startDate: '2026-02-01', endDate: '2029-01-31', rentAmount: 85000, securityDeposit: 255000, billingCycleDay: 1, status: 'active', createdAt: '2026-01-26T11:00:00Z' },
  { id: 'lse_gt_201', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_a_201', tenantId: 'tnt_apex_cloud', startDate: '2026-02-01', endDate: '2027-01-31', rentAmount: 145000, securityDeposit: 435000, billingCycleDay: 5, status: 'active', createdAt: '2026-01-27T09:00:00Z' },
  { id: 'lse_gt_401', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_b_401', tenantId: 'tnt_nusrat', startDate: '2026-02-01', endDate: '2027-01-31', rentAmount: 28500, securityDeposit: 57000, billingCycleDay: 1, status: 'active', createdAt: '2026-01-28T15:00:00Z' },
  { id: 'lse_gt_402', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_b_402', tenantId: 'tnt_dr_rafiqul', startDate: '2026-02-01', endDate: '2027-01-31', rentAmount: 32000, securityDeposit: 64000, billingCycleDay: 5, status: 'active', createdAt: '2026-01-29T11:00:00Z' },
  { id: 'lse_gt_501', organizationId: 'org_prime_holdings', propertyId: 'prop_green_tower', roomId: 'room_gt_b_501', tenantId: 'tnt_mahbubur', startDate: '2026-02-01', endDate: '2027-01-31', rentAmount: 65000, securityDeposit: 130000, billingCycleDay: 1, status: 'active', createdAt: '2026-01-30T17:00:00Z' },
  { id: 'lse_lv_101', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', roomId: 'room_lv_101', tenantId: 'tnt_arif_hossain', startDate: '2026-02-15', endDate: '2027-02-14', rentAmount: 26000, securityDeposit: 52000, billingCycleDay: 1, status: 'active', createdAt: '2026-02-06T14:00:00Z' },
  { id: 'lse_lv_202', organizationId: 'org_prime_holdings', propertyId: 'prop_lake_view', roomId: 'room_lv_202', tenantId: 'tnt_anisul', startDate: '2026-02-15', endDate: '2027-02-14', rentAmount: 29000, securityDeposit: 58000, billingCycleDay: 10, status: 'active', createdAt: '2026-02-08T16:00:00Z' },
  { id: 'lse_br_101', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', roomId: 'room_br_101', tenantId: 'tnt_kamrul', startDate: '2026-03-01', endDate: '2027-02-28', rentAmount: 22000, securityDeposit: 44000, billingCycleDay: 1, status: 'active', createdAt: '2026-02-22T11:00:00Z' },
  { id: 'lse_br_102', organizationId: 'org_prime_holdings', propertyId: 'prop_blue_residence', roomId: 'room_br_102', tenantId: 'tnt_sabrina', startDate: '2026-03-01', endDate: '2027-02-28', rentAmount: 23000, securityDeposit: 46000, billingCycleDay: 5, status: 'active', createdAt: '2026-02-23T12:00:00Z' },

  // Org 2 Leases (Sarah's Organization)
  { id: 'lse_ph_101', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', roomId: 'room_ph_101', tenantId: 'tnt_kazi_media', startDate: '2026-02-10', endDate: '2028-02-09', rentAmount: 95000, securityDeposit: 285000, billingCycleDay: 1, status: 'active', createdAt: '2026-02-07T12:00:00Z' },
  { id: 'lse_ph_201', organizationId: 'org_bengal_assets', propertyId: 'prop_padma_heights', roomId: 'room_ph_201', tenantId: 'tnt_dr_farhana', startDate: '2026-02-10', endDate: '2027-02-09', rentAmount: 110000, securityDeposit: 220000, billingCycleDay: 1, status: 'active', createdAt: '2026-02-08T14:00:00Z' },
]

// ==============================================================================
// REPOSITORY LAYER: MULTI-TENANT SAAS OPERATIONS
// ==============================================================================

export class RenvexaStore {
  private users = [...SEED_USERS]
  private orgs = [...SEED_ORGANIZATIONS]
  private orgMemberships = [...SEED_ORG_MEMBERSHIPS]
  private invitations = [...SEED_INVITATIONS]
  private properties = [...SEED_PROPERTIES]
  private propertyMemberships = [...SEED_PROPERTY_MEMBERSHIPS]
  private buildings = [...SEED_BUILDINGS]
  private floors = [...SEED_FLOORS]
  private rooms = [...SEED_ROOMS]
  private tenants = [...SEED_TENANTS]
  private leases = [...SEED_LEASES]

  // User Profile
  getUser(userId: string): User | undefined {
    return this.users.find((u) => u.id === userId)
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }

  // Get all Organizations a user belongs to
  getUserOrganizations(userId: string): { organization: Organization; membership: OrganizationMembership }[] {
    const memberships = this.orgMemberships.filter((m) => m.userId === userId && m.status === 'active')
    return memberships
      .map((m) => {
        const org = this.orgs.find((o) => o.id === m.organizationId)
        return org ? { organization: org, membership: m } : null
      })
      .filter((item): item is { organization: Organization; membership: OrganizationMembership } => item !== null)
  }

  // Get specific Organization by ID
  getOrganization(orgId: string): Organization | undefined {
    return this.orgs.find((o) => o.id === orgId)
  }

  // Get active membership in an organization
  getMembership(organizationId: string, userId: string): OrganizationMembership | undefined {
    return this.orgMemberships.find((m) => m.organizationId === organizationId && m.userId === userId && m.status === 'active')
  }

  // Create New SaaS Organization (Commercial SaaS Onboarding)
  createOrganization(ownerUserId: string, name: string, plan: 'starter' | 'growth' | 'enterprise' = 'starter'): Organization {
    const orgId = `org_${Date.now()}`
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const maxProperties = plan === 'starter' ? 2 : plan === 'growth' ? 10 : 100
    const maxUnits = plan === 'starter' ? 25 : plan === 'growth' ? 150 : 2000

    const newOrg: Organization = {
      id: orgId,
      name,
      slug,
      currency: 'BDT',
      createdByUserId: ownerUserId,
      subscription: {
        plan,
        status: 'active',
        maxProperties,
        maxUnits,
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
    }

    this.orgs.push(newOrg)

    // Add owner membership
    const ownerMembership: OrganizationMembership = {
      id: `om_${Date.now()}`,
      organizationId: orgId,
      userId: ownerUserId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date().toISOString(),
    }
    this.orgMemberships.push(ownerMembership)

    return newOrg
  }

  // List all members of an organization with user profile and assigned properties
  getOrganizationMembers(organizationId: string): OrganizationMemberDetail[] {
    const memberships = this.orgMemberships.filter((m) => m.organizationId === organizationId && m.status === 'active')

    return memberships.map((membership) => {
      const user = this.users.find((u) => u.id === membership.userId)!
      const propMemberships = this.propertyMemberships.filter(
        (pm) => pm.organizationId === organizationId && pm.userId === membership.userId,
      )

      return {
        membership,
        user,
        propertyMemberships: propMemberships,
      }
    })
  }

  // SaaS Member Invitation (Multi-user collaboration)
  inviteMember(
    organizationId: string,
    inviterUserId: string,
    email: string,
    role: OrganizationRole = 'property_manager',
    assignedPropertyIds: string[] = [],
  ): OrganizationInvitation {
    const invitationId = `inv_${Date.now()}`
    const newInvitation: OrganizationInvitation = {
      id: invitationId,
      organizationId,
      email,
      role,
      assignedPropertyIds,
      invitedByUserId: inviterUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    this.invitations.push(newInvitation)

    // If user already exists in platform, add membership directly
    let existingUser = this.getUserByEmail(email)
    if (!existingUser) {
      existingUser = {
        id: `user_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
      }
      this.users.push(existingUser)
    }

    const membership: OrganizationMembership = {
      id: `om_${Date.now()}`,
      organizationId,
      userId: existingUser.id,
      role,
      status: 'active',
      joinedAt: new Date().toISOString(),
    }
    this.orgMemberships.push(membership)

    // Assign property scopes if provided
    for (const propId of assignedPropertyIds) {
      this.propertyMemberships.push({
        id: `pm_${Date.now()}_${propId}`,
        organizationId,
        propertyId: propId,
        userId: existingUser.id,
        role: 'manager',
        assignedAt: new Date().toISOString(),
      })
    }

    return newInvitation
  }

  // Get Property Memberships for a user inside an organization
  getUserPropertyMemberships(organizationId: string, userId: string): PropertyMembership[] {
    return this.propertyMemberships.filter((pm) => pm.organizationId === organizationId && pm.userId === userId)
  }

  // List Properties with Tenant & Permission Isolation
  getProperties(organizationId: string, allowedPropertyIds?: string[]): Property[] {
    return this.properties.filter((p) => {
      if (p.organizationId !== organizationId) return false
      if (allowedPropertyIds && allowedPropertyIds.length > 0) {
        return allowedPropertyIds.includes(p.id)
      }
      return true
    })
  }

  // Get Single Property (strictly scoped to org)
  getProperty(organizationId: string, propertyId: string): Property | undefined {
    return this.properties.find((p) => p.organizationId === organizationId && p.id === propertyId)
  }

  // Create Property
  createProperty(
    organizationId: string,
    data: {
      name: string
      code: string
      propertyType: 'commercial_residential' | 'residential' | 'commercial' | 'industrial'
      address: string
      city: string
      timezone?: string
      totalBuildings?: number
    },
  ): Property {
    const id = `prop_${data.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`
    const newProperty: Property = {
      id,
      organizationId,
      name: data.name,
      code: data.code,
      propertyType: data.propertyType,
      address: data.address,
      city: data.city,
      timezone: data.timezone || 'Asia/Dhaka',
      totalBuildings: data.totalBuildings || 1,
      createdAt: new Date().toISOString(),
    }
    this.properties.push(newProperty)
    return newProperty
  }

  // Full nested Property Hierarchy (Property -> Buildings -> Floors -> Rooms with Leases and Tenants)
  getPropertyHierarchy(organizationId: string, propertyId: string): PropertyHierarchy | null {
    const property = this.getProperty(organizationId, propertyId)
    if (!property) return null

    const propertyBuildings = this.buildings.filter(
      (b) => b.organizationId === organizationId && b.propertyId === propertyId,
    )

    let totalUnits = 0
    let occupiedUnits = 0
    let vacantUnits = 0
    let maintenanceUnits = 0
    let totalMonthlyRevenue = 0

    const buildingsWithFloors = propertyBuildings.map((building) => {
      const buildingFloors = this.floors.filter(
        (f) => f.organizationId === organizationId && f.propertyId === propertyId && f.buildingId === building.id,
      )

      const floorsWithRooms = buildingFloors.map((floor) => {
        const floorRooms = this.rooms.filter(
          (r) => r.organizationId === organizationId && r.propertyId === propertyId && r.floorId === floor.id,
        )

        const roomsWithTenants: RoomWithTenant[] = floorRooms.map((room) => {
          totalUnits += 1
          if (room.status === 'occupied') {
            occupiedUnits += 1
          } else if (room.status === 'vacant') {
            vacantUnits += 1
          } else if (room.status === 'maintenance') {
            maintenanceUnits += 1
          }

          const activeLease = this.leases.find(
            (l) => l.organizationId === organizationId && l.roomId === room.id && l.status === 'active',
          )

          let tenant: Tenant | undefined
          if (activeLease) {
            totalMonthlyRevenue += activeLease.rentAmount
            tenant = this.tenants.find((t) => t.organizationId === organizationId && t.id === activeLease.tenantId)
          }

          return {
            ...room,
            activeLease,
            tenant,
          }
        })

        return {
          ...floor,
          rooms: roomsWithTenants,
        }
      })

      return {
        ...building,
        floors: floorsWithRooms,
      }
    })

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

    return {
      ...property,
      buildings: buildingsWithFloors,
      stats: {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        maintenanceUnits,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalMonthlyRevenue,
      },
    }
  }

  // Get Tenants scoped to organization
  getTenants(organizationId: string, propertyId?: string): (Tenant & { currentLeases: Lease[] })[] {
    const orgTenants = this.tenants.filter((t) => t.organizationId === organizationId)

    return orgTenants
      .map((tenant) => {
        let tenantLeases = this.leases.filter((l) => l.organizationId === organizationId && l.tenantId === tenant.id)
        if (propertyId) {
          tenantLeases = tenantLeases.filter((l) => l.propertyId === propertyId)
        }
        return {
          ...tenant,
          currentLeases: tenantLeases,
        }
      })
      .filter((t) => (propertyId ? t.currentLeases.length > 0 : true))
  }

  // Create Tenant
  createTenant(
    organizationId: string,
    data: {
      legalName: string
      phone: string
      email?: string
      nidOrPassport?: string
      isCorporate?: boolean
      companyRegistration?: string
      emergencyContact?: { name: string; relation: string; phone: string }
    },
  ): Tenant {
    const id = `tnt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
    const newTenant: Tenant = {
      id,
      organizationId,
      legalName: data.legalName,
      phone: data.phone,
      email: data.email || undefined,
      nidOrPassport: data.nidOrPassport,
      isCorporate: !!data.isCorporate,
      companyRegistration: data.companyRegistration,
      emergencyContact: data.emergencyContact,
      createdAt: new Date().toISOString(),
    }
    this.tenants.push(newTenant)
    return newTenant
  }

  // SaaS Resource Usage & Quota
  getOrganizationUsage(organizationId: string) {
    const org = this.getOrganization(organizationId)
    const orgProperties = this.properties.filter((p) => p.organizationId === organizationId)
    const orgRooms = this.rooms.filter((r) => r.organizationId === organizationId)

    return {
      organizationId,
      organizationName: org?.name ?? 'Unknown',
      plan: org?.subscription.plan ?? 'starter',
      status: org?.subscription.status ?? 'active',
      propertiesCount: orgProperties.length,
      maxProperties: org?.subscription.maxProperties ?? 5,
      unitsCount: orgRooms.length,
      maxUnits: org?.subscription.maxUnits ?? 25,
      isPropertiesLimitReached: orgProperties.length >= (org?.subscription.maxProperties ?? 5),
      isUnitsLimitReached: orgRooms.length >= (org?.subscription.maxUnits ?? 25),
    }
  }

  // Consolidated Portfolio Metrics across accessible properties
  getPortfolioMetrics(organizationId: string, allowedPropertyIds?: string[]) {
    const accessibleProperties = this.getProperties(organizationId, allowedPropertyIds)
    const propertyIds = new Set(accessibleProperties.map((p) => p.id))

    const orgRooms = this.rooms.filter((r) => r.organizationId === organizationId && propertyIds.has(r.propertyId))
    const orgLeases = this.leases.filter((l) => l.organizationId === organizationId && propertyIds.has(l.propertyId) && l.status === 'active')

    const totalUnits = orgRooms.length
    const occupiedUnits = orgRooms.filter((r) => r.status === 'occupied').length
    const vacantUnits = orgRooms.filter((r) => r.status === 'vacant').length
    const maintenanceUnits = orgRooms.filter((r) => r.status === 'maintenance').length
    const totalMonthlyRevenue = orgLeases.reduce((sum, l) => sum + l.rentAmount, 0)
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0

    return {
      totalProperties: accessibleProperties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      totalMonthlyRevenue,
      occupancyRate,
      collectedThisMonth: Math.round(totalMonthlyRevenue * 0.82),
      outstandingDues: Math.round(totalMonthlyRevenue * 0.18),
    }
  }
}

// Global singleton instance for server routes & application context
export const store = new RenvexaStore()
