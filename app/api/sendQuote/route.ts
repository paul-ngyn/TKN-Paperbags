import { NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import nodemailer from "nodemailer";
import { Readable } from "stream";
import { IncomingMessage } from "http";

export const runtime = "nodejs";

// Disabling the default Next.js body parsing so we can handle it with formidable
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
    try {
        // Convert the request to a readable stream
        const buffer = await request.arrayBuffer();
        const stream = new Readable();
        stream._read = () => {}; // _read is required but you can noop it
        stream.push(Buffer.from(buffer));
        stream.push(null);
    
        // Convert headers to a plain object
        const headers: { [key: string]: string } = {};
        request.headers.forEach((value, name) => {
          headers[name] = value;
        });
    
        // Create a mock IncomingMessage from the buffer
        const req = stream as unknown as IncomingMessage;
        req.headers = {
          ...headers,
          'content-length': buffer.byteLength.toString(),
          'content-type': headers['content-type'] || '',
        };

    // Wrap formidable in a Promise so we can 'await' it in async style
    return new Promise((resolve) => {
      const form = formidable();

      form.parse(req, async (err: Error, fields: Fields, files: Files) => {
        if (err) {
          console.error("Error parsing form:", err);
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

        // 2. Check for file (PDF):
        let attachments = [];

        // Handle PDF design file
        if (files.pdf) {
          const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
          if (pdfFile && pdfFile.filepath) {
            // Read file data
            const fileData = fs.readFileSync(pdfFile.filepath);
            attachments.push({
              filename: pdfFile.originalFilename || "design.pdf",
              content: fileData,
            });
          }
        }

        // Handle blueprint file
        if (files.blueprint) {
          const blueprintFile = Array.isArray(files.blueprint) ? files.blueprint[0] : files.blueprint;
          if (blueprintFile && blueprintFile.filepath) {
            // Read file data
            const fileData = fs.readFileSync(blueprintFile.filepath);
            attachments.push({
              filename: blueprintFile.originalFilename || "blueprint.pdf",
              content: fileData,
            });
          }
        }

        // 3. Configure Nodemailer transporter with SMTP:
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // TLS = false, SSL = true
          requireTLS: true,
          auth: {
            user: process.env.SMTP_USER,  // e.g. "my_username@gmail.com"
            pass: process.env.SMTP_PASS,  // e.g. "my_password"
          },
        });

        // 4. Compose mail:
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: `${email}, ${process.env.SMTP_USER}`,
          subject: `New Quote Request from ${firstName} ${lastName}`,
          text: `New quote request:
          First Name: ${firstName}
          Last Name: ${lastName}
          Email: ${email}
          Phone: ${phone}
          Dimensions: ${dimensions}
          Handle Type: ${handletype}
          Details: ${details}
          `,
          attachments: attachments,
        };

        // 5. Send mail:
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending email:", err);
            return resolve(
              NextResponse.json({ message: "Error sending email." }, { status: 400 })
            );
          }

          console.log("Email sent successfully");
          console.log("Message ID:", info.messageId);
          console.log("Envelope:", info.envelope);
          console.log("Accepted:", info.accepted);
          console.log("Rejected:", info.rejected);
          console.log("Pending:", info.pending);
          console.log("Response:", info.response);

          return resolve(
            NextResponse.json({ message: "Quote emailed successfully." }, { status: 200 })
          );
        });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}