import { GoogleGenAI } from '@google/genai';
import type { LocationData, SafetyReport, AISafetyAnalysis } from '../types';

export async function analyzeAreaSafetyWithGemini(
  location: LocationData,
  nearbyReports: SafetyReport[]
): Promise<AISafetyAnalysis> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });

  const reportDetails = nearbyReports.length > 0
    ? nearbyReports
        .map(
          r =>
            `- Category: ${r.category}, Severity: ${r.severity}, Title: "${r.title}", Description: "${r.description}", Coords: (${r.lat.toFixed(4)}, ${r.lng.toFixed(4)})`
        )
        .join('\n')
    : 'No community safety reports reported in this immediate sector.';

  const prompt = `You are a real-time safety risk assessment AI engine.
Analyze the user's current GPS position and nearby crowdsourced safety reports.

Current User GPS Location: Latitude ${location.lat.toFixed(5)}, Longitude ${location.lng.toFixed(5)}.
Current Timestamp: ${new Date(location.timestamp).toISOString()}.

Nearby Community Safety Reports (${nearbyReports.length} reports):
${reportDetails}

Task:
1. Evaluate the safety risk level for someone walking or traveling in this area.
2. If there are reported hazards (like poor lighting, harassment, suspicious activity), increase the risk level accordingly.
3. If there are verified police stations or safe zones nearby, take them into account as positive safety factors.
4. Output STRICT JSON matching this exact structure:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskScore": integer between 0 and 100 (0 = extremely safe, 100 = extremely risky),
  "summary": "1-2 sentence concise summary of the safety risk in this area",
  "riskFactors": ["Specific bullet 1", "Specific bullet 2", "Specific bullet 3"],
  "recommendation": "Clear, actionable advice for staying safe in this area"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('EMPTY_RESPONSE');
  }

  const parsed = JSON.parse(text) as {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
    summary: string;
    riskFactors: string[];
    recommendation: string;
  };

  return {
    riskLevel: parsed.riskLevel || 'MEDIUM',
    riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
    summary: parsed.summary || 'Area safety analysis complete.',
    riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : ['Nearby safety reports analyzed'],
    recommendation: parsed.recommendation || 'Stay vigilant and stick to well-lit areas.',
    analyzedAt: Date.now(),
  };
}
