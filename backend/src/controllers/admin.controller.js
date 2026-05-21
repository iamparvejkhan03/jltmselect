import User from "../models/user.model.js";
import Auction from "../models/auction.model.js";
import Comment from "../models/comment.model.js";
import Watchlist from "../models/watchlist.model.js";
import agendaService from "../services/agendaService.js";
import axios from "axios";

import {
  deleteFromCloudinary,
  uploadDocumentToCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary.js";

import {
  auctionApprovedEmail,
  auctionListedEmail,
  paymentCompletedEmail,
  paymentCompletedSellerEmail,
  sendBulkAuctionNotifications,
} from "../utils/nodemailer.js";
import BidPayment from "../models/bidPayment.model.js";
import Payout from "../models/payout.model.js";
import UserSubscription from "../models/userSubscription.model.js";

export const getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ isActive: true });

    // Get user type breakdown
    const userTypeStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$userType", count: { $sum: 1 } } },
    ]);

    // Get total auctions count
    const totalAuctions = await Auction.countDocuments();

    // Get auction status breakdown
    const auctionStatusStats = await Auction.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get active auctions
    const activeAuctions = await Auction.countDocuments({
      status: "active",
      endDate: { $gt: new Date() },
    });

    // Calculate total revenue from sold auctions
    const revenueStats = await Auction.aggregate([
      { $match: { status: "sold" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" },
          highestSale: { $max: "$finalPrice" },
          averageSale: { $avg: "$finalPrice" },
          totalSold: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const highestSaleAmount = revenueStats[0]?.highestSale || 0;
    const averageSalePrice = revenueStats[0]?.averageSale || 0;
    const totalSoldAuctions = revenueStats[0]?.totalSold || 0;

    // Get total subscription revenue
    const subscriptionRevenue = await UserSubscription.aggregate([
      {
        $match: {
          paymentStatus: "succeeded",
          status: { $in: ["active", "expired", "cancelled"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amountPaid" },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: "$amountPaid" }
        }
      }
    ]);

    // Get highest sale auction details
    const highestSaleAuction = await Auction.findOne({ status: "sold" })
      .sort({ finalPrice: -1 })
      .populate("seller", "username firstName lastName")
      .populate("winner", "username firstName lastName")
      .select("title finalPrice seller winner createdAt");

    // Calculate success rate
    const completedAuctions = await Auction.countDocuments({
      status: { $in: ["sold", "ended", "reserve_not_met"] },
    });

    const soldAuctions = await Auction.countDocuments({ status: "sold" });
    const successRate =
      completedAuctions > 0
        ? Math.round((soldAuctions / completedAuctions) * 100)
        : 0;

    // Get pending moderation counts
    const pendingAuctions = await Auction.countDocuments({ status: "draft" });
    const pendingUserVerifications = await User.countDocuments({
      isVerified: false,
      isActive: true,
    });

    const pendingModeration = pendingAuctions;

    // Get recent user registrations (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenueStats = await Auction.aggregate([
  {
    $match: {
      status: "sold",
      endDate: {  // ← Use endDate
        $gte: today,
        $lt: tomorrow,
      },
    },
  },
  { $group: { _id: null, total: { $sum: "$finalPrice" } } },
]);

    const todayRevenue = todayRevenueStats[0]?.total || 0;

    // Get system metrics
    const totalComments = await Comment.countDocuments();
    // const totalWatchlists = await Watchlist.countDocuments();
    const watchlistItems = await Watchlist.aggregate([
      {
        $lookup: {
          from: "auctions",
          localField: "auction",
          foreignField: "_id",
          as: "auction",
        },
      },
      {
        $unwind: "$auction",
      },
      {
        $match: {
          "auction.status": "active",
        },
      },
      {
        $count: "count",
      },
    ]); 

    const totalWatchlists = watchlistItems[0]?.count || 0;

    // Get bidding activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBids = await Auction.aggregate([
      { $unwind: "$bids" },
      { $match: { "bids.timestamp": { $gte: yesterday } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const recentBidsCount = recentBids[0]?.count || 0;

    const highestBidStats = await Auction.aggregate([
      { $unwind: "$bids" },
      {
        $group: {
          _id: null,
          highestBidAmount: { $max: "$bids.amount" },
          averageBidAmount: { $avg: "$bids.amount" },
          totalBids: { $sum: 1 },
        },
      },
    ]);

    // Get top performing categories
    const categoryStats = await Auction.aggregate([
      { $match: { status: "sold" } },
      {
        $group: {
          _id: "$category",
          totalRevenue: { $sum: "$finalPrice" },
          auctionCount: { $sum: 1 },
          avgPrice: { $avg: "$finalPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get user engagement metrics
    const totalBids = await Auction.aggregate([
      { $group: { _id: null, totalBids: { $sum: "$bidCount" } } },
    ]);

    const totalBidsCount = totalBids[0]?.totalBids || 0;

    // Get total offers count
    const totalOffers = await Auction.aggregate([
      { $unwind: "$offers" },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const totalOffersCount = totalOffers[0]?.count || 0;

    // Get offers by status breakdown
    const offersByStatus = await Auction.aggregate([
      { $unwind: "$offers" },
      { $group: { _id: "$offers.status", count: { $sum: 1 } } },
    ]);

    // Get recent offers (last 24 hours)
    const recentOffers = await Auction.aggregate([
      { $unwind: "$offers" },
      { $match: { "offers.createdAt": { $gte: yesterday } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const recentOffersCount = recentOffers[0]?.count || 0;

    // Calculate total offer value and average offer
    const offerValueStats = await Auction.aggregate([
      { $unwind: "$offers" },
      {
        $match: {
          "offers.status": {
            $in: ["pending", "accepted", "rejected", "expired", "withdrawn"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOfferValue: { $sum: "$offers.amount" },
          avgOfferAmount: { $avg: "$offers.amount" },
          highestOffer: { $max: "$offers.amount" },
        },
      },
    ]);

    const totalOfferValue = offerValueStats[0]?.totalOfferValue || 0;
    const avgOfferAmount = offerValueStats[0]?.avgOfferAmount || 0;
    const highestOfferAmount = offerValueStats[0]?.highestOffer || 0;

    const stats = {
      // Basic counts
      totalUsers,
      totalAuctions,
      activeAuctions,
      totalSoldAuctions,

      // Subscription revenue
      subscriptionTotalRevenue: subscriptionRevenue[0]?.totalRevenue || 0,
      totalSubscriptionsPurchased: subscriptionRevenue[0]?.totalCount || 0,
      averageSubscriptionAmount: subscriptionRevenue[0]?.averageAmount || 0,

      // User statistics
      userTypeStats: userTypeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),

      // Auction statistics
      auctionStatusStats: auctionStatusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),

      // Financial metrics
      totalRevenue,
      todayRevenue,
      highestSaleAmount,
      averageSalePrice,
      highestSaleAuction: highestSaleAuction
        ? {
          title: highestSaleAuction.title,
          amount: highestSaleAuction.finalPrice,
          seller: highestSaleAuction.seller?.username || "Unknown",
          winner: highestSaleAuction.winner?.username || "Unknown",
          date: highestSaleAuction.createdAt,
        }
        : null,

      // Performance metrics
      successRate,
      pendingModeration,
      recentUsers,

      // Engagement metrics
      totalComments,
      totalWatchlists,
      totalBids: totalBidsCount,
      recentBids: recentBidsCount,
      highestBidAmount: highestBidStats[0]?.highestBidAmount || 0,
      averageBidAmount: highestBidStats[0]?.averageBidAmount || 0,

      // Engagement metrics section
      totalOffers: totalOffersCount,
      recentOffers: recentOffersCount,
      offersByStatus: offersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      pendingOffers: offersByStatus.pending || 0,
      totalOfferValue: totalOfferValue,
      averageOfferAmount: avgOfferAmount,
      highestOfferAmount: highestOfferAmount,

      // Category performance
      categoryStats,

      // System metrics (you can implement real ones based on your monitoring)
      avgResponseTime: 2.3,
      systemHealth: 99.8,

      // Additional insights
      newUsersThisWeek: recentUsers,
      auctionsEndingToday: await Auction.countDocuments({
        status: "active",
        endDate: {
          $gte: today,
          $lt: tomorrow,
        },
      }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching admin statistics",
    });
  }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", filter = "all" } = req.query;

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      userType: { $nin: ["cashier", "staff", "admin"] },
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { referredBy: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    // Add filter if not 'all'
    if (filter !== "all") {
      searchQuery.userType = filter;
    }

    // Get users with pagination
    const users = await User.find(searchQuery)
      .select(
        "-password -refreshToken -resetPasswordToken -emailVerificationToken",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$userType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert stats to object
    const stats = {
      total: totalUsers,
      admins: userStats.find((stat) => stat._id === "admin")?.count || 0,
      sellers: userStats.find((stat) => stat._id === "seller")?.count || 0,
      bidders: userStats.find((stat) => stat._id === "bidder")?.count || 0,
    };

    const userIds = users.map(user => user._id);
    const activeSubscriptions = await UserSubscription.aggregate([
      {
        $match: {
          user: { $in: userIds },
          status: "active",
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $sort: { expiresAt: 1 }
      },
      {
        $group: {
          _id: "$user",
          subscriptionTitle: { $first: "$title" },
          subscriptionExpiry: { $first: "$expiresAt" },
          isDiscountAvailed: { $first: "$isDiscountAvailed" }
        }
      }
    ]);

    // Create a map for quick lookup
    const subscriptionMap = {};
    activeSubscriptions.forEach(sub => {
      subscriptionMap[sub._id.toString()] = {
        title: sub.subscriptionTitle,
        expiry: sub.subscriptionExpiry,
        discountAvailed: sub.isDiscountAvailed || false
      };
    });

    // Add subscription info to each user
    const usersWithSubscription = users.map(user => ({
      ...user.toObject(),
      activeSubscription: subscriptionMap[user._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      data: {
        users: usersWithSubscription,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching users",
    });
  }
};

// Get user details with statistics
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -refreshToken -resetPasswordToken -emailVerificationToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const activeSubscription = await UserSubscription.findOne({
      user: userId,
      status: "active",
      expiresAt: { $gt: new Date() }
    }).sort({ expiresAt: 1 });

    let userStats = {};

    if (user.userType === "seller") {
      // Seller statistics
      const auctionStats = await Auction.aggregate([
        { $match: { seller: user._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$finalPrice" },
          },
        },
      ]);

      const activeAuctions =
        auctionStats.find((stat) => stat._id === "active")?.count || 0;
      const soldAuctions =
        auctionStats.find((stat) => stat._id === "sold")?.count || 0;
      const totalRevenue =
        auctionStats.find((stat) => stat._id === "sold")?.totalRevenue || 0;

      // Calculate rating (you might want to implement a proper rating system)
      const rating = 4.5 + Math.random() * 0.5; // Mock rating for now

      userStats = {
        totalSales: totalRevenue,
        activeListings: activeAuctions,
        totalAuctions: await Auction.countDocuments({ seller: user._id }),
        soldAuctions,
        rating: Math.round(rating * 10) / 10,
      };
    } else if (user.userType === "bidder") {
      // Bidder statistics
      const totalOffers = await Auction.aggregate([
        { $match: { "offers.buyer": user._id } },
        { $unwind: "$offers" },
        { $match: { "offers.buyer": user._id } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);

      const wonAuctions = await Auction.countDocuments({
        winner: user._id,
        status: "sold",
      });

      const totalAuctionOfferSent = await Auction.countDocuments({
        "offers.buyer": user._id,
      });

      const watchlistItems = await Watchlist.countDocuments({
        user: user._id,
      });

      const totalOffersCount = totalOffers[0]?.count || 0;
      const successRate =
        totalOffersCount > 0
          ? Math.round((wonAuctions / totalAuctionOfferSent) * 100)
          : 0;

      userStats = {
        totalOffers: totalOffersCount,
        auctionsWon: wonAuctions,
        watchlistItems,
        successRate,
      };
    } else if (user.userType === "admin") {
      userStats = {
        role: "Super Admin", // You might want to store this in user model
        lastLogin: user.updatedAt,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          stats: userStats,
          activeSubscription: activeSubscription ? {
            title: activeSubscription.title,
            expiry: activeSubscription.expiresAt,
            discountAvailed: activeSubscription.isDiscountAvailed || false
          } : null
        },
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user details",
    });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Check if user exists first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent modifying admin account status
    if (user.userType === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account status cannot be modified",
      });
    }

    // Prevent user from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating user status",
    });
  }
};

// Delete user and clean up related data
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Prevent deleting admin users (no one can delete admin)
    if (user.userType === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot be deleted",
      });
    }

    // 1. Cancel all auctions created by this user
    const userAuctions = await Auction.find({ seller: userId });

    for (const auction of userAuctions) {
      // Cancel the auction
      auction.status = "cancelled";

      // Cancel agenda jobs for this auction
      await agendaService.cancelAuctionJobs(auction._id);

      await auction.save();
    }

    // 2. Remove user's bids from all auctions and update current highest bidder
    const auctionsWithUserBids = await Auction.find({
      "bids.bidder": userId,
      status: "active", // Only update active auctions
    });

    for (const auction of auctionsWithUserBids) {
      // Remove all bids by this user
      auction.bids = auction.bids.filter(
        (bid) => bid.bidder.toString() !== userId.toString(),
      );

      // Update bid count
      auction.bidCount = auction.bids.length;

      // Find the new highest bidder
      if (auction.bids.length > 0) {
        // Sort bids by amount descending and get the highest
        const sortedBids = auction.bids.sort((a, b) => b.amount - a.amount);
        const highestBid = sortedBids[0];

        auction.currentBidder = highestBid.bidder;
        auction.currentPrice = highestBid.amount;
      } else {
        // No bids left, reset to start price
        auction.currentBidder = null;
        auction.currentPrice = auction.startPrice;
      }

      await auction.save();
    }

    // 3. Delete user's comments (soft delete by marking as deleted)
    await Comment.updateMany(
      { user: userId },
      {
        status: "deleted",
        deletedAt: new Date(),
        deletedBy: req.user._id,
        adminDeleteReason: "User account deleted by admin",
      },
    );

    // 4. Remove user's watchlist items
    await Watchlist.deleteMany({ user: userId });

    // 5. Finally delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message:
        "User deleted successfully. All related data has been cleaned up.",
      data: {
        cancelledAuctions: userAuctions.length,
        updatedAuctions: auctionsWithUserBids.length,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting user",
    });
  }
};

// Update user role/type
export const updateUserType = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body;

    // Validate user type
    if (!["admin", "seller", "bidder", "cashier", "staff"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    // Check if user exists first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent updating admin user type (admin accounts cannot be changed)
    if (user.userType === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin account type cannot be changed",
      });
    }

    // Update user type
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userType },
      { new: true, runValidators: true },
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: `User role updated to ${userType}`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user type error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating user type",
    });
  }
};

// Get all auctions for admin
export const getAllAuctions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", filter = "all" } = req.query;

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { sellerUsername: { $regex: search, $options: "i" } },
        // { category: { $regex: search, $options: "i" } },
        { categories: { $in: [new RegExp(search, "i")] } },
      ],
    };

    // Add status filter if not 'all'
    if (filter !== "all") {
      if (filter === "active") {
        searchQuery.status = "active";
        searchQuery.endDate = { $gt: new Date() };
      } else if (filter === "pending") {
        searchQuery.status = "draft";
      } else if (filter === "ended") {
        searchQuery.status = { $in: ["ended", "sold", "reserve_not_met"] };
      } else {
        searchQuery.status = filter;
      }
    }

    // Get auctions with pagination and populate seller info
    const auctions = await Auction.find(searchQuery)
      .populate("seller", "firstName lastName username phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalAuctions = await Auction.countDocuments(searchQuery);

    // Get auction statistics
    const auctionStats = await Auction.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [
            {
              $match: {
                status: "active",
                endDate: { $gt: new Date() },
              },
            },
            { $count: "count" },
          ],
          draft: [{ $match: { status: "draft" } }, { $count: "count" }],
          sold: [{ $match: { status: "sold" } }, { $count: "count" }],
          featured: [{ $match: { featured: true } }, { $count: "count" }],
        },
      },
    ]);

    const stats = {
      total: auctionStats[0]?.total[0]?.count || 0,
      active: auctionStats[0]?.active[0]?.count || 0,
      pending: auctionStats[0]?.draft[0]?.count || 0,
      sold: auctionStats[0]?.sold[0]?.count || 0,
      featured: auctionStats[0]?.featured[0]?.count || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        auctions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAuctions / limit),
          totalAuctions,
          hasNext: page * limit < totalAuctions,
          hasPrev: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Get all auctions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching auctions",
    });
  }
};

// Get auction details
export const getAuctionDetails = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId)
      .populate("seller", "firstName lastName username email phone")
      .populate("winner", "firstName lastName username")
      .populate("currentBidder", "firstName lastName username");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Convert to plain object
    const auctionObject = auction.toObject();

    // Convert auction-level specifications Map to plain object
    if (
      auctionObject.specifications &&
      auctionObject.specifications instanceof Map
    ) {
      auctionObject.specifications = Object.fromEntries(
        auctionObject.specifications,
      );
    } else if (
      auction.specifications &&
      auction.specifications instanceof Map
    ) {
      auctionObject.specifications = Object.fromEntries(auction.specifications);
    }

    // ========== FIX: Convert nested specifications in bundleItems ==========
    if (auctionObject.bundleItems && auctionObject.bundleItems.length > 0) {
      auctionObject.bundleItems = auctionObject.bundleItems.map((item) => {
        // Create a new item object
        const itemObject = { ...item };

        // Convert the item's specifications Map to plain object
        if (
          itemObject.specifications &&
          itemObject.specifications instanceof Map
        ) {
          itemObject.specifications = Object.fromEntries(
            itemObject.specifications,
          );
        } else if (item.specifications && item.specifications instanceof Map) {
          // Fallback: convert from the original
          itemObject.specifications = Object.fromEntries(item.specifications);
        }

        return itemObject;
      });
    }
    // ======================================================================

    // Calculate additional statistics
    const auctionStats = {
      totalBids: auction.bidCount,
      totalWatchers: auction.watchlistCount,
      totalViews: auction.views,
      timeRemaining: auction.timeRemaining,
      isReserveMet: auction.isReserveMet(),
    };

    res.status(200).json({
      success: true,
      data: {
        auction: {
          ...auctionObject,
          stats: auctionStats,
        },
      },
    });
  } catch (error) {
    console.error("Get auction details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching auction details",
    });
  }
};

// Update auction status
export const updateAuctionStatus = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { status, featured } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;

    const auction = await Auction.findByIdAndUpdate(auctionId, updateData, {
      new: true,
      runValidators: true,
    }).populate("seller", "firstName lastName username");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    let message = "Auction updated successfully";
    if (status) message = `Auction ${status} successfully`;
    if (featured !== undefined) {
      message = `Auction ${featured ? "featured" : "unfeatured"} successfully`;
    }

    res.status(200).json({
      success: true,
      message,
      data: { auction },
    });
  } catch (error) {
    console.error("Update auction status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating auction status",
    });
  }
};

// Approve auction (change from draft to active)
export const approveAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId).populate("seller");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft auctions can be approved",
      });
    }

    // Check if auction start date is in the future
    const now = new Date();
    if (auction.startDate > now) {
      auction.status = "approved";
      // Schedule activation for start date - keep as draft for now
      await agendaService.scheduleAuctionActivation(
        auction._id,
        auction.startDate,
      );
      await auctionApprovedEmail(auction.seller, auction);
    } else {
      // Activate immediately
      auction.status = "active";

      await auction.populate("seller", "email username firstName");

      await auctionListedEmail(auction, auction.seller);

      // If end date is in past, end the auction
      if (auction.endDate <= now) {
        await auction.endAuction();
      }
    }

    await auction.save();

    res.status(200).json({
      success: true,
      message: "Auction approved successfully",
      data: { auction },
    });

    // const bidders = await User.find({ userType: 'bidder' });
    const bidders = await User.find({
      _id: { $ne: auction?.seller?._id }, // Exclude auction owner
      userType: { $ne: "admin" }, // Exclude admin users
      isActive: true, // Only active users
    }).select("email username firstName preferences userType");

    await sendBulkAuctionNotifications(bidders, auction, auction.seller);
  } catch (error) {
    console.error("Approve auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while approving auction",
    });
  }
};

// Delete auction
export const deleteAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Prevent deletion of active auctions with bids
    if (auction.status === "active" && auction.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete active auction with bids. Please cancel it first.",
      });
    }

    await Auction.findByIdAndDelete(auctionId);

    res.status(200).json({
      success: true,
      message: "Auction deleted successfully",
    });
  } catch (error) {
    console.error("Delete auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting auction",
    });
  }
};

// End auction manually
export const endAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active auctions can be ended manually",
      });
    }

    await auction.endAuction();

    res.status(200).json({
      success: true,
      message: "Auction ended successfully",
      data: { auction },
    });
  } catch (error) {
    console.error("End auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while ending auction",
    });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // For FormData, we need to access fields from req.body directly
    const {
      title,
      subTitle,
      features,
      description,
      specifications,
      location,
      videoLink,
      startPrice,
      retailPrice,
      bidIncrement,
      auctionType,
      reservePrice,
      buyNowPrice,
      allowOffers,
      startDate,
      endDate,
      removedPhotos,
      removedDocuments,
      removedServiceRecords,
      photoOrder,
      serviceRecordOrder,
    } = req.body;

    // ========== CATEGORIES HANDLING - FIXED ==========
    let categoriesArray = [];
    if (req.body.categories) {
      try {
        // Try to parse it as JSON first (from frontend JSON.stringify)
        const parsed = JSON.parse(req.body.categories);
        if (Array.isArray(parsed)) {
          categoriesArray = parsed;
        } else {
          categoriesArray = [parsed];
        }
      } catch (e) {
        // If it's not JSON, handle as regular string or array
        if (Array.isArray(req.body.categories)) {
          categoriesArray = req.body.categories;
        } else if (typeof req.body.categories === "string") {
          // Check if it's a comma-separated string
          categoriesArray = req.body.categories.includes(",")
            ? req.body.categories
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
            : [req.body.categories];
        }
      }
    }

    // Validation - categories are required
    if (!categoriesArray || categoriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }
    // =================================================

    // Basic validation - check if fields exist in req.body
    if (!title || !description || !auctionType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        missing: {
          title: !title,
          description: !description,
          auctionType: !auctionType,
          startDate: !startDate,
          endDate: !endDate,
        },
      });
    }

    // Validate start price for all auction types
    if (!startPrice || parseFloat(startPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: "Start price is required and must be positive",
      });
    }

    // CHECK: If auction is sold, we'll reset everything
    const isSoldAuction =
      auction.status === "sold" || auction.status === "sold_buy_now";

    if (isSoldAuction) {
      const resetData = {
        // Reset all bidding/offers/winner data
        bids: [],
        offers: [],
        currentPrice: parseFloat(startPrice),
        currentBidder: null,
        winner: null,
        finalPrice: null,
        bidCount: 0,

        // Reset payment info
        paymentStatus: "pending",
        paymentMethod: null,
        paymentDate: null,
        transactionId: null,
        invoice: null,

        // Reset notifications
        notifications: {
          ending30min: false,
          ending2hour: false,
          ending24hour: false,
          ending30minSentAt: null,
          ending2hourSentAt: null,
          ending24hourSentAt: null,
          offerReceived: false,
          offerExpiring: false,
        },

        lastBidTime: null,

        // Reset views and watchlist if you want a fresh start
        views: 0,
        // watchlistCount: 0,

        // Reset commission
        commissionAmount: 0,
        commissionType: null,
        commissionValue: 0,
        bidPaymentRequired: true,

        // Set status based on new dates
        status: "draft", // Start as draft since it's being re-listed
      };

      // Apply reset data to auction object
      Object.assign(auction, resetData);
    }

    // Validate bid increment for standard and reserve auctions
    if (
      (auctionType === "standard" || auctionType === "reserve") &&
      (!bidIncrement || parseFloat(bidIncrement) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Bid increment is required for standard and reserve auctions",
      });
    }

    // Validate buy now price for buy_now auctions
    if (auctionType === "buy_now") {
      if (!buyNowPrice || parseFloat(buyNowPrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Buy Now price must be provided and greater than or equal to start price",
        });
      }
    }

    // Validate reserve price for reserve auctions
    if (auctionType === "reserve") {
      if (!reservePrice || parseFloat(reservePrice) < parseFloat(startPrice)) {
        return res.status(400).json({
          success: false,
          message:
            "Reserve price must be provided and greater than or equal to start price",
        });
      }
    }

    // Validate giveaway auctions
    if (auctionType === "giveaway") {
      // For giveaways, we don't need pricing fields
      // But we should ensure they're not being updated incorrectly
      if (buyNowPrice || reservePrice || bidIncrement) {
        console.log("Warning: Pricing fields ignored for giveaway auction");
      }
    }

    // Handle specifications
    let finalSpecifications = new Map();

    // Convert existing specifications to Map if they exist
    if (auction.specifications && auction.specifications instanceof Map) {
      auction.specifications.forEach((value, key) => {
        if (value !== null && value !== undefined && value !== "") {
          finalSpecifications.set(key, value);
        }
      });
    } else if (
      auction.specifications &&
      typeof auction.specifications === "object"
    ) {
      Object.entries(auction.specifications).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          finalSpecifications.set(key, value);
        }
      });
    }

    // Parse and merge new specifications
    if (specifications) {
      try {
        let newSpecs;
        if (typeof specifications === "string") {
          newSpecs = JSON.parse(specifications);
        } else {
          newSpecs = specifications;
        }

        if (typeof newSpecs === "object" && newSpecs !== null) {
          Object.entries(newSpecs).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              finalSpecifications.set(key, value.toString());
            } else {
              finalSpecifications.delete(key);
            }
          });
        }
      } catch (parseError) {
        console.error("Error parsing specifications:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
    }

    // Handle removed photos
    let finalPhotos = [...auction.photos];
    if (removedPhotos) {
      try {
        const removedPhotoIds =
          typeof removedPhotos === "string"
            ? JSON.parse(removedPhotos)
            : removedPhotos;

        if (Array.isArray(removedPhotoIds)) {
          // Remove photos from the array and delete from Cloudinary
          for (const photoId of removedPhotoIds) {
            const photoIndex = finalPhotos.findIndex(
              (photo) =>
                photo.publicId === photoId || photo._id?.toString() === photoId,
            );

            if (photoIndex > -1) {
              const removedPhoto = finalPhotos[photoIndex];
              // Delete from Cloudinary
              if (removedPhoto.publicId) {
                await deleteFromCloudinary(removedPhoto.publicId);
              }
              finalPhotos.splice(photoIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed photos:", error);
      }
    }

    // Handle removed documents
    let finalDocuments = [...auction.documents];
    if (removedDocuments) {
      try {
        const removedDocIds =
          typeof removedDocuments === "string"
            ? JSON.parse(removedDocuments)
            : removedDocuments;

        if (Array.isArray(removedDocIds)) {
          for (const docId of removedDocIds) {
            const docIndex = finalDocuments.findIndex(
              (doc) => doc.publicId === docId || doc._id?.toString() === docId,
            );

            if (docIndex > -1) {
              const removedDoc = finalDocuments[docIndex];
              // Delete from Cloudinary
              if (removedDoc.publicId) {
                await deleteFromCloudinary(removedDoc.publicId);
              }
              finalDocuments.splice(docIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed documents:", error);
      }
    }

    // ========== CAPTION HANDLING ==========

    // 1. Get photo captions from request body
    const photoCaptionsArray = [];
    if (req.body.photoCaptions) {
      if (Array.isArray(req.body.photoCaptions)) {
        photoCaptionsArray.push(...req.body.photoCaptions);
      } else if (typeof req.body.photoCaptions === "string") {
        photoCaptionsArray.push(req.body.photoCaptions);
      }
    }

    // 2. Get existing document captions from request body
    const existingDocumentCaptions = [];
    if (req.body.existingDocumentCaptions) {
      if (Array.isArray(req.body.existingDocumentCaptions)) {
        existingDocumentCaptions.push(...req.body.existingDocumentCaptions);
      } else if (typeof req.body.existingDocumentCaptions === "string") {
        existingDocumentCaptions.push(req.body.existingDocumentCaptions);
      }
    }

    // 3. Get new document captions from request body
    const newDocumentCaptions = [];
    if (req.body.newDocumentCaptions) {
      if (Array.isArray(req.body.newDocumentCaptions)) {
        newDocumentCaptions.push(...req.body.newDocumentCaptions);
      } else if (typeof req.body.newDocumentCaptions === "string") {
        newDocumentCaptions.push(req.body.newDocumentCaptions);
      }
    }

    // 4. Get service record captions from request body
    const serviceRecordCaptionsArray = [];
    if (req.body.serviceRecordCaptions) {
      if (Array.isArray(req.body.serviceRecordCaptions)) {
        serviceRecordCaptionsArray.push(...req.body.serviceRecordCaptions);
      } else if (typeof req.body.serviceRecordCaptions === "string") {
        serviceRecordCaptionsArray.push(req.body.serviceRecordCaptions);
      }
    }

    // ========== SERVICE RECORD UPDATES ==========

    // Initialize finalServiceRecords here
    let finalServiceRecords = [...(auction.serviceRecords || [])];

    // Handle removed service records
    if (removedServiceRecords) {
      try {
        const removedServiceRecordIds =
          typeof removedServiceRecords === "string"
            ? JSON.parse(removedServiceRecords)
            : removedServiceRecords;

        if (Array.isArray(removedServiceRecordIds)) {
          for (const recordId of removedServiceRecordIds) {
            const recordIndex = finalServiceRecords.findIndex(
              (record) =>
                record.publicId === recordId ||
                record._id?.toString() === recordId,
            );

            if (recordIndex > -1) {
              const removedRecord = finalServiceRecords[recordIndex];
              // Delete from Cloudinary
              if (removedRecord.publicId) {
                await deleteFromCloudinary(removedRecord.publicId);
              }
              finalServiceRecords.splice(recordIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error("Error processing removed service records:", error);
      }
    }

    // ========== PHOTO UPDATES ==========

    // Handle new photo uploads with captions
    const newPhotos = [];
    if (req.files && req.files.photos) {
      const photos = Array.isArray(req.files.photos)
        ? req.files.photos
        : [req.files.photos];

      for (const [index, photo] of photos.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            photo.buffer,
            "auction-photos",
          );
          newPhotos.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: photo.originalname,
            order: finalPhotos.length + newPhotos.length,
            caption: photoCaptionsArray[index] || "",
          });
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload photo: ${photo.originalname}`,
          });
        }
      }
    }

    // Handle photo ordering
    if (photoOrder) {
      try {
        const parsedPhotoOrder =
          typeof photoOrder === "string" ? JSON.parse(photoOrder) : photoOrder;

        if (Array.isArray(parsedPhotoOrder)) {
          // Create a map of existing photos by their ID for quick lookup
          const existingPhotosMap = new Map();
          finalPhotos.forEach((photo) => {
            const photoId = photo.publicId || photo._id?.toString();
            if (photoId) {
              existingPhotosMap.set(photoId, photo);
            }
          });

          // Track used new photos to prevent duplicates
          const usedNewPhotos = new Set();
          const reorderedPhotos = [];

          for (const orderItem of parsedPhotoOrder) {
            if (orderItem.isExisting) {
              // Find existing photo by ID
              const existingPhoto = existingPhotosMap.get(orderItem.id);
              if (existingPhoto) {
                reorderedPhotos.push(existingPhoto);
                // Remove from map to avoid duplicates
                existingPhotosMap.delete(orderItem.id);
              }
            } else {
              // For new photos, find by the temporary ID from frontend
              let foundNewPhoto = null;
              for (let i = 0; i < newPhotos.length; i++) {
                if (!usedNewPhotos.has(i)) {
                  foundNewPhoto = newPhotos[i];
                  usedNewPhotos.add(i);
                  break;
                }
              }

              if (foundNewPhoto) {
                reorderedPhotos.push(foundNewPhoto);
              }
            }
          }

          // Add any remaining existing photos that weren't in the photoOrder
          existingPhotosMap.forEach((photo) => reorderedPhotos.push(photo));

          // Add any remaining new photos that weren't used
          newPhotos.forEach((photo, index) => {
            if (!usedNewPhotos.has(index)) {
              reorderedPhotos.push(photo);
            }
          });

          finalPhotos = reorderedPhotos;
        }
      } catch (error) {
        console.error("Error processing photo order:", error);
        // Fallback: append new photos at the end
        finalPhotos = [...finalPhotos, ...newPhotos];
      }
    } else {
      // If no photoOrder is provided, just append new photos at the end
      finalPhotos = [...finalPhotos, ...newPhotos];
    }

    // Update captions for existing photos (if sent from frontend)
    const existingPhotoCaptions = req.body.existingPhotoCaptions || [];
    finalPhotos.forEach((photo, index) => {
      if (
        index < existingPhotoCaptions.length &&
        existingPhotoCaptions[index] !== undefined
      ) {
        photo.caption = existingPhotoCaptions[index] || "";
      }
    });

    // ========== DOCUMENT UPDATES ==========

    // Update captions for existing documents
    finalDocuments.forEach((doc, index) => {
      if (index < existingDocumentCaptions.length) {
        doc.caption = existingDocumentCaptions[index] || "";
      }
    });

    // Handle new document uploads
    if (req.files && req.files.documents) {
      const documents = Array.isArray(req.files.documents)
        ? req.files.documents
        : [req.files.documents];

      for (const [index, doc] of documents.entries()) {
        try {
          const result = await uploadDocumentToCloudinary(
            doc.buffer,
            doc.originalname,
            "auction-documents",
          );
          finalDocuments.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: doc.originalname,
            originalName: doc.originalname,
            resourceType: "raw",
            caption: newDocumentCaptions[index] || "",
          });
        } catch (uploadError) {
          console.error("Document upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload document: ${doc.originalname}`,
          });
        }
      }
    }

    // ========== SERVICE RECORD UPDATES CONTINUED ==========

    // Handle new service record uploads with captions
    const newServiceRecords = [];
    if (req.files && req.files.serviceRecords) {
      const serviceRecords = Array.isArray(req.files.serviceRecords)
        ? req.files.serviceRecords
        : [req.files.serviceRecords];

      for (const [index, record] of serviceRecords.entries()) {
        try {
          const result = await uploadImageToCloudinary(
            record.buffer,
            "auction-service-records",
          );
          newServiceRecords.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: record.originalname,
            originalName: record.originalname,
            order: finalServiceRecords.length + newServiceRecords.length,
            caption: serviceRecordCaptionsArray[index] || "",
          });
        } catch (uploadError) {
          console.error("Service record upload error:", uploadError);
          return res.status(400).json({
            success: false,
            message: `Failed to upload service record: ${record.originalname}`,
          });
        }
      }
    }

    // Handle service record ordering
    if (serviceRecordOrder) {
      try {
        const parsedServiceRecordOrder =
          typeof serviceRecordOrder === "string"
            ? JSON.parse(serviceRecordOrder)
            : serviceRecordOrder;

        if (Array.isArray(parsedServiceRecordOrder)) {
          // Create a map of existing service records by their ID for quick lookup
          const existingServiceRecordsMap = new Map();
          finalServiceRecords.forEach((record) => {
            const recordId = record.publicId || record._id?.toString();
            if (recordId) {
              existingServiceRecordsMap.set(recordId, record);
            }
          });

          // Track used new service records to prevent duplicates
          const usedNewServiceRecords = new Set();
          const reorderedServiceRecords = [];

          for (const orderItem of parsedServiceRecordOrder) {
            if (orderItem.isExisting) {
              // Find existing service record by ID
              const existingRecord = existingServiceRecordsMap.get(
                orderItem.id,
              );
              if (existingRecord) {
                reorderedServiceRecords.push(existingRecord);
                // Remove from map to avoid duplicates
                existingServiceRecordsMap.delete(orderItem.id);
              }
            } else {
              // For new service records, find by the temporary ID from frontend
              let foundNewRecord = null;
              for (let i = 0; i < newServiceRecords.length; i++) {
                if (!usedNewServiceRecords.has(i)) {
                  foundNewRecord = newServiceRecords[i];
                  usedNewServiceRecords.add(i);
                  break;
                }
              }

              if (foundNewRecord) {
                reorderedServiceRecords.push(foundNewRecord);
              }
            }
          }

          // Add any remaining existing service records that weren't in the order
          existingServiceRecordsMap.forEach((record) =>
            reorderedServiceRecords.push(record),
          );

          // Add any remaining new service records that weren't used
          newServiceRecords.forEach((record, index) => {
            if (!usedNewServiceRecords.has(index)) {
              reorderedServiceRecords.push(record);
            }
          });

          finalServiceRecords = reorderedServiceRecords;
        }
      } catch (error) {
        console.error("Error processing service record order:", error);
        // Fallback: append new service records at the end
        finalServiceRecords = [...finalServiceRecords, ...newServiceRecords];
      }
    } else {
      // If no serviceRecordOrder is provided, just append new service records at the end
      finalServiceRecords = [...finalServiceRecords, ...newServiceRecords];
    }

    // Update captions for existing service records
    const existingServiceRecordCaptions =
      req.body.existingServiceRecordCaptions || [];
    finalServiceRecords.forEach((record, index) => {
      if (
        index < existingServiceRecordCaptions.length &&
        existingServiceRecordCaptions[index] !== undefined
      ) {
        record.caption = existingServiceRecordCaptions[index] || "";
      }
    });

    // ========== DATE VALIDATION ==========

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // ========== STATUS DETERMINATION ==========

    // Determine status for always-available auctions (buy_now and giveaway)
    let newStatus;

    if (isSoldAuction) {
      // For sold auctions being reset, determine status based on new dates
      const originalStart = auction.startDate;
      const originalEnd = auction.endDate;
      const startChanged = start.getTime() !== originalStart.getTime();
      const endChanged = end.getTime() !== originalEnd.getTime();

      // If dates haven't changed, keep the original date logic but reset everything else
      if (!startChanged && !endChanged) {
        // Use the original date logic but with reset status
        if (originalStart > now) {
          newStatus = "draft"; // Future date, start as draft
        } else if (originalStart <= now && originalEnd > now) {
          newStatus = "active"; // Should be active now
        } else if (originalEnd <= now) {
          newStatus = "ended"; // Already ended
        }
      } else {
        // If dates have changed, use the new dates
        if (start > now) {
          newStatus = "draft"; // Future date, start as draft
        } else if (start <= now && end > now) {
          newStatus = "active"; // Should be active now
        } else if (end <= now) {
          newStatus = "ended"; // Already ended
        }
      }
    } else {
      // For non-sold auctions, determine status based on auction type and dates
      if (auctionType === "buy_now" || auctionType === "giveaway") {
        // Always-available auctions should be active if no winner
        newStatus = auction.winner ? auction.status : "active";
      } else {
        // Timed auctions (standard/reserve) - use date-based logic
        if (start > now && end > now) {
          // Dates are in future
          newStatus = "approved";
        } else if (end <= now) {
          // Auction has ended
          newStatus = "ended";
        } else if (start <= now && end > now) {
          // Auction should be active now
          newStatus = "active";
        } else {
          newStatus = auction.status; // Keep existing status as fallback
        }
      }
    }

    // ========== PREPARE UPDATE DATA ==========

    // Prepare update data
    const updateData = {
      title,
      subTitle: subTitle || "",
      categories: categoriesArray,
      features: features || "",
      description,
      specifications: finalSpecifications,
      location: location || "",
      videoLink: videoLink || "",
      startPrice: parseFloat(startPrice),
      currentPrice: newStatus === "approved" ?parseFloat(startPrice) : auction?.currentPrice, // Reset current price to start price on update
      retailPrice: retailPrice ? parseFloat(retailPrice) : undefined,
      auctionType,
      allowOffers: allowOffers === "true" || allowOffers === true,
      startDate: start,
      endDate: end,
      photos: finalPhotos,
      documents: finalDocuments,
      serviceRecords: finalServiceRecords,
      status: newStatus,
    };

    // Add bid increment only for standard and reserve auctions
    if (auctionType === "standard" || auctionType === "reserve") {
      updateData.bidIncrement = parseFloat(bidIncrement);
    } else {
      // Clear bid increment for other auction types
      updateData.bidIncrement = undefined;
    }

    // Add reserve price if applicable
    if (auctionType === "reserve") {
      updateData.reservePrice = parseFloat(reservePrice);
    } else {
      updateData.reservePrice = undefined;
    }

    // Add buy now price if applicable
    if (auctionType === "buy_now") {
      updateData.buyNowPrice = parseFloat(buyNowPrice);
    } else {
      updateData.buyNowPrice = undefined;
    }

    // Add reset fields for sold auctions
    if (isSoldAuction) {
      updateData.bids = [];
      updateData.offers = [];
      updateData.currentPrice = parseFloat(startPrice);
      updateData.currentBidder = null;
      updateData.winner = null;
      updateData.finalPrice = null;
      updateData.bidCount = 0;
      updateData.paymentStatus = "pending";
      updateData.paymentMethod = null;
      updateData.paymentDate = null;
      updateData.transactionId = null;
      updateData.invoice = null;
      updateData.notifications = {
        ending30min: false,
        ending2hour: false,
        ending24hour: false,
        ending30minSentAt: null,
        ending2hourSentAt: null,
        ending24hourSentAt: null,
        offerReceived: false,
        offerExpiring: false,
      };
      updateData.lastBidTime = null;
      updateData.commissionAmount = 0;
      updateData.bidPaymentRequired = true;
    }

    const updatedAuction = await Auction.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("seller", "username firstName lastName");

    // ========== RESCHEDULE JOBS ==========

    // Reschedule jobs if dates changed
    if (
      start.getTime() !== new Date(auction.startDate).getTime() ||
      end.getTime() !== new Date(auction.endDate).getTime()
    ) {
      await agendaService.cancelAuctionJobs(auction._id);

      // Only schedule jobs for timed auctions (standard/reserve)
      if (auctionType === "standard" || auctionType === "reserve") {
        // Schedule activation if start date is in future
        if (start > new Date()) {
          await agendaService.scheduleAuctionActivation(
            updatedAuction._id,
            start,
          );
        }

        // Always schedule end job for timed auctions
        await agendaService.scheduleAuctionEnd(updatedAuction._id, end);
      } else {
        // For buy_now and giveaway, no need to schedule jobs
        console.log(
          `🛒 ${auctionType} auction ${id} - no jobs scheduled (always available)`,
        );
      }
    }

    // Check if the auction is now active (and wasn't active before, or is a reset sold auction)
    const wasActiveBefore = auction.status === "active";
    const isNowActive = newStatus === "active";
    const isBuyNowOrGiveaway = auctionType === "buy_now" || auctionType === "giveaway";

    // Send notifications when:
    // 1. Auction becomes active (wasn't active before)
    // 2. OR it's a sold auction being reset and now active
    if (isNowActive && (!wasActiveBefore || isSoldAuction)) {
      try {
        // Get all potential bidders (excluding seller and admins)
        const bidders = await User.find({
          _id: { $ne: updatedAuction.seller._id },
          userType: "bidder",
          isActive: true,
        }).select("email username firstName phone preferences userType");

        // Fire and forget - don't await to avoid delaying response
        sendBulkAuctionNotifications(bidders, updatedAuction, updatedAuction.seller).catch(err => {
          console.error("Background notification error in updateAuction:", err);
        });

        console.log(`📢 Update: Bulk notifications triggered for auction ${updatedAuction._id} (status: active)`);
      } catch (notifError) {
        console.error("Failed to send bulk notifications from updateAuction:", notifError);
        // Don't throw - auction updated successfully
      }
    }

    res.status(200).json({
      success: true,
      message: isSoldAuction
        ? "Sold auction has been reset and updated successfully"
        : "Auction updated successfully",
      data: { auction: updatedAuction },
      reset: isSoldAuction,
    });
  } catch (error) {
    console.error("Update auction error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating auction",
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.user;
    const { paymentStatus, paymentMethod, transactionId, notes } = req.body;

    // Find auction with populated data
    const auction = await Auction.findById(id)
      .populate("seller", "email username firstName lastName")
      .populate("winner", "email username firstName lastName");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Validate auction is sold
    if (auction.status !== "sold" && auction.status !== "sold_buy_now") {
      return res.status(400).json({
        success: false,
        message: "Payment status can only be updated for sold auctions",
      });
    }

    // Validate payment status
    const validStatuses = [
      "pending",
      "processing",
      "completed",
      "failed",
      "refunded",
      "cancelled",
    ];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    // Handle invoice upload if provided
    let invoiceData = null;
    if (req.file) {
      const invoiceFile = req.file;
      try {
        const result = await uploadDocumentToCloudinary(
          invoiceFile.buffer,
          invoiceFile.originalname,
          "auction-invoices",
        );

        invoiceData = {
          url: result.secure_url,
          publicId: result.public_id,
          filename: invoiceFile.originalname,
          uploadedAt: new Date(),
          uploadedBy: admin._id,
        };
      } catch (uploadError) {
        console.error("Invoice upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload invoice file",
        });
      }
    }

    // Find existing bid payment record
    const bidPayment = await BidPayment.findOne({
      auction: id,
      bidder: auction.winner?._id,
    });

    // Update payment status and related fields
    auction.paymentStatus = paymentStatus;

    // Only update payment method if provided and status is not pending
    if (paymentMethod && paymentStatus !== "pending") {
      const validMethods = ["credit_card", "bank_transfer", "paypal", "other"];
      if (validMethods.includes(paymentMethod)) {
        auction.paymentMethod = paymentMethod;
      }
    }

    // Update transaction ID if provided
    if (transactionId && transactionId.trim() !== "") {
      auction.transactionId = transactionId.trim();
    }

    // Update BidPayment record based on payment status
    if (bidPayment) {
      // Map admin payment status to BidPayment status
      const statusMap = {
        pending: "pending",
        processing: "created",
        completed: "succeeded",
        failed: "processing_failed",
        refunded: "canceled",
        cancelled: "canceled",
      };

      bidPayment.status = statusMap[paymentStatus] || "created";

      // Add notes if provided
      if (notes) {
        bidPayment.adminNotes = notes;
      }

      // Add transaction ID if provided
      if (transactionId && transactionId.trim() !== "") {
        bidPayment.transactionId = transactionId.trim();
      }

      // If payment is completed, set additional fields
      if (paymentStatus === "completed") {
        bidPayment.chargeSucceeded = true;
        bidPayment.chargeAttempted = true;
        bidPayment.paidAt = new Date();
      }

      await bidPayment.save();
    } else {
      // If no bid payment exists, create one (for manual admin updates)
      const bidAmount = auction.finalPrice || auction.currentPrice;
      const commissionAmount = auction.commissionAmount || 0;
      const totalAmount = bidAmount + commissionAmount;

      await BidPayment.create({
        auction: id,
        bidder: auction.winner?._id,
        bidAmount,
        commissionAmount,
        totalAmount,
        paymentIntentId: transactionId || null,
        status: paymentStatus === "completed" ? "succeeded" : "pending",
        type: "checkout_payment",
        paymentMethod: paymentMethod || "bank_transfer",
        chargeSucceeded: paymentStatus === "completed",
        chargeAttempted: true,
        paidAt: paymentStatus === "completed" ? new Date() : null,
        adminNotes: notes || null,
      });
    }

    // When payment is marked as completed
    if (paymentStatus === "completed") {
      auction.paymentDate = new Date();
    }

    // Attach invoice if uploaded
    if (invoiceData) {
      auction.invoice = invoiceData;
    }

    await auction.save();

    // Populate updated auction
    const updatedAuction = await Auction.findById(id)
      .populate("seller", "username firstName lastName email phone address")
      .populate("winner", "username firstName lastName email phone address preferences");

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: {
        auction: updatedAuction,
        bidPayment: bidPayment,
      },
    });

    if (paymentStatus === "completed" && updatedAuction.winner && updatedAuction?.preferences?.emailUpdates) {
      // Send payment success email to winner
      paymentCompletedEmail(
        updatedAuction?.winner,
        updatedAuction,
        updatedAuction?.finalPrice,
      ).catch((error) =>
        console.error("Failed to send payment success email:", error),
      );

      // Send payment received email to seller
      paymentCompletedSellerEmail(
        updatedAuction?.seller,
        updatedAuction,
        updatedAuction?.winner,
      ).catch((error) =>
        console.error(
          "Failed to send seller payment notification email:",
          error,
        ),
      );
    }
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment status",
    });
  }
};

// Verify user identity
export const verifyUserIdentity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body; // Optional admin notes

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.identificationDocument) {
      return res.status(400).json({
        success: false,
        message: "User has not uploaded any identification document",
      });
    }

    // Update user verification status
    user.identificationStatus = "verified";
    user.identificationVerifiedAt = new Date();
    user.identificationRejectionReason = null;
    user.isVerified = true;

    await user.save();

    // Send email notification to user
    // try {
    //   await sendVerificationStatusEmail({
    //     email: user.email,
    //     name: `${user.firstName} ${user.lastName}`,
    //     status: "verified",
    //     userType: user.userType,
    //     notes,
    //   });
    // } catch (emailError) {
    //   console.error("Failed to send verification email:", emailError);
    //   // Don't fail the request if email fails
    // }

    res.status(200).json({
      success: true,
      message: "User identity verified successfully",
      data: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        identificationStatus: user.identificationStatus,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reject user identity verification
export const rejectUserIdentity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectionReason, allowReupload = true } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store old document info for potential cleanup
    const oldDocumentPublicId = user.identificationDocumentPublicId;

    // Update user verification status
    user.identificationStatus = "rejected";
    user.identificationRejectionReason = rejectionReason;

    // If user can reupload, keep the document for reference
    if (!allowReupload) {
      // Delete the document from Cloudinary
      if (oldDocumentPublicId) {
        try {
          await deleteFromCloudinary(oldDocumentPublicId, "raw");
        } catch (cloudinaryError) {
          console.error("Failed to delete rejected document:", cloudinaryError);
        }
      }

      // Clear document fields
      user.identificationDocument = null;
      user.identificationDocumentPublicId = null;
    }

    await user.save();

    // Send rejection email to user
    // try {
    //     await sendVerificationStatusEmail({
    //         email: user.email,
    //         name: `${user.firstName} ${user.lastName}`,
    //         status: 'rejected',
    //         userType: user.userType,
    //         rejectionReason,
    //         allowReupload
    //     });
    // } catch (emailError) {
    //     console.error('Failed to send rejection email:', emailError);
    // }

    res.status(200).json({
      success: true,
      message: "User identity verification rejected",
      data: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        identificationStatus: user.identificationStatus,
        rejectionReason: user.identificationRejectionReason,
        canReupload: allowReupload,
      },
    });
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Create a new cashier (Admin only)
 * @route   POST /api/v1/admin/cashiers/create
 * @access  Private (Admin)
 */
export const createCashier = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Generate username from email (before @)
    let username = normalizedEmail.split("@")[0];
    let usernameExists = await User.findOne({ username });
    if (usernameExists) {
      username = `${username}_${Date.now().toString().slice(-4)}`;
    }

    // Create cashier user
    const cashier = await User.create({
      firstName,
      lastName,
      username,
      email: normalizedEmail,
      // phone: phone || "",
      password,
      userType: "cashier",
      isVerified: true,
      isEmailVerified: true,
      isActive: true,
    });

    // Return safe user object (without password)
    const cashierObject = cashier.toObject();
    delete cashierObject.password;

    res.status(201).json({
      success: true,
      message: "Cashier created successfully",
      data: { cashier: cashierObject },
    });
  } catch (error) {
    console.error("Create cashier error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating cashier",
    });
  }
};

/**
 * @desc    Get all cashiers (Admin only)
 * @route   GET /api/v1/admin/cashiers
 * @access  Private (Admin)
 */
export const getCashiers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { userType: "cashier" };

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cashiers = await User.find(filter)
      .select("-password -refreshToken -resetPasswordToken")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        cashiers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCashiers: total,
          limit: parseInt(limit),
          hasNextPage: skip + cashiers.length < total,
          hasPrevPage: skip > 0,
        },
      },
    });
  } catch (error) {
    console.error("Get cashiers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching cashiers",
    });
  }
};

/**
 * @desc    Get single cashier by ID
 * @route   GET /api/v1/admin/cashiers/:id
 * @access  Private (Admin)
 */
export const getCashierById = async (req, res) => {
  try {
    const { id } = req.params;

    const cashier = await User.findOne({ _id: id, userType: "cashier" })
      .select("-password -refreshToken -resetPasswordToken");

    if (!cashier) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { cashier },
    });
  } catch (error) {
    console.error("Get cashier by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching cashier",
    });
  }
};

/**
 * @desc    Update cashier details
 * @route   PUT /api/v1/admin/cashiers/:id
 * @access  Private (Admin)
 */
export const updateCashier = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const cashier = await User.findOne({ _id: id, userType: "cashier" });

    if (!cashier) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found",
      });
    }

    // Check email uniqueness if changing
    if (email && email !== cashier.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
      cashier.email = email.toLowerCase().trim();
    }

    if (firstName) cashier.firstName = firstName;
    if (lastName) cashier.lastName = lastName;
    if (phone) cashier.phone = phone;

    await cashier.save();

    const cashierObject = cashier.toObject();
    delete cashierObject.password;

    res.status(200).json({
      success: true,
      message: "Cashier updated successfully",
      data: { cashier: cashierObject },
    });
  } catch (error) {
    console.error("Update cashier error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating cashier",
    });
  }
};

/**
 * @desc    Update cashier status (activate/deactivate)
 * @route   PATCH /api/v1/admin/cashiers/:id/status
 * @access  Private (Admin)
 */
export const updateCashierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const cashier = await User.findOne({ _id: id, userType: "cashier" });

    if (!cashier) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found",
      });
    }

    cashier.isActive = isActive;
    await cashier.save();

    res.status(200).json({
      success: true,
      message: `Cashier ${isActive ? "activated" : "deactivated"} successfully`,
      data: { cashier },
    });
  } catch (error) {
    console.error("Update cashier status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating cashier status",
    });
  }
};

/**
 * @desc    Delete cashier
 * @route   DELETE /api/v1/admin/cashiers/:id
 * @access  Private (Admin)
 */
export const deleteCashier = async (req, res) => {
  try {
    const { id } = req.params;

    const cashier = await User.findOne({ _id: id, userType: "cashier" });

    if (!cashier) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found",
      });
    }

    await cashier.deleteOne();

    res.status(200).json({
      success: true,
      message: "Cashier deleted successfully",
    });
  } catch (error) {
    console.error("Delete cashier error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting cashier",
    });
  }
};

/**
 * @desc    Create a new staff member (Admin only)
 * @route   POST /api/v1/admin/staff/create
 * @access  Private (Admin or user with manage_admins permission)
 */
export const createStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, permissions } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Generate username from email (before @)
    let username = normalizedEmail.split("@")[0];
    let usernameExists = await User.findOne({ username });
    if (usernameExists) {
      username = `${username}_${Date.now().toString().slice(-4)}`;
    }

    // Create staff user
    const staff = await User.create({
      firstName,
      lastName,
      username,
      email: normalizedEmail,
      // phone: phone && phone.trim() !== "" ? phone : null,
      password,
      userType: "staff",
      isVerified: true,
      isEmailVerified: true,
      isActive: true,
      permissions: permissions || [],
      createdBy: req.user._id,
    });

    // Return safe user object (without password)
    const staffObject = staff.toObject();
    delete staffObject.password;

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: { staff: staffObject },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating staff",
    });
  }
};

/**
 * @desc    Get all staff members
 * @route   GET /api/v1/admin/staff
 * @access  Private (Admin or user with manage_admins permission)
 */
export const getStaffList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { userType: "staff" };

    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const staff = await User.find(filter)
      .select("-password -refreshToken -resetPasswordToken")
      .populate("createdBy", "firstName lastName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalStaff: total,
          limit: parseInt(limit),
          hasNextPage: skip + staff.length < total,
          hasPrevPage: skip > 0,
        },
      },
    });
  } catch (error) {
    console.error("Get staff list error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching staff",
    });
  }
};

/**
 * @desc    Get single staff member by ID
 * @route   GET /api/v1/admin/staff/:id
 * @access  Private (Admin or user with manage_admins permission)
 */
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findOne({ _id: id, userType: "staff" })
      .select("-password -refreshToken -resetPasswordToken")
      .populate("createdBy", "firstName lastName email");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { staff },
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching staff",
    });
  }
};

/**
 * @desc    Update staff member
 * @route   PUT /api/v1/admin/staff/:id
 * @access  Private (Admin or user with manage_admins permission)
 */
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, permissions, isActive } = req.body;

    const staff = await User.findOne({ _id: id, userType: "staff" });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Check email uniqueness if changing
    if (email && email !== staff.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
      staff.email = email.toLowerCase().trim();
    }

    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    // if (phone !== undefined) staff.phone = phone || null;
    if (permissions) staff.permissions = permissions;
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();

    const staffObject = staff.toObject();
    delete staffObject.password;

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      data: { staff: staffObject },
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating staff",
    });
  }
};

/**
 * @desc    Delete staff member
 * @route   DELETE /api/v1/admin/staff/:id
 * @access  Private (Admin or user with manage_admins permission)
 */
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const staff = await User.findOne({ _id: id, userType: "staff" });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    await staff.deleteOne();

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting staff",
    });
  }
};

/**
 * @desc    Update staff status (activate/deactivate)
 * @route   PATCH /api/v1/admin/staff/:id/status
 * @access  Private (Admin or user with manage_admins permission)
 */
export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent self-deactivation
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const staff = await User.findOne({ _id: id, userType: "staff" });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    staff.isActive = isActive;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff member ${isActive ? "activated" : "deactivated"} successfully`,
      data: { staff: { _id: staff._id, isActive: staff.isActive } },
    });
  } catch (error) {
    console.error("Update staff status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating staff status",
    });
  }
};