
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
    
    // Check for section headers
    for (const pattern of sectionPatterns) {
      if (pattern.patterns.some(p => p.test(trimmedLine))) {
        return {
          type: pattern.type,
          title: trimmedLine
        };
      }
    }

    // Check for custom section headers (capitalized, short lines)
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

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sectionMatch = identifySection(line);

    if (sectionMatch) {
      // Save previous section if exists
      if (currentTitle) {
        sections.push({
          type: currentType,
          title: currentType.charAt(0).toUpperCase() + currentType.slice(1),
          originalTitle: currentTitle,
          content: currentContent.join('\n').trim()
        });
      }

      // Start new section
      currentType = sectionMatch.type;
      currentTitle = sectionMatch.title;
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }

  // Add final section
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

// Rest of the file remains unchanged
[Previous implementation of handler function and other utility functions]
