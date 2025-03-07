
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface OptimizationResponse {
  success: boolean;
  originalContent?: string;
  optimizedContent?: string;
  improvements?: {
    skillsMatch: number;
    atsCompatibility: number;
    keywordOptimization: number;
  };
  keyChanges?: string[];
  error?: string;
}

async function extractTextFromFile(file: formidable.File): Promise<string> {
  const fileType = file.originalFilename?.split('.').pop()?.toLowerCase();
  const buffer = await fs.promises.readFile(file.filepath);

  switch (fileType) {
    case 'pdf':
      const pdfData = await pdf(buffer);
      return pdfData.text;
    
    case 'docx':
      const docxResult = await mammoth.extractRawText({ buffer });
      return docxResult.value;
    
    case 'doc':
      // For .doc files, you might need a different library
      throw new Error("DOC format not supported yet");
    
    default:
      throw new Error("Unsupported file format");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OptimizationResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    const jobDescription = fields.jobDescription?.[0];
    const resumeFile = files.resume?.[0];

    if (!jobDescription || !resumeFile) {
      return res.status(400).json({
        success: false,
        error: "Both job description and resume file are required",
      });
    }

    // Extract text from the uploaded resume
    const originalContent = await extractTextFromFile(resumeFile);
    
    // Extract key information from the job description
    const jobSkills = extractSkills(jobDescription);
    const jobKeywords = extractKeywords(jobDescription);
    
    // Optimize the resume content
    const optimizedContent = await optimizeResume(originalContent, jobDescription);
    
    // Calculate improvements
    const beforeSkillMatch = calculateSkillMatch(extractSkills(originalContent), jobSkills);
    const afterSkillMatch = calculateSkillMatch(extractSkills(optimizedContent), jobSkills);
    
    const beforeKeywordMatch = calculateKeywordMatch(originalContent, jobKeywords);
    const afterKeywordMatch = calculateKeywordMatch(optimizedContent, jobKeywords);
    
    const beforeAtsScore = calculateATSScore(originalContent);
    const afterAtsScore = calculateATSScore(optimizedContent);

    // Generate detailed changes
    const keyChanges = generateKeyChanges(originalContent, optimizedContent, jobDescription);

    return res.status(200).json({
      success: true,
      originalContent,
      optimizedContent,
      improvements: {
        skillsMatch: afterSkillMatch,
        atsCompatibility: afterAtsScore,
        keywordOptimization: afterKeywordMatch,
      },
      keyChanges,
    });
  } catch (error) {
    console.error("Error optimizing resume:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to optimize resume",
    });
  }
}

function extractSkills(text: string): string[] {
  const skillsRegex = /\b(javascript|python|react|node\.js|typescript|aws|api|sql|html|css|management|leadership|communication)\b/gi;
  const matches = text.match(skillsRegex) || [];
  return Array.from(new Set(matches.map(skill => skill.toLowerCase())));
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set(['and', 'the', 'or', 'in', 'at', 'on', 'to', 'for']);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return Array.from(new Set(words.filter(word => !commonWords.has(word))));
}

function calculateSkillMatch(resumeSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 100;
  const matchingSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  return Math.round((matchingSkills.length / jobSkills.length) * 100);
}

function calculateKeywordMatch(content: string, keywords: string[]): number {
  const contentWords = new Set(content.toLowerCase().match(/\b\w+\b/g) || []);
  const matches = keywords.filter(keyword => contentWords.has(keyword));
  return Math.round((matches.length / keywords.length) * 100);
}

function calculateATSScore(content: string): number {
  let score = 85;

  // Check for proper section headers
  if (content.match(/education|experience|skills/gi)) score += 5;
  
  // Check for proper formatting
  if (content.match(/^\s*•/gm)) score += 5;
  
  // Check for measurable achievements
  if (content.match(/increased|decreased|improved|reduced|achieved|delivered/gi)) score += 3;

  return Math.min(score, 100);
}

function generateKeyChanges(original: string, optimized: string, jobDescription: string): string[] {
  const changes: string[] = [];
  
  // Compare skills before and after
  const originalSkills = extractSkills(original);
  const optimizedSkills = extractSkills(optimized);
  const newSkills = optimizedSkills.filter(skill => !originalSkills.includes(skill));
  
  if (newSkills.length > 0) {
    changes.push(`Added key skills: ${newSkills.join(", ")}`);
  }

  // Check for improved action verbs
  const actionVerbsRegex = /\b(led|developed|managed|created|implemented|designed|optimized|improved)\b/gi;
  const originalActionVerbs = original.match(actionVerbsRegex)?.length || 0;
  const optimizedActionVerbs = optimized.match(actionVerbsRegex)?.length || 0;
  
  if (optimizedActionVerbs > originalActionVerbs) {
    changes.push("Enhanced impact with stronger action verbs");
  }

  // Check for quantifiable achievements
  const metricsRegex = /\b\d+%|\$\d+|\d+ (users|customers|clients|projects)\b/gi;
  const originalMetrics = original.match(metricsRegex)?.length || 0;
  const optimizedMetrics = optimized.match(metricsRegex)?.length || 0;
  
  if (optimizedMetrics > originalMetrics) {
    changes.push("Added quantifiable achievements and metrics");
  }

  return changes;
}

async function optimizeResume(originalContent: string, jobDescription: string): Promise<string> {
  let optimized = originalContent;

  // Add missing skills from job description
  const jobSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(originalContent);
  const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));
  
  if (missingSkills.length > 0) {
    optimized += `\n\nAdditional Skills: ${missingSkills.join(", ")}`;
  }

  // Enhance action verbs
  optimized = optimized.replace(/worked on/gi, "developed");
  optimized = optimized.replace(/helped/gi, "collaborated");
  optimized = optimized.replace(/made/gi, "created");
  optimized = optimized.replace(/did/gi, "executed");
  optimized = optimized.replace(/was responsible for/gi, "led");

  return optimized;
}
