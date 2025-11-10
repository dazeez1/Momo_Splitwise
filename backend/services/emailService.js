const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
});

// Test email connection outside of automated test runs.
if (
  process.env.NODE_ENV !== "test" &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter.verify((error) => {
    if (error) {
      console.log("❌ Email service not configured:", error.message);
      console.log("📧 Email notifications will be disabled");
    } else {
      console.log("✅ Email service ready");
    }
  });
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Skip if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured, skipping email to:", to);
    return { success: false, message: "Email service not configured" };
  }

  try {
    const mailOptions = {
      from: `"Momo Splitwise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Momo Splitwise!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308;">Welcome to Momo Splitwise!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining Momo Splitwise! Now you can easily split expenses with friends and settle up using mobile money.</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your first group</li>
        <li>Adding expenses</li>
        <li>Inviting friends</li>
      </ul>
      <p>If you have any questions, feel free to reach out!</p>
      <p>Best regards,<br>The Momo Splitwise Team</p>
    </div>
  `;
  const text = `Welcome to Momo Splitwise!\n\nHi ${user.name},\n\nThank you for joining! Get started by creating your first group.\n\nBest regards,\nThe Momo Splitwise Team`;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send group invitation email
 */
const sendGroupInvitationEmail = async (invitation, group, inviter) => {
  const subject = `You've been invited to join ${group.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308;">Group Invitation</h2>
      <p>Hi there,</p>
      <p>${inviter.name} invited you to join the group "${
    group.name
  }" on Momo Splitwise.</p>
      ${
        group.description
          ? `<p><strong>Description:</strong> ${group.description}</p>`
          : ""
      }
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard" 
           style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Invitation
        </a>
      </p>
      <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
  `;
  const text = `Group Invitation\n\n${inviter.name} invited you to join "${
    group.name
  }" on Momo Splitwise.\n\nVisit ${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/dashboard to view the invitation.`;

  return await sendEmail({
    to: invitation.email,
    subject,
    text,
    html,
  });
};

/**
 * Send expense notification email
 */
const sendExpenseAddedEmail = async (user, expense, payer, group) => {
  const subject = `New expense added: ${expense.description}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308;">New Expense</h2>
      <p>Hi ${user.name},</p>
      <p>${payer.name} added a new expense in ${group.name}:</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>${expense.description}</strong></p>
        <p>Amount: ${expense.amount} ${expense.currency}</p>
        <p>Category: ${expense.category}</p>
      </div>
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/groups/${group._id}" 
           style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Details
        </a>
      </p>
    </div>
  `;
  const text = `New Expense\n\n${payer.name} added "${expense.description}" (${expense.amount} ${expense.currency}) in ${group.name}.\n\nVisit the group to view details.`;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send payment request email
 */
const sendPaymentRequestEmail = async (recipient, payment, payer, group) => {
  const subject = `Payment request from ${payer.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #eab308;">Payment Request</h2>
      <p>Hi ${recipient.name},</p>
      <p>${payer.name} sent you a payment request:</p>
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
        ${
          payment.description
            ? `<p><strong>Description:</strong> ${payment.description}</p>`
            : ""
        }
        ${group ? `<p><strong>Group:</strong> ${group.name}</p>` : ""}
      </div>
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/payments" 
           style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Payment
        </a>
      </p>
    </div>
  `;
  const text = `Payment Request\n\n${payer.name} sent you a payment request of ${payment.amount} ${payment.currency}.\n\nVisit your payments to view details.`;

  return await sendEmail({
    to: recipient.email,
    subject,
    text,
    html,
  });
};

/**
 * Send payment completed email
 */
const sendPaymentCompletedEmail = async (user, payment, otherUser, group) => {
  const subject = `Payment marked as completed`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">✓ Payment Completed</h2>
      <p>Hi ${user.name},</p>
      <p>A payment has been marked as completed:</p>
      <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>${otherUser.name} - ${payment.amount} ${
    payment.currency
  }</strong></p>
        ${payment.description ? `<p>${payment.description}</p>` : ""}
        ${group ? `<p>Group: ${group.name}</p>` : ""}
      </div>
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/dashboard/payments" 
           style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Transaction
        </a>
      </p>
    </div>
  `;
  const text = `Payment Completed\n\nA payment with ${otherUser.name} (${payment.amount} ${payment.currency}) has been marked as completed.`;

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendGroupInvitationEmail,
  sendExpenseAddedEmail,
  sendPaymentRequestEmail,
  sendPaymentCompletedEmail,
};
