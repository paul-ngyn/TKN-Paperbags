import { NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import nodemailer from "nodemailer";

export const runtime = "nodejs";


// Disabling the default Next.js body parsing so we can handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
      // Wrap formidable in a Promise so we can 'await' it in async style
  return new Promise((resolve) => {
    const form = formidable();

    form.parse(request as any, async (err, fields: Fields, files: Files) => {
      if (err) {
        return resolve(
          NextResponse.json({ message: "Error parsing form." }, { status: 500 })
        );
      }

      // 1. Parse form input:
      const firstName = fields.firstName || "";
      const lastName = fields.lastName || "";
      const email = fields.email || "";
      const phone = fields.phone || "";
      const dimensions = fields.dimensions || "";
      const handletype = fields.handletype || "";
      const details = fields.details || "";
      // (repeat for lastName, email, etc.)

      // 2. Check for file (PDF):
      let attachment = null;
      if (files.pdf) {
        const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
        if (pdfFile && pdfFile.filepath) {
          // Read file data
          const fileData = fs.readFileSync(pdfFile.filepath);
          attachment = {
            filename: pdfFile.originalFilename || "attachment.pdf",
            content: fileData,
          };
        }
      }
      // (read from files and assign to attachment as needed)

      // 3. Configure Nodemailer transporter with SMTP:
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",      // e.g. "smtp.gmail.com"
        port: 587,                  // or 465 if using SSL
        secure: true,              // use TLS if false, SSL if true
        auth: {
          user: "rchang510@gmail.com",  // e.g. "my_username@gmail.com"
          pass: "gcegkrwlqymgjowi",       // e.g. "my_password"
        },
      });

      // 4. Compose mail:
      const mailOptions = {
        from: "YOUR_EMAIL_ADDRESS",
        to: "DESTINATION_EMAIL@example.com",
        subject: "New Quote Request",
        text: `New quote request:
        First Name: ${firstName}
        Last Name: ${lastName}
        Email: ${email}
        Phone: ${phone}
        Dimensions: ${dimensions}
        Handle Type: ${handletype}
        Details: ${details}
        `,
        attachments: attachment ? [attachment] : [],
      };

      // 5. Send mail:
      try {
        await transporter.sendMail(mailOptions);
        return resolve(
          NextResponse.json({ message: "Quote emailed successfully." }, { status: 200 })
        );
      } catch (mailErr) {
        return resolve(
          NextResponse.json({ message: "Error sending email." }, { status: 500 })
        );
      }
    });
  });
}