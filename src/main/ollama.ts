// =====================================================================================
// FILE: src/main/ollama.ts
// PURPOSE: This file handles ALL the AI/ML functionality for the application.
//          It communicates with a locally-running Ollama server (an open-source LLM runner)
//          to perform three key tasks:
//            1. Generate embedding vectors from text (for semantic similarity comparison)
//            2. Check if a job title/description is relevant to the user's profile
//            3. Generate personalized cover letters for job applications
//            4. Create a "job persona" from the user's resume for better matching
//
// WHAT IS OLLAMA? (for beginners):
//   Ollama is a tool that runs AI language models locally on your computer.
//   Instead of sending data to OpenAI/Google cloud servers, everything runs privately on your machine.
//   You need to have Ollama installed and running (usually at http://localhost:11434).
//
// WHAT ARE EMBEDDINGS? (for beginners):
//   An "embedding" is a way to convert text into a list of numbers (a vector like [0.12, -0.34, 0.56, ...]).
//   Texts with similar meaning produce similar number patterns. This lets us mathematically
//   compare how "similar" two pieces of text are (e.g., "Software Engineer" vs "Web Developer"
//   would have similar embeddings, but "Software Engineer" vs "Chef" would not).
//
// WHAT IS COSINE SIMILARITY? (for beginners):
//   A mathematical formula that measures how similar two vectors (lists of numbers) are.
//   Returns a value between -1 and 1:
//     - 1.0 = identical direction (very similar meaning)
//     - 0.0 = perpendicular (unrelated meaning)
//     - -1.0 = opposite direction (opposite meaning)
//   In practice, for text embeddings, values typically range from 0.0 to 1.0.
// =====================================================================================

// Import the Ollama client library which provides a JavaScript API
// to communicate with the locally-running Ollama server
import { Ollama } from 'ollama'

// Create an instance of the Ollama client. By default, it connects to http://localhost:11434
// which is where the Ollama server runs when you start it on your computer.
const ollama = new Ollama()

// MODEL_GENERATION: the name of the LLM model used for TEXT GENERATION tasks
// (writing cover letters, creating job personas). Reads from environment variable
// OLLAMA_MODEL_GENERATION, or defaults to 'gemma3:4b' (Google's Gemma 3, 4 billion parameters).
// Smaller models are faster but less capable; larger models are slower but write better text.
const MODEL_GENERATION = process.env.OLLAMA_MODEL_GENERATION || 'gemma3:4b'

// MODEL_EMBEDDING: the name of the model used for EMBEDDING tasks
// (converting text to numerical vectors for similarity comparison). Reads from environment
// variable OLLAMA_MODEL_EMBEDDING, or defaults to 'qwen3-embedding:0.6b' (a small, fast
// embedding model with 0.6 billion parameters). Embedding models don't need to be as large
// as generation models because they just need to capture meaning, not write coherent text.
const MODEL_EMBEDDING = process.env.OLLAMA_MODEL_EMBEDDING || 'qwen3-embedding:0.6b'

// =====================================================================================
// CACHING CONFIGURATION
// =====================================================================================

// MAX_CACHE_SIZE: the maximum number of job title relevance results we keep in memory.
// Once the cache reaches this size, the oldest entry is removed to make room for new ones.
// This prevents memory from growing unboundedly during long automation sessions.
const MAX_CACHE_SIZE = 100

// jobTitleCache: an in-memory cache (Map) that stores results of previous job title checks.
// Key: a string combining the job title and embedding length (e.g., "Software Engineer|384")
// Value: the relevance result object { relevant: boolean, score: number }
// This avoids re-computing embeddings for job titles we've already checked.
const jobTitleCache = new Map<string, { relevant: boolean; score: number }>()

// =====================================================================================
// SIMILARITY THRESHOLDS
// =====================================================================================
// These thresholds control how "similar" a job must be to the user's profile to be considered
// a match. Values range from 0.0 (no match) to 1.0 (perfect match).
// Lower values = more jobs pass the filter (more applications, but less targeted)
// Higher values = fewer jobs pass (fewer applications, but more relevant)
// Tune these thresholds to control match sensitivity

// TITLE_THRESHOLD: minimum cosine similarity score for a job TITLE to be considered relevant.
// 0.45 means the title must be at least 45% similar to the user's profile embedding.
const TITLE_THRESHOLD = 0.45

// DESCRIPTION_THRESHOLD: minimum cosine similarity score for a full job DESCRIPTION to be considered relevant.
// 0.45 means the description must be at least 45% similar to the user's profile embedding.
const DESCRIPTION_THRESHOLD = 0.45

// =====================================================================================
// FUNCTION: cosineSimilarity(vecA, vecB)
// PURPOSE: Calculates the cosine similarity between two numerical vectors.
//          This is the core mathematical operation used to determine how "similar"
//          two pieces of text are (after they've been converted to embedding vectors).
//
// HOW IT WORKS (for beginners):
//   Imagine two arrows (vectors) in space. Cosine similarity measures the angle between them:
//   - If they point in the same direction → similarity = 1.0 (very similar)
//   - If they're perpendicular → similarity = 0.0 (unrelated)
//   - Formula: cos(θ) = (A · B) / (|A| × |B|)
//     where A · B is the dot product, and |A|, |B| are the magnitudes (lengths)
//
// PARAMETERS:
//   - vecA: first embedding vector (array of numbers, e.g., [0.1, -0.3, 0.5, ...])
//   - vecB: second embedding vector (same length as vecA)
// RETURNS: a number between -1 and 1 (typically 0 to 1 for text embeddings)
// =====================================================================================
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // STEP 1: Calculate the DOT PRODUCT of the two vectors.
  // The dot product is the sum of (a[i] * b[i]) for each element.
  // Example: [1,2,3] · [4,5,6] = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
  // .reduce() iterates through vecA, multiplying each element with the corresponding
  // element in vecB, and accumulating the sum starting from 0.
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)

  // STEP 2: Calculate the MAGNITUDE (length) of vector A.
  // Magnitude = sqrt(a[0]² + a[1]² + a[2]² + ... + a[n]²)
  // This is the Euclidean length of the vector in n-dimensional space.
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))

  // STEP 3: Calculate the MAGNITUDE (length) of vector B (same formula).
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))

  // STEP 4: Handle edge case — if either vector has zero length (all zeros),
  // return 0 to avoid division by zero. This can happen if embedding generation fails.
  if (magnitudeA === 0 || magnitudeB === 0) return 0

  // STEP 5: Return the cosine similarity = dotProduct / (magnitudeA × magnitudeB)
  // This normalizes the dot product by the lengths of both vectors,
  // giving a value between -1 and 1 that depends only on the ANGLE between them.
  return dotProduct / (magnitudeA * magnitudeB)
}

// =====================================================================================
// FUNCTION: getEmbedding(text)
// PURPOSE: Converts a piece of text into a numerical embedding vector using the Ollama
//          embedding model. This vector captures the semantic meaning of the text.
//
// HOW IT WORKS:
//   Sends the text to the Ollama server, which runs it through a neural network
//   (the embedding model) and returns a list of numbers representing the text's meaning.
//
// PARAMETERS:
//   - text: the string to convert to an embedding (e.g., a job title, job description, or persona)
// RETURNS: an array of numbers (the embedding vector), or an empty array if an error occurs
// =====================================================================================
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Call the Ollama API's embed endpoint to generate an embedding for the given text.
    // - model: which embedding model to use (e.g., 'qwen3-embedding:0.6b')
    // - input: the text string to embed
    const response = await ollama.embed({
      model: MODEL_EMBEDDING,
      input: text
    })
    // The response contains an array of embeddings (one per input).
    // Since we only sent one input text, we take the first (and only) embedding at index [0].
    return response.embeddings[0]
  } catch (error) {
    // If anything goes wrong (Ollama not running, model not downloaded, network error, etc.),
    // log the error and return an empty array. The calling code checks for empty arrays
    // and defaults to treating the job as relevant (to avoid missing potential matches).
    console.error('Ollama embedding error:', error)
    return []
  }
}

// =====================================================================================
// FUNCTION: isJobTitleRelevant(jobTitle, userProfileEmbedding)
// PURPOSE: Quickly checks if a job TITLE is relevant to the user's profile by comparing
//          their embedding vectors. This is a fast pre-filter — if the title doesn't match,
//          we skip the job entirely without loading its full page (saves time).
//
// WHY THIS EXISTS:
//   Loading a full job page takes 1-2 seconds. By checking just the title first (which is
//   already visible on the company page), we can skip irrelevant jobs much faster.
//
// PARAMETERS:
//   - jobTitle: the job title text (e.g., "Senior Frontend Engineer")
//   - userProfileEmbedding: the user's pre-computed profile embedding vector
// RETURNS: { relevant: boolean, score: number }
//   - relevant: true if the similarity meets the threshold, false otherwise
//   - score: the similarity percentage (0-100), or -1 if embedding failed
// =====================================================================================
// Quick embedding-based check to skip obviously irrelevant jobs without navigating to them
export async function isJobTitleRelevant(
  jobTitle: string,
  userProfileEmbedding: number[]
): Promise<{ relevant: boolean; score: number }> {
  // Create a unique cache key by combining the trimmed job title with the embedding length.
  // The embedding length is included to invalidate the cache if the model changes
  // (different models produce different-length embeddings).
  const cacheKey = `${jobTitle.trim()}|${userProfileEmbedding.length}`

  // Check if we've already computed the relevance for this exact job title.
  // If so, return the cached result immediately (avoids redundant API calls to Ollama).
  if (jobTitleCache.has(cacheKey)) {
    // The '!' (non-null assertion) tells TypeScript we're sure the value exists
    // (because we just checked with .has())
    return jobTitleCache.get(cacheKey)!
  }

  try {
    // Convert the job title text into an embedding vector using the Ollama model
    const titleEmbedding = await getEmbedding(jobTitle)

    // If either embedding is empty (embedding generation failed), default to marking
    // the job as relevant. It's better to check a false positive than miss a real match.
    if (titleEmbedding.length === 0 || userProfileEmbedding.length === 0) {
      console.warn('[AI Title Check] Failed to get embeddings, defaulting to TRUE')
      // score: -1 indicates the score couldn't be computed (embedding failure)
      return { relevant: true, score: -1 }
    }

    // Calculate how similar the job title is to the user's profile using cosine similarity.
    // Result is a float between 0.0 (completely different) and 1.0 (virtually identical).
    const similarity = cosineSimilarity(titleEmbedding, userProfileEmbedding)

    // Compare the similarity against our threshold to make a binary relevant/not-relevant decision
    const isRelevant = similarity >= TITLE_THRESHOLD

    // Log the result to the developer console for debugging/monitoring
    // Shows the job title, the raw similarity score (4 decimal places), and the decision
    console.log(
      `[AI Title Check] "${jobTitle}" vs Profile -> Similarity: ${similarity.toFixed(4)} -> ${
        isRelevant ? 'RELEVANT' : 'SKIP'
      }`
    )

    // Convert the similarity float (0.0-1.0) to a percentage integer (0-100) for the UI
    const result = { relevant: isRelevant, score: Math.round(similarity * 100) }

    // Evict oldest entry when cache is full
    // If the cache has reached its maximum size (100 entries), remove the OLDEST entry
    // before adding the new one. This is a simple FIFO (First In, First Out) eviction strategy.
    // Maps in JavaScript maintain insertion order, so the first key is the oldest.
    if (jobTitleCache.size >= MAX_CACHE_SIZE) {
      // Get the first (oldest) key in the Map using the iterator
      const firstKey = jobTitleCache.keys().next().value
      // Delete the oldest entry to make room for the new one
      if (firstKey) jobTitleCache.delete(firstKey)
    }
    // Store the result in the cache for future lookups of the same job title
    jobTitleCache.set(cacheKey, result)

    // Return the relevance result to the caller
    return result
  } catch (error) {
    // If any error occurs (Ollama server down, timeout, etc.), log it and default to
    // treating the job as relevant (fail-open strategy — better to check too many than miss one)
    console.error('Ollama isJobTitleRelevant error:', error)
    return { relevant: true, score: -1 }
  }
}

// =====================================================================================
// FUNCTION: isJobRelevant(jobDescription, userProfileEmbedding)
// PURPOSE: Performs a thorough relevance check by comparing the FULL job description
//          (not just the title) against the user's profile embedding. This is called
//          after the title check passes — it's the second (deeper) filter.
//
// PARAMETERS:
//   - jobDescription: the full text of the job posting page (description, requirements, etc.)
//   - userProfileEmbedding: the user's pre-computed profile embedding vector
// RETURNS: { relevant: boolean, score: number }
//   - relevant: true if the similarity meets the DESCRIPTION_THRESHOLD
//   - score: the similarity percentage (0-100), or -1 if embedding failed
// =====================================================================================
export async function isJobRelevant(
  jobDescription: string,
  userProfileEmbedding: number[]
): Promise<{ relevant: boolean; score: number }> {
  try {
    // Convert the full job description text into an embedding vector.
    // This captures the overall meaning of the job requirements, responsibilities, etc.
    const descriptionEmbedding = await getEmbedding(jobDescription)

    // If either embedding is empty (generation failed), default to relevant (fail-open strategy)
    if (descriptionEmbedding.length === 0 || userProfileEmbedding.length === 0) {
      console.warn('[AI Job Check] Failed to get embeddings, defaulting to TRUE')
      return { relevant: true, score: -1 }
    }

    // Calculate the cosine similarity between the job description and user profile embeddings
    const similarity = cosineSimilarity(descriptionEmbedding, userProfileEmbedding)

    // Compare against the description threshold (0.45 by default)
    const isRelevant = similarity >= DESCRIPTION_THRESHOLD

    // Log the result for debugging — shows the raw similarity and the decision
    console.log(
      `[AI Job Check] Similarity: ${similarity.toFixed(4)} -> ${isRelevant ? 'GOOD FIT' : 'NOT A FIT'}`
    )

    // Return the result with the score as a percentage integer (0-100)
    return { relevant: isRelevant, score: Math.round(similarity * 100) }
  } catch (error) {
    // On error, default to relevant (fail-open) and log the error
    console.error('Ollama isJobRelevant error:', error)
    return { relevant: true, score: -1 }
  }
}

// =====================================================================================
// FUNCTION: generateApplication(jobDescription, userProfile)
// PURPOSE: Uses the LLM to write a personalized cover letter / application text
//          based on the job description and the user's resume. This text will be
//          typed into the application form on the WorkAtAStartup website.
//
// PARAMETERS:
//   - jobDescription: the full text of the job posting (so the LLM knows what the job requires)
//   - userProfile: the user's resume text (so the LLM knows the user's background)
// RETURNS: the generated cover letter text as a string, or a fallback generic message on error
// =====================================================================================
export async function generateApplication(
  jobDescription: string,
  userProfile: string
): Promise<string> {
  // Construct the prompt for the LLM. This is a carefully crafted instruction that tells
  // the AI exactly what to write and how to format it. The prompt includes:
  // 1. The role ("You are a job applicant...")
  // 2. The format instructions ("no headers, greetings, or sign-offs")
  // 3. The user's resume text
  // 4. The job description text
  // 5. A trigger phrase ("Write the application now:")
  const prompt = `You are a job applicant writing a cover letter. Write a professional, personalized, and concise application based on the job description and user profile below. Do not include any headers, greetings, or sign-offs — just the body text.

USER PROFILE:
${userProfile}

JOB DESCRIPTION:
${jobDescription}

Write the application now:`

  try {
    // Send the prompt to the Ollama LLM for text generation.
    // - model: the generation model (e.g., 'gemma3:4b')
    // - messages: the conversation in chat format (just one user message with our prompt)
    // - options.temperature: controls randomness/creativity of the output
    //   - 0.0 = very deterministic (same input → same output)
    //   - 1.0 = very creative/random
    //   - 0.7 = a good balance between creativity and coherence for cover letters
    const response = await ollama.chat({
      model: MODEL_GENERATION,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.7 }
    })
    // Extract the generated text from the response, trim whitespace.
    // If the response is empty for some reason, use a generic fallback message.
    return (
      response.message.content.trim() ||
      'Hi! I am interested in this role and believe my skills would be a great fit for your team.'
    )
  } catch (error) {
    // If the LLM call fails (Ollama down, model not loaded, timeout, etc.),
    // log the error and return a generic fallback cover letter so the automation
    // can still fill in SOMETHING rather than crashing.
    console.error('Ollama generateApplication error:', error)
    return `Hi! I'm interested in this role. Based on my experience and skills, I believe I would be a great fit for your team.`
  }
}

// =====================================================================================
// FUNCTION: generateJobPersona(resumeText)
// PURPOSE: Uses the LLM to generate a hypothetical "ideal job description" based on
//          the user's resume. This persona text is then converted to an embedding vector
//          and used for matching against real job postings.
//
// WHY NOT JUST EMBED THE RESUME DIRECTLY? (for beginners):
//   Raw resumes contain mixed content: contact info, education dates, project names, skills lists, etc.
//   This "noise" makes the embedding less effective for matching against job descriptions.
//   By generating a hypothetical job description FROM the resume, we get text that is
//   structured like a real job posting — which matches MUCH better against actual job postings.
//   This technique is called "Hypothetical Document Embedding" (HyDE).
//
// PARAMETERS:
//   - resumeText: the plain text extracted from the user's resume PDF
// RETURNS: a generated job description paragraph, or the raw resume text on error (as fallback)
// =====================================================================================
// Generates a hypothetical "ideal job posting" from the resume — produces better
// semantic matches than embedding the raw resume text directly
export async function generateJobPersona(resumeText: string): Promise<string> {
  // This is a detailed, structured prompt in Markdown format that guides the LLM to:
  // 1. Analyze the candidate's seniority level (student, junior, senior, career-changer)
  // 2. Extract the most important skills from actual projects/work (not just skill lists)
  // 3. Write a realistic job description from an employer's perspective
  //
  // The prompt uses "### SECTION" headers for clarity, numbered instructions for order,
  // bold text for emphasis, and specific examples to guide the LLM's output.
  const prompt = `### ROLE
You are an expert Career Coach and Technical Recruiter with 20+ years of experience in matching candidates to their ideal roles.

### TASK
I will provide you with a candidate's RESUME.
Your goal is to write a **Hypothetical Job Description** that represents the **perfect, realistic next step** for this specific candidate. This text will be vector-embedded to search for matching jobs.

### CRITICAL INSTRUCTIONS (Follow in Order)

1. **Analyze Seniority (The Filter):**
   - **Student/Fresher:** If Education ends in the future (e.g., 2026+) OR experience is < 1 year, the target role **MUST** be "Intern", "Trainee", or "Entry-Level".
   - **Junior/Mid:** If experience is 1-4 years, the target role is "Developer", "Associate", or "Engineer".
   - **Senior/Lead:** If experience is 5+ years, the target role is "Senior", "Lead", or "Manager".
   - **Pivot:** If the candidate's recent projects/degrees differ from their past work history, prioritize the **NEW** skills (e.g., a Sales Manager pivoting to Data Science).

2. **Extract the "Power Keywords":**
   - Identify the top 3-5 hard skills they *actually* used in projects/work (not just listed in a "Skills" section).
   - Identify their domain focus (e.g., "Fintech", "Healthtech", "E-commerce") if apparent.

3. **Draft the Target Job Description:**
   - Write it from the employer's perspective ("We are looking for...").
   - Use standard industry terminology.
   - **Crucial:** Include constraints that match the user's resume (e.g., "Remote", "India", "Visa Sponsorship" if mentioned, or specific certifications).

### OUTPUT FORMAT
Return **ONLY** the hypothetical Job Description paragraph. Do not output your thinking process or JSON. Just the text to be embedded.

---

### INPUT RESUME
${resumeText}`

  try {
    // Send the prompt to the Ollama LLM for generation.
    // - temperature: 0.3 is used here (lower than the cover letter's 0.7) because we want
    //   the persona to be more CONSISTENT and FACTUAL rather than creative.
    //   A low temperature means the model is more likely to pick the most probable words,
    //   producing more deterministic and reliable output.
    const response = await ollama.chat({
      model: MODEL_GENERATION,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.3 }
    })
    // Return the generated persona text, trimmed of leading/trailing whitespace
    return response.message.content.trim()
  } catch (error) {
    // If the LLM call fails, log the error and fall back to using the raw resume text.
    // This is a graceful degradation — the embedding of raw resume text is less effective
    // for matching, but it's better than having no embedding at all.
    console.error('Ollama generateJobPersona error:', error)
    return resumeText
  }
}
