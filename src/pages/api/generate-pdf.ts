
import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

interface Improvement {
  type: string;
  before: number;
  after: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, improvements, keyChanges } = req.body;

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: "Helvetica", "Arial", sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            
            /* ATS-Friendly Headers */
            h1, h2, h3 {
              margin-bottom: 16px;
              page-break-after: avoid;
              color: #111;
            }
            
            h1 { 
              font-size: 24px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 8px;
            }
            
            h2 { 
              font-size: 20px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 4px;
            }
            
            /* Section Spacing */
            .section {
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            
            /* Job Titles */
            .job-title {
              font-weight: bold;
              font-size: 16px;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            /* Company Names */
            .company {
              font-weight: 500;
              color: #4b5563;
            }
            
            /* Dates */
            .date {
              color: #6b7280;
              font-size: 14px;
            }
            
            /* Bullet Points */
            .achievements {
              margin-top: 12px;
              padding-left: 0;
            }
            
            .achievement-item {
              margin-bottom: 8px;
              list-style-type: none;
              padding-left: 24px;
              position: relative;
            }
            
            .achievement-item:before {
              content: "•";
              position: absolute;
              left: 8px;
              color: #2563eb;
            }
            
            /* Skills Section */
            .skills-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-top: 12px;
            }
            
            .skill-category {
              font-weight: 500;
              color: #1f2937;
              margin-bottom: 4px;
            }
            
            /* Contact Info */
            .contact-info {
              margin-bottom: 24px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 16px;
              text-align: center;
            }
            
            /* Metrics and Improvements */
            .metrics {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
            }
            
            .metric-item {
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            
            .metric-label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .metric-value {
              color: #2563eb;
              font-weight: bold;
            }
            
            /* Page Breaks */
            @page {
              margin: 40px;
            }
            
            /* Print Optimization */
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="contact-info">
            <h1>Optimized Professional Resume</h1>
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="metrics">
            <h2>Performance Improvements</h2>
            ${(improvements as Improvement[]).map((imp: Improvement) => `
              <div class="metric-item">
                <span class="metric-label">${imp.type}:</span>
                <span class="metric-value">
                  ${imp.before}% → ${imp.after}%
                </span>
              </div>
            `).join("")}
          </div>
          
          <div class="section">
            <h2>Optimization Summary</h2>
            <ul class="achievements">
              ${(keyChanges as string[]).map((change: string) => `
                <li class="achievement-item">${change}</li>
              `).join("")}
            </ul>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 8px; text-align: center; width: 100%;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: true
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
