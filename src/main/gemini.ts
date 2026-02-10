import { config } from 'dotenv'

// Load environment variables from .env file BEFORE importing GoogleGenAI
config()

import { GoogleGenAI } from '@google/genai'

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({})

/**
 * Determines if a job is relevant based on the job description and user profile
 */
export async function isJobRelevant(
  jobDescription: string,
  userProfile: string
): Promise<boolean> {
  const prompt = `You are a job matching AI. Analyze if this job is a good fit for the candidate.

USER PROFILE:
${userProfile}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY "YES" or "NO". 
- YES if the job aligns with the user's skills, preferred role, salary expectations, and location preferences.
- NO if there's a significant mismatch.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    })
    const text = response.text?.trim().toUpperCase() || ''
    return text.includes('YES')
  } catch (error) {
    console.error('Gemini isJobRelevant error:', error)
    return false
  }
}

/**
 * Generates a personalized application/cover letter based on job and user profile
 */
export async function generateApplication(
  jobDescription: string,
  userProfile: string
): Promise<string> {
  const prompt = `You are a professional cover letter writer. Write a compelling, personalized application for this job.

USER PROFILE:
${userProfile}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
- Write a personalized application
- Highlight relevant skills and experience from the user's profile
- Show genuine interest in the specific role and company
- Be professional but personable
- Do NOT include subject lines, headers, or signatures
- Start directly with your pitch

Write the application now:`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    })
    return response.text?.trim() || 'Hi! I am interested in this role and believe my skills would be a great fit for your team.'
  } catch (error) {
    console.error('Gemini generateApplication error:', error)
    return `Hi! I'm interested in this role. Based on my experience and skills, I believe I would be a great fit for your team.`
  }
}
