
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
  title: string;
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

function findSectionBoundaries(content: string): { start: number; end: number; type: string; title: string }[] {
  const sectionHeaders = [
    { type: "summary", patterns: ["summary", "objective", "professional summary", "career objective"] },
    { type: "experience", patterns: ["experience", "work history", "work experience", "professional experience", "employment"] },
    { type: "education", patterns: ["education", "academic background", "academic qualifications"] },
    { type: "skills", patterns: ["skills", "technical skills", "core competencies", "expertise", "technologies"] }
  ];

  const sections: { start: number; end: number; type: string; title: string }[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    for (const header of sectionHeaders) {
      if (header.patterns.some(pattern => line.includes(pattern))) {
        sections.push({
          start: i,
          end: -1, // Will be set later
          type: header.type,
          title: lines[i].trim() // Keep original casing
        });
        break;
      }
    }
  }

  // Set section end boundaries
  for (let i = 0; i < sections.length; i++) {
    sections[i].end = i === sections.length - 1 
      ? lines.length 
      : sections[i + 1].start;
  }

  return sections;
}

function parseResumeContent(content: string): ResumeSection[] {
  const lines = content.split('\n');
  const sectionBoundaries = findSectionBoundaries(content);
  
  return sectionBoundaries.map(boundary => ({
    type: boundary.type as "summary" | "experience" | "education" | "skills",
    title: boundary.title,
    content: lines.slice(boundary.start + 1, boundary.end)
      .filter(line => line.trim())
      .join('\n')
  }));
}

function optimizeSection(section: ResumeSection, jobDescription: string): string {
  let optimized = section.content;

  switch (section.type) {
    case "summary":
      optimized = optimizeSummary(optimized, jobDescription);
      break;
    case "experience":
      optimized = optimizeExperience(optimized, jobDescription);
      break;
    case "skills":
      optimized = optimizeSkills(optimized, jobDescription);
      break;
    case "education":
      optimized = optimizeEducation(optimized);
      break;
  }

  return `${section.title}\n${optimized}`;
}

function optimizeSummary(content: string, jobDescription: string): string {
  const jobKeywords = extractKeywords(jobDescription);
  const jobSkills = extractSkills(jobDescription);

  let optimized = content;

  // Keep existing content but enhance with job-specific keywords
  const relevantJobKeywords = jobKeywords
    .filter(keyword => !content.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 3);

  if (relevantJobKeywords.length > 0) {
    optimized += `\nProficient in ${relevantJobKeywords.join(", ")}.`;
  }

  return optimized;
}

function optimizeExperience(content: string, jobDescription: string): string {
  const lines = content.split('\n');
  const jobKeywords = extractKeywords(jobDescription);
  
  const optimizedLines = lines.map(line => {
    let optimizedLine = line;

    // Only enhance lines that contain accomplishments or responsibilities
    if (line.match(/^[-•]|\w+ed|\w+ing/)) {
      // Replace weak verbs with strong ones
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
        optimizedLine = optimizedLine.replace(new RegExp(`\\b${weak}\\b`, "gi"), strong);
      });

      // Add relevant keywords from job description if not present
      const lineKeywords = extractKeywords(optimizedLine);
      const missingKeywords = jobKeywords.filter(
        keyword => !lineKeywords.includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0 && !optimizedLine.includes("utilizing") && !optimizedLine.includes("using")) {
        optimizedLine += ` utilizing ${missingKeywords[0]}`;
      }
    }

    return optimizedLine;
  });

  return optimizedLines.join('\n');
}

function optimizeSkills(content: string, jobDescription: string): string {
  const jobSkills = extractSkills(jobDescription);
  const existingSkills = extractSkills(content);
  const missingSkills = jobSkills.filter(skill => !existingSkills.includes(skill));

  let optimized = content.trim();
  
  // Only add missing skills that are relevant to the job
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
  // Expanded skills regex to catch more technical and soft skills
  const skillsRegex = /\b(javascript|python|react|node\.js|typescript|aws|api|sql|html|css|java|c\+\+|ruby|php|golang|swift|kotlin|docker|kubernetes|ci\/cd|agile|scrum|management|leadership|communication|problem[- ]solving|team[- ]work|analytical|project management|customer service|sales|marketing)\b/gi;
  const matches = text.match(skillsRegex) || [];
  return Array.from(new Set(matches.map(skill => skill.toLowerCase())));
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set(['and', 'the', 'or', 'in', 'at', 'on', 'to', 'for', 'of', 'with', 'by']);
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
  if (content.match(/^\s*[-•]/gm)) score += 5;
  if (content.match(/increased|decreased|improved|reduced|achieved|delivered/gi)) score += 3;
  if (content.match(/\d+%|\$\d+|\d+ (users|customers|clients|projects)/gi)) score += 2;

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

  const jobKeywords = extractKeywords(jobDescription);
  const originalKeywordCount = jobKeywords.filter(keyword => 
    original.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  const optimizedKeywordCount = jobKeywords.filter(keyword => 
    optimized.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  if (optimizedKeywordCount > originalKeywordCount) {
    changes.push(`Incorporated ${optimizedKeywordCount - originalKeywordCount} additional job-specific keywords`);
  }

  return changes;
}
