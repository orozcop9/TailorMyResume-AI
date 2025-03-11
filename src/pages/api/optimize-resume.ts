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
  type: "summary" | "experience" | "education" | "skills" | "other";
  title: string;
  content: string;
  originalTitle: string;
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
    const sections = findSectionBoundaries(originalContent);
    let optimizedContent = "";

    for (const section of sections) {
      const optimizedSection = optimizeSection(section, jobDescription);
      optimizedContent += optimizedSection + "\n\n";
    }

    const jobSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(originalContent);
    const jobKeywords = extractKeywords(jobDescription);
    
    const skillMatch = calculateSkillMatch(resumeSkills, jobSkills);
    const keywordMatch = calculateKeywordMatch(optimizedContent, jobKeywords);
    const atsScore = calculateATSScore(optimizedContent);

    const improvements = {
      skillsMatch: skillMatch,
      atsCompatibility: atsScore,
      keywordOptimization: keywordMatch
    };

    const keyChanges = generateKeyChanges(originalContent, optimizedContent, jobDescription);

    return res.status(200).json({
      success: true,
      originalContent,
      optimizedContent,
      improvements,
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

function findSectionBoundaries(content: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = content.split('\n');
  let currentSection: ResumeSection | null = null;
  let contentBuffer: string[] = [];

  // Enhanced section detection patterns
  const sectionHeaders = {
    summary: /^(?:PROFESSIONAL\s+)?SUMMARY|^OBJECTIVE|^PROFILE|^ABOUT/i,
    experience: /^(?:PROFESSIONAL\s+)?EXPERIENCE|^EMPLOYMENT|^WORK\s+HISTORY/i,
    education: /^EDUCATION|^ACADEMIC|^QUALIFICATIONS/i,
    skills: /^(?:TECHNICAL\s+)?SKILLS|^COMPETENCIES|^EXPERTISE/i
  };

  function identifySection(line: string): ResumeSection['type'] | null {
    const cleanLine = line.trim().toUpperCase();
    if (sectionHeaders.summary.test(cleanLine)) return 'summary';
    if (sectionHeaders.experience.test(cleanLine)) return 'experience';
    if (sectionHeaders.education.test(cleanLine)) return 'education';
    if (sectionHeaders.skills.test(cleanLine)) return 'skills';
    return null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const sectionType = identifySection(line);
    
    if (sectionType) {
      // Save previous section if exists
      if (currentSection && contentBuffer.length > 0) {
        sections.push({
          ...currentSection,
          content: contentBuffer.join('\n')
        });
      }

      // Start new section
      currentSection = {
        type: sectionType,
        title: sectionType,
        originalTitle: line,
        content: ''
      };
      contentBuffer = [];
    } else if (currentSection) {
      contentBuffer.push(line);
    }
  }

  // Add final section
  if (currentSection && contentBuffer.length > 0) {
    sections.push({
      ...currentSection,
      content: contentBuffer.join('\n')
    });
  }

  return sections;
}

function optimizeSection(section: ResumeSection, jobDescription: string): string {
  const sectionHeader = section.originalTitle;
  let optimizedContent = section.content;

  switch (section.type) {
    case "summary":
      optimizedContent = optimizeSummary(optimizedContent, jobDescription);
      break;
    case "experience":
      optimizedContent = optimizeExperience(optimizedContent, jobDescription);
      break;
    case "skills":
      optimizedContent = optimizeSkills(optimizedContent, jobDescription);
      break;
    case "education":
    case "other":
      optimizedContent = section.content;
      break;
  }

  return `${sectionHeader}\n${optimizedContent}`;
}

function optimizeSummary(content: string, jobDescription: string): string {
  // Keep original core content
  let optimized = content;

  // Extract key requirements from job description
  const requirements = jobDescription.match(/(?:required|requirements|qualifications|seeking|must have|looking for).*?(?:\.|$)/gi) || [];
  const keyRequirements = requirements
    .map(req => req.replace(/^.*?:\s*/, '').trim())
    .filter(req => req.length > 0)
    .slice(0, 2);

  // Add relevant experience highlights if not already mentioned
  if (keyRequirements.length > 0) {
    const relevantSkills = keyRequirements
      .filter(req => !content.toLowerCase().includes(req.toLowerCase()));

    if (relevantSkills.length > 0) {
      optimized = optimized.trim() + ' Experienced in ' + relevantSkills.join(' and ') + '.';
    }
  }

  return optimized;
}

function optimizeExperience(content: string, jobDescription: string): string {
  const lines = content.split('\n');
  const jobKeywords = extractKeywords(jobDescription);
  
  const optimizedLines = lines.map(line => {
    // Skip headers and dates
    if (line.match(/^[A-Z].*?(?:20\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/i)) {
      return line;
    }

    // Enhance bullet points
    if (line.match(/^[-•]|^\s*[-•]|\w+ed|\w+ing/)) {
      let optimizedLine = line;

      // Replace weak verbs with strong ones
      const actionVerbReplacements = {
        'worked on': 'developed',
        'helped': 'led',
        'assisted': 'managed',
        'participated in': 'spearheaded',
        'supported': 'drove',
        'contributed to': 'delivered',
        'responsible for': 'owned',
        'involved in': 'executed'
      };

      Object.entries(actionVerbReplacements).forEach(([weak, strong]) => {
        const weakRegex = new RegExp(`\\b${weak}\\b`, 'gi');
        if (weakRegex.test(optimizedLine)) {
          optimizedLine = optimizedLine.replace(weakRegex, strong);
        }
      });

      // Add job-specific keywords naturally
      const relevantKeywords = jobKeywords
        .filter(keyword => !optimizedLine.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 1);

      if (relevantKeywords.length > 0) {
        optimizedLine = optimizedLine.trim();
        if (!optimizedLine.endsWith('.')) optimizedLine += '.';
        optimizedLine += ` Leveraged expertise in ${relevantKeywords[0]}.`;
      }

      return optimizedLine;
    }

    return line;
  });

  return optimizedLines.join('\n');
}

function optimizeSkills(content: string, jobDescription: string): string {
  const jobSkills = extractSkills(jobDescription);
  const existingSkills = extractSkills(content);
  const missingSkills = jobSkills.filter(skill => !existingSkills.includes(skill));

  let optimized = content;

  if (missingSkills.length > 0) {
    const technicalSkills = missingSkills.filter(skill => 
      /^(javascript|python|java|react|angular|vue|node|aws|docker|kubernetes|git|sql)$/i.test(skill)
    );
    const softSkills = missingSkills.filter(skill => 
      /^(leadership|communication|problem|analytical|teamwork|management)$/i.test(skill)
    );

    if (technicalSkills.length > 0) {
      optimized += '\n\nTechnical Skills: ' + technicalSkills.join(', ');
    }
    if (softSkills.length > 0) {
      optimized += '\n\nSoft Skills: ' + softSkills.join(', ');
    }
  }

  return optimized;
}

function extractSkills(text: string): string[] {
  const skillPatterns = [
    /\b(?:javascript|typescript|python|java|c\+\+|ruby|php|swift|kotlin)\b/gi,
    /\b(?:react|angular|vue|node\.js|express|django|flask|spring)\b/gi,
    /\b(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|git)\b/gi,
    /\b(?:sql|mongodb|postgresql|mysql|redis|elasticsearch)\b/gi,
    /\b(?:html5?|css3?|sass|less|bootstrap|tailwind)\b/gi,
    /\b(?:leadership|communication|problem[- ]solving|analytical|teamwork)\b/gi,
    /\b(?:project management|agile|scrum|kanban|lean)\b/gi,
    /\b(?:strategic|planning|organization|time management)\b/gi,
    /\b(?:sales|marketing|customer service|business development)\b/gi,
    /\b(?:analysis|research|reporting|presentation)\b/gi
  ];

  const skills = new Set<string>();
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => skills.add(match.toLowerCase()));
  });

  return Array.from(skills);
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const commonWords = new Set([
    'and', 'the', 'or', 'in', 'at', 'on', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'this', 'that', 'these', 'those'
  ]);

  return Array.from(new Set(
    words.filter(word => 
      !commonWords.has(word) && 
      word.length > 2 &&
      !/^\d+$/.test(word)
    )
  ));
}

function calculateSkillMatch(resumeSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 100;
  const matchingSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  return Math.round((matchingSkills.length / jobSkills.length) * 100);
}

function calculateKeywordMatch(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 100;
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
    changes.push(`Added relevant skills: ${newSkills.join(", ")}`);
  }

  const actionVerbsRegex = /\b(led|developed|managed|created|implemented|designed|optimized|improved)\b/gi;
  const originalActionVerbs = original.match(actionVerbsRegex)?.length || 0;
  const optimizedActionVerbs = optimized.match(actionVerbsRegex)?.length || 0;
  
  if (optimizedActionVerbs > originalActionVerbs) {
    changes.push("Enhanced impact with stronger action verbs");
  }

  const jobKeywords = extractKeywords(jobDescription);
  const originalKeywordCount = jobKeywords.filter(keyword => 
    original.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  const optimizedKeywordCount = jobKeywords.filter(keyword => 
    optimized.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  if (optimizedKeywordCount > originalKeywordCount) {
    changes.push(`Added ${optimizedKeywordCount - originalKeywordCount} job-specific keywords`);
  }

  return changes;
}