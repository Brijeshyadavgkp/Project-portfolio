require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static site (optional) - serves files from parent project root
const siteRoot = path.join(__dirname, '..');
app.use(express.static(siteRoot));

// Create transporter
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP credentials not set in environment. Mail will not be sent.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  // Optional: attach debug logger when in development
  if (process.env.NODE_ENV !== 'production') {
    transporter.logger = true;
  }

  return transporter;
}

// Health check for transporter
app.get('/api/health', async (req, res) => {
  const transporter = createTransporter();
  if (!transporter) {
    return res.status(500).json({ ok: false, error: 'SMTP credentials not configured (see .env)' });
  }

  try {
    await transporter.verify();
    return res.json({ ok: true, message: 'SMTP transporter is ready' });
  } catch (err) {
    console.error('SMTP verify failed:', err);
    return res.status(500).json({ ok: false, error: 'SMTP verify failed', details: err.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = createTransporter();
  if (!transporter) {
    return res.status(500).json({ error: 'Mail transporter not configured on server' });
  }

  const toEmail = process.env.TO_EMAIL || 'by14143@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `${name} <${fromEmail}>`,
    to: toEmail,
    subject: `[Portfolio Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><hr/><p>${message}</p>`,
  };

  try {
    // Verify transporter first to catch auth/connection errors early
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error('Transporter verification failed:', verifyErr);
      return res.status(500).json({ error: 'SMTP verification failed', details: verifyErr.message });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    // In development return the message to help debugging (do not expose in production)
    const resp = { error: 'Failed to send email' };
    if (process.env.NODE_ENV !== 'production' && err && err.message) resp.details = err.message;
    return res.status(500).json(resp);
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(siteRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Contact server running on port ${PORT}`);
});
