import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";

// Disable default Next.js body parser to allow file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key. Check your .env file.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to parse form data asynchronously
const parseForm = async (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Function to extract text from a resume file
const extractTextFromFile = async (file: formidable.File): Promise<string> => {
  const filePath = file.filepath;
  try {
    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Error processing the resume file.");
  } finally {
    // Ensure temp file is deleted after processing
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temp file:", unlinkError);
    }
  }
};

// Function to optimize resume using OpenAI GPT-4 Turbo
const optimizeResumeWithAI = async (resumeText: string, jobDescription: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization assistant. Improve resumes to match job descriptions, ensuring strong ATS compatibility, optimized keywords, and skills alignment.",
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nOptimize this resume to better match the job description. Improve action verbs, keyword usage, and formatting for ATS compatibility.`,
        },
      ],
    });

    return response.choices[0]?.message?.content || "Resume optimization failed.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to optimize resume using AI.");
  }
};

// API Handler for Resume Optimization
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed. Use POST request." });
  }

  try {
    // Parse form data (resume file & job description)
    const { fields, files } = await parseForm(req);
    const jobDescription = fields.jobDescription?.[0];
    const resumeFile = files.resume?.[0];

    if (!jobDescription || !resumeFile) {
      return res.status(400).json({
        success: false,
        error: "Both job description and resume file are required.",
      });
    }

    // Extract resume text
    const originalResumeText = await extractTextFromFile(resumeFile);

    // Optimize resume with OpenAI
    const optimizedResumeText = await optimizeResumeWithAI(originalResumeText, jobDescription);

    // Send response
    res.json({
      success: true,
      originalContent: originalResumeText,
      optimizedContent: optimizedResumeText,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
