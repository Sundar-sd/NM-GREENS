const GROUNDS = [
  {
    _id: "cricket",
    id: "cricket",
    name: "Cricket Ball Ground",
    type: "cricket",
    description: "Professional turf pitches with floodlights. Full-day booking only (12hrs or 24hrs).",
    capacity: 22,
    features: ["Natural Turf Wickets", "Floodlights Available", "Practice Nets", "Changing Rooms"],
    pricePerHour: 500,
    weekendPricePerHour: 0,
    nightPricePerHour: 0,
    nightPriceStart: "22:00",
    nightPriceEnd: "06:00",
    slotPricing: { "12_06": 0, "12_18": 0, "24": 0 },
    images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80"],
    isAvailable: true,
    maintenanceSlots: [],
    dateBasedPricing: [],
  },
  {
    _id: "tennis",
    id: "tennis",
    name: "Tennis Ball Ground",
    type: "tennis",
    description: "Ideal for tennis-ball cricket matches. Flexible hourly booking from 1 to 24 hours.",
    capacity: 22,
    features: ["Natural Grass Outfield", "Floodlights Available", "Equipment Rental", "Coaching Available"],
    pricePerHour: 300,
    weekendPricePerHour: 0,
    nightPricePerHour: 0,
    nightPriceStart: "22:00",
    nightPriceEnd: "06:00",
    slotPricing: {},
    images: ["https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80"],
    isAvailable: true,
    maintenanceSlots: [],
    dateBasedPricing: [],
  },
];

const BOOKING_STATS = {
  totalBookings: 5284,
  todayBookings: 12,
  totalRevenue: 2894500,
  activeUsers: 1842,
  availableSlots: 42,
  occupiedSlots: 6,
};

const REVENUE_DATA = {
  monthlyRevenue: [
    { _id: "2025-01", revenue: 185000, count: 45 },
    { _id: "2025-02", revenue: 210000, count: 52 },
    { _id: "2025-03", revenue: 245000, count: 58 },
    { _id: "2025-04", revenue: 198000, count: 48 },
    { _id: "2025-05", revenue: 268000, count: 63 },
    { _id: "2025-06", revenue: 312000, count: 71 },
  ],
  peakHours: [
    { _id: "18", count: 156 },
    { _id: "19", count: 142 },
    { _id: "17", count: 128 },
    { _id: "20", count: 112 },
    { _id: "16", count: 98 },
    { _id: "15", count: 76 },
    { _id: "10", count: 54 },
    { _id: "11", count: 48 },
  ],
  mostBooked: { _id: "Cricket Ball Ground", count: 342 },
  bookingTrends: [
    { _id: "2025-06-13", count: 8, revenue: 32000 },
    { _id: "2025-06-14", count: 12, revenue: 48000 },
    { _id: "2025-06-15", count: 6, revenue: 24000 },
    { _id: "2025-06-16", count: 10, revenue: 40000 },
    { _id: "2025-06-17", count: 14, revenue: 56000 },
    { _id: "2025-06-18", count: 9, revenue: 36000 },
    { _id: "2025-06-19", count: 11, revenue: 44000 },
    { _id: "2025-06-20", count: 7, revenue: 28000 },
    { _id: "2025-06-21", count: 13, revenue: 52000 },
    { _id: "2025-06-22", count: 5, revenue: 20000 },
    { _id: "2025-06-23", count: 15, revenue: 60000 },
    { _id: "2025-06-24", count: 8, revenue: 32000 },
    { _id: "2025-06-25", count: 10, revenue: 40000 },
    { _id: "2025-06-26", count: 12, revenue: 48000 },
    { _id: "2025-06-27", count: 6, revenue: 24000 },
    { _id: "2025-06-28", count: 11, revenue: 44000 },
    { _id: "2025-06-29", count: 9, revenue: 36000 },
    { _id: "2025-06-30", count: 7, revenue: 28000 },
    { _id: "2025-07-01", count: 13, revenue: 52000 },
    { _id: "2025-07-02", count: 10, revenue: 40000 },
  ],
};

const SAMPLE_BOOKINGS = [
  { _id: "bk1", name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@email.com", groundName: "Cricket Ball Ground", ground: "cricket", date: "2025-07-15", startTime: "10:00", endTime: "22:00", duration: 12, totalPrice: 6000, status: "approved", createdAt: "2025-07-10T08:30:00Z" },
  { _id: "bk2", name: "Priya Sharma", phone: "9876543211", email: "priya@email.com", groundName: "Tennis Ball Ground", ground: "tennis", date: "2025-07-16", startTime: "14:00", endTime: "17:00", duration: 3, totalPrice: 900, status: "pending", createdAt: "2025-07-11T10:15:00Z" },
  { _id: "bk3", name: "Arun Prasad", phone: "9876543212", email: "arun@email.com", groundName: "Cricket Ball Ground", ground: "cricket", date: "2025-07-14", startTime: "06:00", endTime: "18:00", duration: 12, totalPrice: 6000, status: "completed", createdAt: "2025-07-09T14:00:00Z" },
  { _id: "bk4", name: "Deepa Venkat", phone: "9876543213", email: "deepa@email.com", groundName: "Tennis Ball Ground", ground: "tennis", date: "2025-07-17", startTime: "16:00", endTime: "20:00", duration: 4, totalPrice: 1200, status: "approved", createdAt: "2025-07-12T09:45:00Z" },
  { _id: "bk5", name: "Suresh Reddy", phone: "9876543214", email: "suresh@email.com", groundName: "Cricket Ball Ground", ground: "cricket", date: "2025-07-13", startTime: "08:00", endTime: "20:00", duration: 12, totalPrice: 6000, status: "cancelled", createdAt: "2025-07-08T11:30:00Z" },
  { _id: "bk6", name: "Anita Gupta", phone: "9876543215", email: "anita@email.com", groundName: "Tennis Ball Ground", ground: "tennis", date: "2025-07-18", startTime: "09:00", endTime: "12:00", duration: 3, totalPrice: 900, status: "pending", createdAt: "2025-07-13T07:20:00Z" },
  { _id: "bk7", name: "Vikram Singh", phone: "9876543216", email: "vikram@email.com", groundName: "Cricket Ball Ground", ground: "cricket", date: "2025-07-19", startTime: "06:00", endTime: "06:00", duration: 24, totalPrice: 12000, status: "approved", createdAt: "2025-07-14T16:00:00Z" },
  { _id: "bk8", name: "Meera Joshi", phone: "9876543217", email: "meera@email.com", groundName: "Tennis Ball Ground", ground: "tennis", date: "2025-07-20", startTime: "17:00", endTime: "21:00", duration: 4, totalPrice: 1200, status: "rejected", createdAt: "2025-07-15T12:10:00Z" },
];

const SAMPLE_USERS = [
  { _id: "u1", name: "Admin User", email: "admin@email.com", phone: "9876543000", password: "admin123", role: "admin", status: "active", vaultBalance: 0, createdAt: "2025-01-01T00:00:00Z" },
  { _id: "u7", name: "Super Admin", email: "super@admin.com", phone: "9876543001", password: "super123", role: "admin", status: "active", vaultBalance: 0, createdAt: "2025-01-01T00:00:00Z" },
  { _id: "u2", name: "Rajesh Kumar", email: "rajesh@email.com", phone: "9876543210", password: "pass123", role: "customer", status: "active", vaultBalance: 0, createdAt: "2025-03-15T10:30:00Z" },
  { _id: "u3", name: "Priya Sharma", email: "priya@email.com", phone: "9876543211", password: "pass123", role: "customer", status: "active", vaultBalance: 0, createdAt: "2025-04-20T14:20:00Z" },
  { _id: "u4", name: "Arun Prasad", email: "arun@email.com", phone: "9876543212", password: "pass123", role: "customer", status: "active", vaultBalance: 0, createdAt: "2025-02-10T08:00:00Z" },
  { _id: "u5", name: "Deepa Venkat", email: "deepa@email.com", phone: "9876543213", password: "pass123", role: "customer", status: "active", vaultBalance: 0, createdAt: "2025-05-05T16:45:00Z" },
  { _id: "u6", name: "Suspended User", email: "suspended@email.com", phone: "9876543099", password: "pass123", role: "customer", status: "suspended", vaultBalance: 0, createdAt: "2025-01-20T09:00:00Z" },
];

const SLOT_RESTRICTIONS = [
  { _id: "sr1", ground: "cricket", groundName: "Cricket Ball Ground", date: "2025-07-20", startTime: "08:00", endTime: "12:00", reason: "Turf Maintenance", type: "maintenance" },
  { _id: "sr2", ground: "tennis", groundName: "Tennis Ball Ground", date: "2025-07-21", startTime: "06:00", endTime: "18:00", reason: "Corporate Event", type: "blocked" },
];

const NOTIFICATIONS = [
  { _id: "n1", name: "Priya Sharma", groundName: "Tennis Ball Ground", status: "pending", createdAt: "2025-07-13T07:20:00Z" },
  { _id: "n2", name: "Arun Prasad", groundName: "Cricket Ball Ground", status: "completed", createdAt: "2025-07-12T14:00:00Z" },
  { _id: "n3", name: "Deepa Venkat", groundName: "Tennis Ball Ground", status: "approved", createdAt: "2025-07-12T09:45:00Z" },
  { _id: "n4", name: "Rajesh Kumar", groundName: "Cricket Ball Ground", status: "cancelled", createdAt: "2025-07-10T15:30:00Z" },
];

export { GROUNDS, BOOKING_STATS, REVENUE_DATA, SAMPLE_BOOKINGS, SAMPLE_USERS, SLOT_RESTRICTIONS, NOTIFICATIONS };
