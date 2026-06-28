import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for matching items and sending emails
  app.post("/api/match", async (req, res) => {
    try {
      const { myItem, theirItem, myEmail, theirEmail } = req.body;

      if (!myItem || !theirItem || !myEmail || !theirEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // We'll use Ethereal Email for testing/mocking email delivery
      // Ethereal gives a realistic SMTP server without actually spamming real inboxes
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const messageHTML = `
        <h2>Match Found on Find-IT</h2>
        <p>Good news! A match has been found between a lost item and a found item.</p>
        <p><strong>Item 1:</strong> ${myItem.title} (${myItem.type})</p>
        <p><strong>Item 2:</strong> ${theirItem.title} (${theirItem.type})</p>
        <p>Please log in to the portal to view details and arrange for the safe return of the belongings.</p>
        <p>- Find-IT: Reuniting People with Their Belongings</p>
      `;

      // Send mail to both users
      const info = await transporter.sendMail({
        from: '"Find-IT System" <noreply@find-it.local>',
        to: `${myEmail}, ${theirEmail}`,
        subject: "Find-IT - Reuniting People with Their Belongings: Match Found!",
        html: messageHTML,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.json({ 
        success: true, 
        messageId: info.messageId, 
        previewUrl: nodemailer.getTestMessageUrl(info) 
      });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: "Failed to send emails" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
