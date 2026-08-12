import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON payloads and urlencoded data
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      app: "IEEE InnovateX",
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // OCR Endpoint for scanned document pages
  app.post("/api/ocr", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { imageBase64, mimeType = "image/png", pageNumber } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `You are an expert Optical Character Recognition (OCR) engine specialized in reading academic IEEE research paper pages.
Transcribe all text from this scanned image of Page ${pageNumber || 1} with high precision.
Preserve paper structure, column reading order, section titles, math formulas, dataset details, figure/table captions, and references.
Return ONLY the transcribed plain text without commentary.`
          }
        ]
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Server OCR error:", error);
      res.status(500).json({ error: error?.message || "OCR processing failed" });
    }
  });

  // Helper function to build structured text chunks with page & chunk markers
  function chunkPaperText(text: string): { chunkedText: string; totalChunks: number } {
    const lines = text.split('\n');
    let pageNum = '1';
    let chunkCount = 0;
    let chunkedOutput = '';
    let currentChunkBuffer = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pageMatch = line.match(/^---\s*Page\s*(\d+)/i);
      if (pageMatch) {
        pageNum = pageMatch[1];
      }

      currentChunkBuffer += line + '\n';

      if (currentChunkBuffer.length >= 1000 || i === lines.length - 1) {
        chunkCount++;
        chunkedOutput += `\n[CHUNK_START id="chunk-p${pageNum}-c${chunkCount}" page="${pageNum}"]\n${currentChunkBuffer.trim()}\n[CHUNK_END]\n`;
        currentChunkBuffer = '';
      }
    }

    return { chunkedText: chunkedOutput || text, totalChunks: chunkCount || 1 };
  }

  // Real Gemini AI Evidence-Grounded Paper Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in environment settings."
        });
      }

      const { paperId, title, textContent } = req.body;

      if (!paperId || !textContent) {
        return res.status(400).json({
          error: "Missing required paper details for analysis."
        });
      }

      const { chunkedText } = chunkPaperText(textContent);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const SYSTEM_INSTRUCTION = `You are a research analysis engine.

Analyze only the supplied paper content.

Do not use outside knowledge to invent paper-specific facts.

Every claim must be supported by supplied evidence.

If information is unavailable, return NOT_FOUND.

Clearly distinguish explicit statements from logical inferences.

Never fabricate metrics.`;

      const prompt = `Analyze the following IEEE research paper text and extract an evidence-grounded evaluation.

Paper Title: ${title || "Untitled IEEE Paper"}

Paper Text with Chunk & Page Identifiers:
${chunkedText}

CRITICAL INSTRUCTIONS:
1. Extract paperSummary, problemStatement, objectives, methodology breakdown, algorithms, technologies, datasets, results, limitations, futureWork, researchGaps, and evidences.
2. For EVERY limitation or gap or result, cite at least one evidence item in the 'evidences' array with exact 'quoteOrExcerpt', matching 'chunkId', 'page', 'section', and 'sourceType' ('EXPLICIT' vs 'INFERRED').
3. For limitations: 'type' MUST be either 'EXPLICIT' (if directly stated in text) or 'INFERRED' (if logically derived). NEVER label an inferred limitation as explicit.
4. For research gaps: 'gapType' MUST be one of: Technical, Performance, Scalability, Security, Usability, Accuracy, Real-time, Data, Architecture, Deployment, Evaluation, Generalization.
5. If any component (e.g. dataset, accuracy result, input) is absent from the text, store 'NOT_FOUND'. Do NOT invent values.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          paperSummary: { type: Type.STRING, description: "Summary grounded in paper text or NOT_FOUND" },
          problemStatement: { type: Type.STRING, description: "Problem statement or NOT_FOUND" },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          methodology: {
            type: Type.OBJECT,
            properties: {
              input: { type: Type.STRING },
              processing: { type: Type.STRING },
              algorithm: { type: Type.STRING },
              output: { type: Type.STRING },
              architecture: { type: Type.STRING },
              dataset: { type: Type.STRING },
              evaluation: { type: Type.STRING }
            },
            required: ["input", "processing", "algorithm", "output", "architecture", "dataset", "evaluation"]
          },
          algorithms: { type: Type.ARRAY, items: { type: Type.STRING } },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          datasets: { type: Type.ARRAY, items: { type: Type.STRING } },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                metric: { type: Type.STRING },
                source: { type: Type.STRING },
                page: { type: Type.STRING },
                evidenceId: { type: Type.STRING }
              },
              required: ["value", "metric", "source", "page"]
            }
          },
          limitations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING, description: "EXPLICIT or INFERRED" },
                evidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                page: { type: Type.STRING },
                section: { type: Type.STRING },
                confidence: { type: Type.STRING, description: "High, Medium, or Low" }
              },
              required: ["id", "title", "explanation", "type", "evidenceIds", "page", "section", "confidence"]
            }
          },
          futureWork: { type: Type.ARRAY, items: { type: Type.STRING } },
          researchGaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                evidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                relatedLimitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                gapType: { type: Type.STRING },
                confidence: { type: Type.STRING }
              },
              required: ["id", "title", "explanation", "evidenceIds", "relatedLimitations", "gapType", "confidence"]
            }
          },
          evidences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                paperId: { type: Type.STRING },
                page: { type: Type.STRING },
                section: { type: Type.STRING },
                chunkId: { type: Type.STRING },
                quoteOrExcerpt: { type: Type.STRING },
                sourceType: { type: Type.STRING }
              },
              required: ["id", "page", "section", "chunkId", "quoteOrExcerpt", "sourceType"]
            }
          }
        },
        required: [
          "paperSummary",
          "problemStatement",
          "objectives",
          "methodology",
          "algorithms",
          "technologies",
          "datasets",
          "results",
          "limitations",
          "futureWork",
          "researchGaps",
          "evidences"
        ]
      };

      let response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      let responseText = response.text || "";
      let parsedData: any = null;

      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn("Initial JSON parse failed. Attempting repair call...");
        // Single repair retry attempt if initial JSON parse failed
        const repairResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Fix and return valid JSON adhering strictly to schema for this output:\n${responseText}`,
          config: {
            systemInstruction: "Output ONLY valid JSON matching the schema.",
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });
        parsedData = JSON.parse(repairResponse.text || "{}");
      }

      // Schema validation check
      if (
        !parsedData ||
        typeof parsedData !== "object" ||
        !parsedData.paperSummary ||
        !Array.isArray(parsedData.limitations)
      ) {
        throw new Error("AI analysis schema validation failed.");
      }

      return res.json({
        success: true,
        paperId,
        analysis: parsedData
      });

    } catch (err: any) {
      console.error("AI Analysis error:", err);
      // Return clear error message per requirements
      return res.status(500).json({
        error: "AI analysis could not be completed."
      });
    }
  });

  // Dynamic Software-Only Research Enhancement Recommendation Endpoint
  app.post("/api/recommend-enhancements", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
      }

      const { paperId, paperTitle, paperSummary, problemStatement, researchGaps, limitations, evidences } = req.body;

      if (!paperId || !Array.isArray(researchGaps)) {
        return res.status(400).json({ error: "Invalid request payload." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const SYSTEM_INSTRUCTION = `You are an expert IEEE research software architect.
Generate tailored, SOFTWARE-ONLY enhancement recommendations directly derived from the supplied paper's research gaps, limitations, and evidences.

CRITICAL RULES:
1. NEVER hardcode generic answers. Each recommendation must solve an actual research gap and limitation from this paper.
2. The system is SOFTWARE-ONLY. Do NOT require new physical hardware. Hardware requirements must be represented via software simulators, virtual IoT telemetry, or synthetic data.
3. If a gap is non-technical or lacks evidence, set isNoStrongEnhancement: true with a clear explanation.
4. Calculate explainable relevance score (0-100) using: Evidence Alignment (max 25) + Problem Alignment (max 25) + Feasibility (max 25) + Implementation Relevance (max 25).
5. Build complete traceability links: Paper Evidence -> Limitation -> Research Gap -> Enhancement -> New Software Module -> Validation Metric.`;

      const prompt = `Analyze these paper research gaps and generate customized software-only enhancement recommendations:

Paper Title: ${paperTitle || "IEEE Research Paper"}
Summary: ${paperSummary || ""}
Problem Statement: ${problemStatement || ""}

Research Gaps:
${JSON.stringify(researchGaps, null, 2)}

Limitations:
${JSON.stringify(limitations, null, 2)}

Evidences:
${JSON.stringify(evidences, null, 2)}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                paperId: { type: Type.STRING },
                limitationId: { type: Type.STRING },
                researchGapId: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                rationale: { type: Type.STRING },
                implementationApproach: { type: Type.STRING },
                expectedBenefit: { type: Type.STRING },
                feasibility: { type: Type.STRING },
                impact: { type: Type.STRING },
                relevanceScore: { type: Type.NUMBER },
                relevanceBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    evidenceAlignment: { type: Type.NUMBER },
                    problemAlignment: { type: Type.NUMBER },
                    feasibilityScore: { type: Type.NUMBER },
                    implementationRelevance: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["evidenceAlignment", "problemAlignment", "feasibilityScore", "implementationRelevance", "explanation"]
                },
                evidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                validationMetric: { type: Type.STRING },
                confidence: { type: Type.STRING },
                isSoftwareOnly: { type: Type.BOOLEAN },
                isNoStrongEnhancement: { type: Type.BOOLEAN },
                noEnhancementReason: { type: Type.STRING },
                traceabilityLink: {
                  type: Type.OBJECT,
                  properties: {
                    paperEvidence: { type: Type.STRING },
                    limitation: { type: Type.STRING },
                    researchGap: { type: Type.STRING },
                    enhancement: { type: Type.STRING },
                    newSoftwareModule: { type: Type.STRING },
                    validationMetric: { type: Type.STRING },
                    isComplete: { type: Type.BOOLEAN }
                  },
                  required: ["paperEvidence", "limitation", "researchGap", "enhancement", "newSoftwareModule", "validationMetric", "isComplete"]
                }
              },
              required: [
                "id", "paperId", "limitationId", "researchGapId", "title", "category",
                "rationale", "implementationApproach", "expectedBenefit", "feasibility",
                "impact", "relevanceScore", "relevanceBreakdown", "evidenceIds",
                "dependencies", "risks", "validationMetric", "confidence",
                "isSoftwareOnly", "traceabilityLink"
              ]
            }
          }
        },
        required: ["recommendations"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, recommendations: parsed.recommendations || [] });
    } catch (err: any) {
      console.error("Server enhancement recommendation error:", err);
      return res.status(500).json({ error: "Failed to generate AI recommendations." });
    }
  });

  // Dynamic Enhanced Project Spec Generator Endpoint
  app.post("/api/generate-project-spec", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
      }

      const { paperId, paperTitle, paperSummary, problemStatement, methodologyOverview, limitations, researchGaps, recommendations, selectedIds } = req.body;

      if (!paperId) {
        return res.status(400).json({ error: "paperId is required." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const SYSTEM_INSTRUCTION = `You are an expert software engineer generating a realistic research-to-software proposal derived from an IEEE research paper.
CRITICAL RULES:
1. Every section MUST be derived from the actual paper and selected enhancements.
2. The solution MUST be software-only. Do NOT require new physical hardware.
3. Architecture flows must show existing flow (input -> processing -> output) vs enhanced flow with specific new software modules.
4. Validation plan must list software-only tests with clear metric targets.
5. Do NOT invent fake unverified claims; mark validation statuses properly.`;

      const prompt = `Generate a complete Enhanced Project Specification for:
Paper Title: ${paperTitle}
Problem Statement: ${problemStatement}
Summary: ${paperSummary}
Limitations: ${JSON.stringify(limitations || [])}
Research Gaps: ${JSON.stringify(researchGaps || [])}
Selected Enhancements: ${JSON.stringify(recommendations?.filter((r: any) => selectedIds?.includes(r.id)) || [])}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          projectTitle: { type: Type.STRING },
          oneLineConcept: { type: Type.STRING },
          problemStatement: { type: Type.STRING },
          existingSystem: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              architectureOverview: { type: Type.STRING },
              keyComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
              limitations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "architectureOverview", "keyComponents", "limitations"]
          },
          researchGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          selectedEnhancements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                rationale: { type: Type.STRING },
                newSoftwareModule: { type: Type.STRING },
                linkedLimitation: { type: Type.STRING }
              },
              required: ["id", "title", "category", "rationale", "newSoftwareModule", "linkedLimitation"]
            }
          },
          proposedSolution: { type: Type.STRING },
          architecture: {
            type: Type.OBJECT,
            properties: {
              existingFlow: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["id", "label", "type"]
                }
              },
              enhancedFlow: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    isNew: { type: Type.BOOLEAN },
                    linkedLimitation: { type: Type.STRING }
                  },
                  required: ["id", "label", "type"]
                }
              }
            },
            required: ["existingFlow", "enhancedFlow"]
          },
          softwareModules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkedLimitation: { type: Type.STRING },
                codeSnippet: { type: Type.STRING }
              },
              required: ["name", "description", "technologies", "linkedLimitation"]
            }
          },
          technologyStack: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["category", "items"]
            }
          },
          implementationPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                deliverable: { type: Type.STRING }
              },
              required: ["phase", "title", "description", "deliverable"]
            }
          },
          validationPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                testType: { type: Type.STRING },
                description: { type: Type.STRING },
                metric: { type: Type.STRING },
                method: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["testType", "description", "metric", "method", "status"]
            }
          },
          expectedImpact: { type: Type.STRING },
          limitationsOfEnhancement: { type: Type.ARRAY, items: { type: Type.STRING } },
          futureWork: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          "projectTitle", "oneLineConcept", "problemStatement", "existingSystem",
          "researchGaps", "selectedEnhancements", "proposedSolution", "architecture",
          "softwareModules", "technologyStack", "implementationPlan", "validationPlan",
          "expectedImpact", "limitationsOfEnhancement", "futureWork"
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, spec: parsed });
    } catch (err: any) {
      console.error("Server generate-project-spec error:", err);
      return res.status(500).json({ error: "Failed to generate project specification." });
    }
  });

  // Paper link fetcher endpoint for ArXiv / DOI / PDF URL metadata parsing
  app.post("/api/fetch-paper-metadata", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      let title = "URL Research Reference";
      let source = "External Link";

      if (url.includes("arxiv.org")) {
        source = "arXiv Repository";
        const matches = url.match(/abs\/([0-9]+\.[0-9]+)/);
        if (matches) {
          title = `arXiv:${matches[1]} Research Paper`;
        }
      } else if (url.includes("ieee.org")) {
        source = "IEEE Xplore";
        title = "IEEE Document Reference";
      }

      return res.json({
        success: true,
        metadata: {
          title,
          url,
          source,
          year: new Date().getFullYear().toString(),
          status: "Awaiting analysis"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to resolve paper URL metadata." });
    }
  });

  // Vite development server setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IEEE InnovateX] Server running on http://localhost:${PORT}`);
  });
}

startServer();
