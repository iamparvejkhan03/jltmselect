import { Router } from 'express';
import {
    getAdminStats,
    getAllUsers,
    getUserDetails,
    updateUserStatus,
    deleteUser,
    updateUserType,
    getAllAuctions,
    getAuctionDetails,
    updateAuctionStatus,
    approveAuction,
    endAuction,
    deleteAuction,
    updateAuction,
    updatePaymentStatus,
    verifyUserIdentity,
    rejectUserIdentity,
    createCashier,
    getCashiers,
    getCashierById,
    updateCashier,
    updateCashierStatus,
    deleteCashier,
    createStaff,
    getStaffList,
    getStaffById,
    updateStaff,
    deleteStaff,
    updateStaffStatus
} from '../controllers/admin.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';
import { getAdminTransactions, getTransactionStats } from '../controllers/transaction.controller.js';
import { requirePermission } from '../middlewares/permission.middleware.js';
import { archiveAuction } from '../controllers/auction.controller.js';

const AdminRouter = Router();

// Dashboard - requires view_dashboard permission
AdminRouter.get('/stats', authAdmin, requirePermission("view_dashboard"), getAdminStats);

// User Management - requires manage_users permission
AdminRouter.get('/users', authAdmin, requirePermission("manage_users"), getAllUsers);
AdminRouter.get('/users/:userId', authAdmin, requirePermission("manage_users"), getUserDetails);
AdminRouter.patch('/users/:userId/status', authAdmin, requirePermission("manage_users"), updateUserStatus);
AdminRouter.patch('/users/:userId/type', authAdmin, requirePermission("manage_users"), updateUserType);
AdminRouter.delete('/users/:userId', authAdmin, requirePermission("manage_users"), deleteUser);
AdminRouter.patch('/users/:userId/identificationDocument/verify', authAdmin, requirePermission("manage_users"), verifyUserIdentity);
AdminRouter.patch('/users/:userId/identificationDocument/reject', authAdmin, requirePermission("manage_users"), rejectUserIdentity);

// Auction Management - requires manage_auctions permission
AdminRouter.get('/auctions', authAdmin, requirePermission("manage_auctions"), getAllAuctions);
AdminRouter.get('/auctions/:auctionId', authAdmin, requirePermission("manage_auctions"), getAuctionDetails);
AdminRouter.patch('/auctions/:auctionId/status', authAdmin, requirePermission("manage_auctions"), updateAuctionStatus);
AdminRouter.patch('/auctions/:auctionId/approve', authAdmin, requirePermission("manage_auctions"), approveAuction);
AdminRouter.patch('/auctions/:auctionId/end', authAdmin, requirePermission("manage_auctions"), endAuction);
AdminRouter.delete('/auctions/:auctionId', authAdmin, requirePermission("manage_auctions"), deleteAuction);
AdminRouter.patch('/auctions/:id/archive', authAdmin, archiveAuction);
AdminRouter.put('/auctions/:id', authAdmin, requirePermission("manage_auctions"), upload.fields([
    { name: 'photos' },
    { name: 'documents' },
    { name: 'serviceRecords' },
]), updateAuction);

// Transaction Management - requires manage_transactions permission
AdminRouter.get('/transactions', authAdmin, requirePermission("manage_transactions"), getAdminTransactions);
AdminRouter.get('/transactions/stats', authAdmin, requirePermission("manage_transactions"), getTransactionStats);
AdminRouter.put('/:id/payment-status',
    authAdmin,
    requirePermission("manage_transactions"),
    upload.single('invoice'),
    updatePaymentStatus
);

// Cashier Management - requires manage_cashiers permission
AdminRouter.post('/cashiers/create', authAdmin, requirePermission("manage_cashiers"), createCashier);
AdminRouter.get('/cashiers', authAdmin, requirePermission("manage_cashiers"), getCashiers);
AdminRouter.get('/cashiers/:id', authAdmin, requirePermission("manage_cashiers"), getCashierById);
AdminRouter.put('/cashiers/:id', authAdmin, requirePermission("manage_cashiers"), updateCashier);
AdminRouter.patch('/cashiers/:id/status', authAdmin, requirePermission("manage_cashiers"), updateCashierStatus);
AdminRouter.delete('/cashiers/:id', authAdmin, requirePermission("manage_cashiers"), deleteCashier);

// Staff Management Routes
AdminRouter.post(
    "/staff/create",
    authAdmin,
    requirePermission("manage_admins"),
    createStaff
);
AdminRouter.get(
    "/staff",
    authAdmin,
    requirePermission("manage_admins"),
    getStaffList
);
AdminRouter.get(
    "/staff/:id",
    authAdmin,
    requirePermission("manage_admins"),
    getStaffById
);
AdminRouter.put(
    "/staff/:id",
    authAdmin,
    requirePermission("manage_admins"),
    updateStaff
);
AdminRouter.delete(
    "/staff/:id",
    authAdmin,
    requirePermission("manage_admins"),
    deleteStaff
);
AdminRouter.patch(
    "/staff/:id/status",
    authAdmin,
    requirePermission("manage_admins"),
    updateStaffStatus
);
export default AdminRouter;