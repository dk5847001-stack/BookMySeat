import { dashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.userDashboard(req.user);
  res.status(200).json({ success: true, data });
});

export const adminDashboard = asyncHandler(async (_req, res) => {
  const data = await dashboardService.adminDashboard();
  res.status(200).json({ success: true, data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await dashboardService.updateProfile(req.user, req.body);
  res.status(200).json({ success: true, data });
});

export const exportBookingsCsv = asyncHandler(async (req, res) => {
  const csv = await dashboardService.exportBookingsCsv(req.user);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.csv"');
  res.send(csv);
});

export const exportRevenueCsv = asyncHandler(async (_req, res) => {
  const csv = await dashboardService.exportRevenueCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
  res.send(csv);
});
