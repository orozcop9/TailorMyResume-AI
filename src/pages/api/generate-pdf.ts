
import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, improvements, keyChanges } = req.body;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
            }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 20px; margin-bottom: 15px; }
            .content { margin-bottom: 30px; }
            .improvements { margin-bottom: 30px; }
            .key-changes { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>Optimized Resume</h1>
          <div class="content">${content}</div>
          <h2>Improvements</h2>
          <div class="improvements">
            ${improvements.map(imp => `
              <div>
                <strong>${imp.type}:</strong>
                Before: ${imp.before}% → After: ${imp.after}%
              </div>
            `).join("")}
          </div>
          <h2>Key Changes</h2>
          <div class="key-changes">
            <ul>
              ${keyChanges.map(change => `<li>${change}</li>`).join("")}
            </ul>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=optimized-resume.pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
