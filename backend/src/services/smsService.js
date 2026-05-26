import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Keep existing OTP function
const sendOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `JLTM Select: Your verification code is ${otp}. Do not share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`✅ OTP sent to ${phone}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${phone}:`, error.message);
    throw error;
  }
};

// NEW: Send single auction notification SMS
const sendAuctionNotificationSMS = async (user, auction, frontendUrl) => {
  try {
    // Skip if user doesn't have phone number
    if (!user.phone) {
      console.log(`⚠️ No phone number for user ${user.email}, skipping SMS`);
      return { success: false, reason: "No phone number" };
    }

    // Skip if user has disabled SMS updates
    if (!user.preferences?.smsUpdates) {
      return { success: false, reason: "SMS notifications disabled" };
    }

    // Generate concise SMS content (targeting under 160 chars)
    const auctionUrl = `${frontendUrl}/auction/${auction._id}`;
    const title = auction.title.length > 30 
      ? auction.title.substring(0, 27) + "..." 
      : auction.title;
    
    // const smsBody = `${title} $${auction.startPrice}\nView details: ${auctionUrl}`;
    // const smsBody = `JLTM Select: New auction is live, starting at $${auction.startPrice}\nView details: ${auctionUrl}\nReply STOP to opt out.`;
    const smsBody = `JLTM Select: New auction is live, starting at $${auction.startPrice}\nView details: ${auctionUrl}`;
    
    // Check length (optional warning)
    if (smsBody.length > 160) {
      console.warn(`⚠️ SMS length (${smsBody.length} chars) exceeds 160 for auction ${auction._id}`);
    }

    // Send SMS via Twilio
    await client.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone
    });

    console.log(`✅ SMS sent to ${user.phone} for auction: ${auction.title}`);
    return { success: true, phone: user.phone };
    
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${user?.phone || 'unknown'}:`, error.message);
    return { success: false, error: error.message, phone: user?.phone };
  }
};

// NEW: Send bulk auction notifications with concurrency control
const sendBulkAuctionSMS = async (users, auction, frontendUrl, concurrencyLimit = 5) => {
  if (!users || users.length === 0) {
    return { total: 0, successful: 0, failed: 0 };
  }

  // Filter users who want SMS and have phone numbers
  const eligibleUsers = users.filter(user => 
    user.preferences?.smsUpdates === true && 
    user.phone && 
    user.phone.trim() !== ""
  );

  if (eligibleUsers.length === 0) {
    console.log("📱 No eligible users for SMS notifications");
    return { total: 0, successful: 0, failed: 0 };
  }

  console.log(`📱 Sending SMS to ${eligibleUsers.length} users (concurrency: ${concurrencyLimit})`);

  // Process in batches to respect concurrency limit
  const results = [];
  for (let i = 0; i < eligibleUsers.length; i += concurrencyLimit) {
    const batch = eligibleUsers.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map(user => 
      sendAuctionNotificationSMS(user, auction, frontendUrl)
    );
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to be gentle on Twilio (optional)
    if (i + concurrencyLimit < eligibleUsers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Count results
  const successful = results.filter(
    r => r.status === "fulfilled" && r.value?.success === true
  ).length;
  
  const failed = results.filter(
    r => r.status === "fulfilled" && r.value?.success === false
  ).length;
  
  const errors = results.filter(r => r.status === "rejected").length;

  console.log(`📱 SMS summary: ${successful} sent, ${failed} failed, ${errors} errors`);

  return {
    total: eligibleUsers.length,
    successful,
    failed,
    errors
  };
};

/**
 * Send SMS notification to auction winner
 * @param {Object} user - Winner user object
 * @param {Object} auction - Auction object
 * @returns {Promise<Object>} Result object
 */
const sendAuctionWonSMS = async (user, auction) => {
  try {
    // Skip if user doesn't have phone number
    if (!user.phone) {
      console.log(`⚠️ No phone number for winner ${user.email}, skipping SMS`);
      return { success: false, reason: "No phone number", email: user.email };
    }

    // Skip if user has disabled SMS updates
    if (!user.preferences?.smsUpdates) {
      console.log(`⚠️ SMS disabled for winner ${user.email}`);
      return { success: false, reason: "SMS notifications disabled", email: user.email };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://jltmselect.com';
    const auctionUrl = `${frontendUrl}/checkout/${auction._id}`;
    
    // Format winning amount
    const winningAmount = auction.finalPrice || auction.buyNowPrice || auction.currentPrice;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(winningAmount);
    
    // Generate SMS content (targeting under 160 chars)
    // const smsBody = `JLTM Select: You won an auction for ${formattedAmount}. Pay within 8 hours to secure your deal.\nPay here: ${auctionUrl}\nReply STOP to opt out.`;
    const smsBody = `JLTM Select: You won an auction for ${formattedAmount}. Pay within 8 hours to secure your deal.\nPay here: ${auctionUrl}\n If not paid, you may lose the deal and be subject to account suspension.`;
    
    // Check length (warning only)
    if (smsBody.length > 160) {
      console.warn(`⚠️ Auction won SMS length (${smsBody.length} chars) exceeds 160 for auction ${auction._id}`);
    }
    
    console.log(`📱 Sending auction won SMS to ${user.phone} for auction ${auction._id}`);
    
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone
    });
    
    console.log(`✅ Auction won SMS sent to ${user.phone} (SID: ${message.sid}) for auction: ${auction.title}`);
    return { success: true, phone: user.phone, sid: message.sid };
    
  } catch (error) {
    console.error(`❌ Failed to send auction won SMS to ${user?.phone || 'unknown'} (Winner: ${user?.email}):`, {
      errorCode: error.code,
      errorMessage: error.message,
      status: error.status
    });
    return { success: false, error: error.message, phone: user?.phone, email: user?.email };
  }
};

export default sendOTP;
export { sendAuctionNotificationSMS, sendBulkAuctionSMS, sendAuctionWonSMS };