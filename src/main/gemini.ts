import { config } from 'dotenv'

// Load environment variables from .env file BEFORE importing GoogleGenAI
config()

import { GoogleGenAI } from '@google/genai'

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Simple in-memory cache for job titles to save tokens
const MAX_CACHE_SIZE = 100
const jobTitleCache = new Map<string, boolean>()

/**
 * Quick check: is the job title relevant to the user's profile?
 * This avoids navigating to job pages that are clearly not a fit.
 */
export async function isJobTitleRelevant(
  jobTitle: string,
  userProfile: string
): Promise<boolean> {
  // Check cache first
  const cacheKey = `${jobTitle.trim()}|${userProfile.substring(0, 50)}` // Profile part for context, though mostly title matters
  if (jobTitleCache.has(cacheKey)) {
    return jobTitleCache.get(cacheKey)!
  }

  const prompt = `Role: Job Matcher. Task: Match Job Title to User Profile.
Profile: ${userProfile.substring(0, 300)}...
Job: ${jobTitle}
Output: YES or NO only. Loose match.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt
    })
    const text = response.text?.trim().toUpperCase() || ''
    const isRelevant = text.includes('YES')

    // Update cache
    if (jobTitleCache.size >= MAX_CACHE_SIZE) {
      const firstKey = jobTitleCache.keys().next().value
      if (firstKey) jobTitleCache.delete(firstKey)
    }
    jobTitleCache.set(cacheKey, isRelevant)

    return isRelevant
  } catch (error) {
    console.error('Gemini isJobTitleRelevant error:', error)
    // On error, default to checking the job — don't skip it
    return true
  }
}

/**
 * Determines if a job is relevant based on the job description and user profile
 */
export async function isJobRelevant(
  jobDescription: string,
  userProfile: string
): Promise<boolean> {
  const prompt = `Role: Recruiter. Task: Check fit.
Profile: ${userProfile}
Job: ${jobDescription.substring(0, 3000)}...
Output: YES/NO.
YES if good fit (skills, role, location). NO if mismatch.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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
  const prompt = `Role: Candidate. Task: Write cover letter.
Profile: ${userProfile}
Job: ${jobDescription.substring(0, 2000)}...
Output: Professional, personalized, concise pitch. No headers.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt
    })
    return response.text?.trim() || 'Hi! I am interested in this role and believe my skills would be a great fit for your team.'
  } catch (error) {
    console.error('Gemini generateApplication error:', error)
    return `Hi! I'm interested in this role. Based on my experience and skills, I believe I would be a great fit for your team.`
  }
}
