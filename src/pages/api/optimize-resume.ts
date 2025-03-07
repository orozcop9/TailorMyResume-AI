
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
      type: "summary",
      patterns: [
        /^(?:professional\s+)?summary/i,
        /^(?:career\s+)?objective/i,
        /^profile/i,
        /^about(?:\s+me)?/i
      ]
    },
    {
      type: "experience",
      patterns: [
        /^(?:work\s+)?experience/i,
        /^professional\s+experience/i,
        /^employment(?:\s+history)?/i,
        /^work\s+history/i,
        /^career\s+history/i
      ]
    },
    {
      type: "education",
      patterns: [
        /^education(?:al)?(?:\s+background)?/i,
        /^academic(?:\s+background)?/i,
        /^qualifications/i,
        /^degrees?/i
      ]
    },
    {
      type: "skills",
      patterns: [
        /^(?:technical\s+)?skills/i,
        /^core\s+competencies/i,
        /^expertise/i,
        /^technologies/i,
        /^proficiencies/i,
        /^capabilities/i
      ]
    }
  ];

  const lines = content.split('\n').map(line => line.trim());
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  let currentContent: string[] = [];

  function identifySection(line: string): { type: string; pattern: RegExp } | null {
    for (const section of sectionPatterns) {
      const matchingPattern = section.patterns.find(pattern => pattern.test(line));
      if (matchingPattern) {
        return { type: section.type, pattern: matchingPattern };
      }
    }
    return null;
  }

  lines.forEach((line, index) => {
    const sectionMatch = identifySection(line);
    
    if (sectionMatch || (line && line.length <= 50 && /^[A-Z]/.test(line) && !line.includes(":"))) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim()
        });
      }

      // Start new section
      currentSection = {
        type: sectionMatch ? sectionMatch.type : "other",
        title: sectionMatch ? sectionMatch.type.charAt(0).toUpperCase() + sectionMatch.type.slice(1) : line,
        originalTitle: line,
        content: ""
      } as ResumeSection;
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  });

  // Add final section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentContent.join('\n').trim()
    });
  }

  return sections;
}

function optimizeSection(section: ResumeSection, jobDescription: string): string {
  // Preserve original section title
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
      optimizedContent = section.content; // Preserve education section as is
      break;
    default:
      optimizedContent = section.content; // Preserve other sections as is
  }

  return `${sectionHeader}\n${optimizedContent}`;
}

function optimizeSummary(content: string, jobDescription: string): string {
  // Preserve original summary content
  let optimized = content;
  const jobKeywords = extractKeywords(jobDescription);
  const relevantKeywords = jobKeywords
    .filter(keyword => !content.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 3);

  if (relevantKeywords.length > 0) {
    const keywordPhrase = `Experienced in ${relevantKeywords.join(", ")}.`;
    if (!optimized.includes(keywordPhrase)) {
      optimized = optimized.trim() + '\n' + keywordPhrase;
    }
  }

  return optimized;
}

function optimizeExperience(content: string, jobDescription: string): string {
  const lines = content.split('\n');
  const jobKeywords = extractKeywords(jobDescription);
  
  const optimizedLines = lines.map(line => {
    let optimizedLine = line;

    // Only enhance bullet points or lines starting with action verbs
    if (line.match(/^[-•]|\w+ed|\w+ing/)) {
      // Keep original line structure while enhancing verbs
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
        const weakRegex = new RegExp(`\\b${weak}\\b`, "gi");
        if (weakRegex.test(optimizedLine)) {
          optimizedLine = optimizedLine.replace(weakRegex, strong);
        }
      });

      // Add relevant keywords if not present
      const missingKeywords = jobKeywords.filter(
        keyword => !optimizedLine.toLowerCase().includes(keyword.toLowerCase())
      );

      if (missingKeywords.length > 0 && !optimizedLine.includes("utilizing")) {
        const relevantKeyword = missingKeywords[0];
        optimizedLine = optimizedLine.trim() + ` utilizing ${relevantKeyword}`;
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

  // Preserve original skills section
  let optimized = content.trim();
  
  if (missingSkills.length > 0) {
    optimized += '\nAdditional relevant skills: ' + missingSkills.join(", ");
  }

  return optimized;
}

function extractSkills(text: string): string[] {
  const skillPatterns = [
    // Technical Skills
    /\b(?:javascript|typescript|python|java|c\+\+|ruby|php|swift|kotlin)\b/gi,
    /\b(?:react|angular|vue|node\.js|express|django|flask|spring)\b/gi,
    /\b(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|git)\b/gi,
    /\b(?:sql|mongodb|postgresql|mysql|redis|elasticsearch)\b/gi,
    /\b(?:html5?|css3?|sass|less|bootstrap|tailwind)\b/gi,
    
    // Soft Skills
    /\b(?:leadership|communication|problem[- ]solving|analytical|teamwork)\b/gi,
    /\b(?:project management|agile|scrum|kanban|lean)\b/gi,
    /\b(?:strategic|planning|organization|time management)\b/gi,
    
    // Business Skills
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

// Rest of the file remains unchanged...
[Previous implementation of handler function and other utility functions]

