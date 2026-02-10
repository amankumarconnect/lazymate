import { Ollama } from 'ollama'

const ollama = new Ollama()
const MODEL = 'qwen2.5:3b'

// Simple in-memory cache for job titles to save inference time
const MAX_CACHE_SIZE = 100
const jobTitleCache = new Map<string, boolean>()

/**
 * Quick check: is the job title relevant to what the user is looking for?
 * This avoids navigating to job pages that are clearly not a fit.
 */
export async function isJobTitleRelevant(jobTitle: string, userProfile: string): Promise<boolean> {
  // Check cache first
  const cacheKey = `${jobTitle.trim()}|${userProfile}`
  if (jobTitleCache.has(cacheKey)) {
    return jobTitleCache.get(cacheKey)!
  }

  const prompt = `You are a job matching assistant. The user has described what kind of jobs they want to apply to. Your task is to check if the given job title could potentially match what the user is looking for.

USER'S INPUT (this could be criteria, skills, preferences, a mini-resume, or anything — interpret it as what the user wants):
"${userProfile}"

JOB TITLE:
"${jobTitle}"

Think about whether this job title is related to what the user described. Be generous — if there's a reasonable connection, say YES.

Examples:
- User says "only apply to tauri dev jobs", Job title is "Tauri Developer" → YES
- User says "I want remote frontend jobs", Job title is "Senior React Engineer" → YES
- User says "only apply to tauri dev jobs", Job title is "Marketing Manager" → NO

Answer with exactly one word: YES or NO`

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0 }
    })
    const text = response.message.content.trim().toUpperCase()
    const isRelevant = text.includes('YES')

    console.log(`[AI Title Check] "${jobTitle}" → AI said: "${text}" → ${isRelevant ? 'RELEVANT' : 'SKIP'}`)

    // Update cache
    if (jobTitleCache.size >= MAX_CACHE_SIZE) {
      const firstKey = jobTitleCache.keys().next().value
      if (firstKey) jobTitleCache.delete(firstKey)
    }
    jobTitleCache.set(cacheKey, isRelevant)

    return isRelevant
  } catch (error) {
    console.error('Ollama isJobTitleRelevant error:', error)
    // On error, default to checking the job — don't skip it
    return true
  }
}

/**
 * Determines if a job is relevant based on the full job description and user's stated preferences.
 */
export async function isJobRelevant(jobDescription: string, userProfile: string): Promise<boolean> {
  const prompt = `You are a job matching assistant. The user has described what kind of jobs they want to apply to. Your task is to verify whether this specific job matches what the user is looking for by reading the full job description.

USER'S INPUT (this could be criteria, skills, preferences, a mini-resume, or anything — interpret it as what the user wants):
"${userProfile}"

JOB DESCRIPTION:
"${jobDescription}"

Instructions:
- Check if the job description matches what the user asked for.
- If the user specified a specific technology (e.g. "tauri"), check if the job involves that technology.
- If the user specified a role type (e.g. "frontend", "backend"), check if the job is that type.
- If the user gave skills or a resume, check if the job is a reasonable match for those skills.
- Be generous — if the job is a reasonable match, say YES. Only say NO if it's clearly unrelated.

Answer with exactly one word: YES or NO`

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0 }
    })
    const text = response.message.content.trim().toUpperCase()
    const isRelevant = text.includes('YES')

    console.log(`[AI Job Check] AI said: "${text}" → ${isRelevant ? 'GOOD FIT' : 'NOT A FIT'}`)

    return isRelevant
  } catch (error) {
    console.error('Ollama isJobRelevant error:', error)
    // On error, default to checking the job — don't skip it
    return true
  }
}

/**
 * Generates a personalized application/cover letter based on job and user profile
 */
export async function generateApplication(
  jobDescription: string,
  userProfile: string
): Promise<string> {
  const prompt = `You are a job applicant writing a cover letter. Write a professional, personalized, and concise application based on the job description and user profile below. Do not include any headers, greetings, or sign-offs — just the body text.

USER PROFILE:
${userProfile}

JOB DESCRIPTION:
${jobDescription}

Write the application now:`

  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.7 }
    })
    return (
      response.message.content.trim() ||
      'Hi! I am interested in this role and believe my skills would be a great fit for your team.'
    )
  } catch (error) {
    console.error('Ollama generateApplication error:', error)
    return `Hi! I'm interested in this role. Based on my experience and skills, I believe I would be a great fit for your team.`
  }
}
