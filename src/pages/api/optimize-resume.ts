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
  const sectionPatterns = [
    {
      type: "summary" as const,
      patterns: [
        /^(?:professional\s+)?summary/i,
        /^(?:career\s+)?objective/i,
        /^profile/i,
        /^about(?:\s+me)?/i,
        /^overview/i
      ]
    },
    {
      type: "experience" as const,
      patterns: [
        /^(?:work\s+)?experience/i,
        /^professional\s+experience/i,
        /^employment(?:\s+history)?/i,
        /^work\s+history/i,
        /^career\s+history/i,
        /^relevant experience/i
      ]
    },
    {
      type: "education" as const,
      patterns: [
        /^education(?:al)?(?:\s+background)?/i,
        /^academic(?:\s+background)?/i,
        /^qualifications/i,
        /^degrees?/i,
        /^academic history/i
      ]
    },
    {
      type: "skills" as const,
      patterns: [
        /^(?:technical\s+)?skills/i,
        /^core\s+competencies/i,
        /^expertise/i,
        /^technologies/i,
        /^proficiencies/i,
        /^capabilities/i,
        /^technical proficiencies/i,
        /^key skills/i
      ]
    }
  ];

  const lines = content.split('\n');
  const sections: ResumeSection[] = [];
  let currentType: ResumeSection["type"] = "other";
  let currentTitle = "";
  let currentContent: string[] = [];

  function identifySection(line: string): { type: ResumeSection["type"]; title: string } | null {
    const trimmedLine = line.trim();
    
    for (const pattern of sectionPatterns) {
      if (pattern.patterns.some(p => p.test(trimmedLine))) {
        return {
          type: pattern.type,
          title: trimmedLine
        };
      }
    }

    if (trimmedLine && 
        trimmedLine.length <= 50 && 
        /^[A-Z]/.test(trimmedLine) && 
        !trimmedLine.includes(":")) {
      return {
        type: "other",
        title: trimmedLine
      };
    }

    return null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const sectionMatch = identifySection(line);

    if (sectionMatch) {
      if (currentTitle) {
        sections.push({
          type: currentType,
          title: currentType.charAt(0).toUpperCase() + currentType.slice(1),
          originalTitle: currentTitle,
          content: currentContent.join('\n').trim()
        });
      }

      currentType = sectionMatch.type;
      currentTitle = sectionMatch.title;
      currentContent = [];
    } else if (line) {
      currentContent.push(line);
    }
  }

  if (currentTitle && currentContent.length > 0) {
    sections.push({
      type: currentType,
      title: currentType.charAt(0).toUpperCase() + currentType.slice(1),
      originalTitle: currentTitle,
      content: currentContent.join('\n').trim()
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
  // Preserve the original content structure
  const lines = content.split('\n');
  const optimizedLines = lines.map(line => {
    // Only enhance existing content, don't generate new content
    if (line.includes('seeking') || line.includes('objective')) {
      const jobRequirements = extractKeywords(jobDescription)
        .filter(keyword => !line.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 2);
      
      if (jobRequirements.length > 0) {
        return line + ` with expertise in ${jobRequirements.join(' and ')}`;
      }
    }
    return line;
  });

  return optimizedLines.join('\n');
}

function optimizeExperience(content: string, jobDescription: string): string {
  const lines = content.split('\n');
  const jobKeywords = extractKeywords(jobDescription);
  
  const optimizedLines = lines.map(line => {
    // Preserve headers and company names
    if (line.match(/^[A-Z].*?(?:Inc\.|LLC|Ltd\.|Corp\.|Company|Technologies)/)) {
      return line;
    }

    // Only enhance bullet points and descriptions
    if (line.match(/^[-•]|\w+ed|\w+ing/)) {
      let optimizedLine = line;

      // Replace weak verbs with strong ones
      const actionVerbReplacements = {
        'worked': 'spearheaded',
        'helped': 'led',
        'made': 'developed',
        'did': 'executed',
        'was responsible for': 'managed',
        'handled': 'orchestrated'
      };

      Object.entries(actionVerbReplacements).forEach(([weak, strong]) => {
        const weakRegex = new RegExp(`\\b${weak}\\b`, 'gi');
        if (weakRegex.test(optimizedLine)) {
          optimizedLine = optimizedLine.replace(weakRegex, strong);
        }
      });

      // Add relevant keywords if missing
      const missingKeywords = jobKeywords
        .filter(keyword => !optimizedLine.toLowerCase().includes(keyword.toLowerCase()))
        .slice(0, 1);

      if (missingKeywords.length > 0 && !optimizedLine.includes('utilizing')) {
        optimizedLine = optimizedLine.trim() + ` utilizing ${missingKeywords[0]}`;
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

  // Keep original content
  let optimized = content;

  // Add relevant missing skills
  if (missingSkills.length > 0) {
    optimized += '\n\nAdditional relevant skills: ' + missingSkills.join(', ');
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