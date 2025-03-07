
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

interface ResumeSection {
  type: "summary" | "experience" | "education" | "skills";
  content: string;
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
      throw new Error("DOC format not supported yet");
    
    default:
      throw new Error("Unsupported file format");
  }
}

function parseResumeContent(content: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = content.split('\n');
  let currentSection: ResumeSection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    if (trimmedLine.includes("summary") || trimmedLine.includes("objective")) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: "summary", content: "" };
    } else if (trimmedLine.includes("experience") || trimmedLine.includes("work history")) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: "experience", content: "" };
    } else if (trimmedLine.includes("education")) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: "education", content: "" };
    } else if (trimmedLine.includes("skills") || trimmedLine.includes("technologies")) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: "skills", content: "" };
    } else if (currentSection) {
      currentSection.content += line + "\n";
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

function optimizeSection(section: ResumeSection, jobDescription: string): string {
  let optimized = section.content;

  switch (section.type) {
    case "summary":
      optimized = optimizeSummary(optimized, jobDescription);
      break;
    case "experience":
      optimized = optimizeExperience(optimized);
      break;
    case "skills":
      optimized = optimizeSkills(optimized, jobDescription);
      break;
    case "education":
      optimized = optimizeEducation(optimized);
      break;
  }

  return optimized;
}

function optimizeSummary(content: string, jobDescription: string): string {
  let optimized = content;
  const jobKeywords = extractKeywords(jobDescription);
  const jobSkills = extractSkills(jobDescription);

  // Enhance professional title if found
  optimized = optimized.replace(
    /^([\w\s]+) with (\d+)/i,
    (_, title, years) => `Results-driven ${title} with ${years}+`
  );

  // Add relevant skills from job description
  const relevantSkills = jobSkills.slice(0, 3).join(", ");
  if (!optimized.includes(relevantSkills)) {
    optimized += ` Specialized in ${relevantSkills}.`;
  }

  return optimized;
}

function optimizeExperience(content: string): string {
  let optimized = content;

  // Enhance action verbs
  const actionVerbReplacements = {
    "worked on": "developed",
    "helped": "collaborated on",
    "made": "created",
    "did": "executed",
    "was responsible for": "led",
    "managed": "orchestrated",
    "built": "architected",
    "created": "designed and implemented",
  };

  Object.entries(actionVerbReplacements).forEach(([weak, strong]) => {
    optimized = optimized.replace(new RegExp(weak, "gi"), strong);
  });

  // Add metrics if not present
  if (!optimized.includes("%") && !optimized.includes("increased")) {
    optimized = optimized.replace(
      /(developed|created|implemented|designed) ([\w\s]+)/gi,
      (match, verb, project) => `${verb} ${project}, improving efficiency by 30%`
    );
  }

  return optimized;
}

function optimizeSkills(content: string, jobDescription: string): string {
  const jobSkills = extractSkills(jobDescription);
  const existingSkills = extractSkills(content);
  const missingSkills = jobSkills.filter(skill => !existingSkills.includes(skill));

  let optimized = content.trim();
  if (missingSkills.length > 0) {
    optimized += `\nAdditional relevant skills: ${missingSkills.join(", ")}`;
  }

  return optimized;
}

function optimizeEducation(content: string): string {
  return content.trim();
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

    const originalContent = await extractTextFromFile(resumeFile);
    const resumeSections = parseResumeContent(originalContent);
    
    let optimizedContent = "";
    for (const section of resumeSections) {
      optimizedContent += optimizeSection(section, jobDescription) + "\n\n";
    }
    
    const jobSkills = extractSkills(jobDescription);
    const jobKeywords = extractKeywords(jobDescription);
    
    const beforeSkillMatch = calculateSkillMatch(extractSkills(originalContent), jobSkills);
    const afterSkillMatch = calculateSkillMatch(extractSkills(optimizedContent), jobSkills);
    
    const beforeKeywordMatch = calculateKeywordMatch(originalContent, jobKeywords);
    const afterKeywordMatch = calculateKeywordMatch(optimizedContent, jobKeywords);
    
    const beforeAtsScore = calculateATSScore(originalContent);
    const afterAtsScore = calculateATSScore(optimizedContent);

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

  if (content.match(/education|experience|skills/gi)) score += 5;
  if (content.match(/^\s*•/gm)) score += 5;
  if (content.match(/increased|decreased|improved|reduced|achieved|delivered/gi)) score += 3;

  return Math.min(score, 100);
}

function generateKeyChanges(original: string, optimized: string, jobDescription: string): string[] {
  const changes: string[] = [];
  
  const originalSkills = extractSkills(original);
  const optimizedSkills = extractSkills(optimized);
  const newSkills = optimizedSkills.filter(skill => !originalSkills.includes(skill));
  
  if (newSkills.length > 0) {
    changes.push(`Added key skills: ${newSkills.join(", ")}`);
  }

  const actionVerbsRegex = /\b(led|developed|managed|created|implemented|designed|optimized|improved)\b/gi;
  const originalActionVerbs = original.match(actionVerbsRegex)?.length || 0;
  const optimizedActionVerbs = optimized.match(actionVerbsRegex)?.length || 0;
  
  if (optimizedActionVerbs > originalActionVerbs) {
    changes.push("Enhanced impact with stronger action verbs");
  }

  const metricsRegex = /\b\d+%|\$\d+|\d+ (users|customers|clients|projects)\b/gi;
  const originalMetrics = original.match(metricsRegex)?.length || 0;
  const optimizedMetrics = optimized.match(metricsRegex)?.length || 0;
  
  if (optimizedMetrics > originalMetrics) {
    changes.push("Added quantifiable achievements and metrics");
  }

  return changes;
}
