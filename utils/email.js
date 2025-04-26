const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const templates = {
    loanSubmitted: (user, loan) => ({
        subject: 'Loan Application Submitted - Home Funders',
        html: `
            <h2>Dear ${user.name},</h2>
            <p>Your loan application has been successfully submitted.</p>
            <p><strong>Loan Details:</strong></p>
            <ul>
                <li>Loan Type: ${loan.loanType}</li>
                <li>Amount: ₹${loan.amount.toLocaleString()}</li>
                <li>Status: Pending</li>
            </ul>
            <p>We will review your application and get back to you soon.</p>
            <p>Best regards,<br>Home Funders Team</p>
        `
    }),
    loanApproved: (user, loan) => ({
        subject: 'Loan Application Approved - Home Funders',
        html: `
            <h2>Congratulations ${user.name}!</h2>
            <p>Your loan application has been approved.</p>
            <p><strong>Loan Details:</strong></p>
            <ul>
                <li>Loan Type: ${loan.loanType}</li>
                <li>Amount: ₹${loan.amount.toLocaleString()}</li>
                <li>Status: Approved</li>
            </ul>
            <p>Please check your dashboard for next steps.</p>
            <p>Best regards,<br>Home Funders Team</p>
        `
    }),
    loanRejected: (user, loan, reason) => ({
        subject: 'Loan Application Update - Home Funders',
        html: `
            <h2>Dear ${user.name},</h2>
            <p>We regret to inform you that your loan application has been rejected.</p>
            <p><strong>Loan Details:</strong></p>
            <ul>
                <li>Loan Type: ${loan.loanType}</li>
                <li>Amount: ₹${loan.amount.toLocaleString()}</li>
                <li>Status: Rejected</li>
                <li>Reason: ${reason}</li>
            </ul>
            <p>You can reapply with updated information.</p>
            <p>Best regards,<br>Home Funders Team</p>
        `
    })
};

// Send email function
const sendEmail = async (to, template, data) => {
    try {
        const { subject, html } = templates[template](...data);
        
        const mailOptions = {
            from: `"Home Funders" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail; 