
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

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

    const originalContent = await fs.promises.readFile(resumeFile.filepath, "utf-8");
    const optimizedContent = await optimizeResume(originalContent, jobDescription);

    // Extract skills from both job description and resume
    const jobSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(originalContent);
    
    // Calculate skill match percentage
    const skillMatchBefore = calculateSkillMatch(resumeSkills, jobSkills);
    const skillMatchAfter = calculateSkillMatch(extractSkills(optimizedContent), jobSkills);

    // Generate key changes based on actual differences
    const keyChanges = generateKeyChanges(originalContent, optimizedContent, jobDescription);

    return res.status(200).json({
      success: true,
      originalContent,
      optimizedContent,
      improvements: {
        skillsMatch: skillMatchAfter,
        atsCompatibility: calculateATSScore(optimizedContent),
        keywordOptimization: calculateKeywordScore(optimizedContent, jobDescription),
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
  // Extract technical skills, soft skills, and keywords
  const skillsRegex = /\b(javascript|python|react|node\.js|typescript|aws|api|sql|html|css|management|leadership|communication)\b/gi;
  const matches = text.match(skillsRegex) || [];
  return Array.from(new Set(matches.map(skill => skill.toLowerCase())));
}

function calculateSkillMatch(resumeSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 100;
  const matchingSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  return Math.round((matchingSkills.length / jobSkills.length) * 100);
}

function calculateATSScore(content: string): number {
  let score = 85; // Base score

  // Check for proper section headers
  if (content.match(/education|experience|skills/gi)) score += 5;
  
  // Check for proper formatting
  if (content.match(/^\s*•/gm)) score += 5;
  
  // Check for measurable achievements
  if (content.match(/increased|decreased|improved|reduced|achieved|delivered/gi)) score += 3;

  return Math.min(score, 100);
}

function calculateKeywordScore(content: string, jobDescription: string): number {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(content);
  
  const matchingKeywords = resumeKeywords.filter(keyword => 
    jobKeywords.includes(keyword)
  );

  return Math.round((matchingKeywords.length / jobKeywords.length) * 100);
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set(['and', 'the', 'or', 'in', 'at', 'on', 'to', 'for']);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return Array.from(new Set(words.filter(word => !commonWords.has(word))));
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

  // Check for improved formatting
  if (optimized.match(/^[A-Z][^.!?]*[.!?]$/gm)?.length || 0 > original.match(/^[A-Z][^.!?]*[.!?]$/gm)?.length || 0) {
    changes.push("Improved sentence structure and formatting");
  }

  return changes;
}

async function optimizeResume(originalContent: string, jobDescription: string): Promise<string> {
  // Here you would integrate with an AI service for actual optimization
  // For now, we'll do some basic enhancements
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

  return optimized;
}
