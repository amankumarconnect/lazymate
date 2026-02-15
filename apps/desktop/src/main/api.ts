

const API_BASE_URL = 'http://localhost:3333/api'

export interface Company {
  id: string
  url: string
  name: string | null
  status: string
  visitedAt: string
}

export interface Application {
  id: string
  jobTitle: string
  companyName: string
  jobUrl: string
  coverLetter: string
  status: string
  matchScore: number | null
  appliedAt: string
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  checkCompanyExists: async (url: string) => {
    try {
      const params = new URLSearchParams({ url })
      await request<Company>(`/companies/search?${params.toString()}`)
      return true
    } catch (e: any) {
      if (e.message && e.message.includes('404')) {
        return false
      }
      throw e
    }
  },

  createCompany: async (data: { url: string; name: string; status: string }) => {
    return request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  checkApplicationExists: async (jobUrl: string) => {
    try {
      const params = new URLSearchParams({ jobUrl })
      await request<Application>(`/applications/search?${params.toString()}`)
      return true
    } catch (e: any) {
      if (e.message && e.message.includes('404')) {
        return false
      }
      throw e
    }
  },

  createApplication: async (data: {
    jobTitle: string
    companyName: string
    jobUrl: string
    coverLetter: string
    status: string
    matchScore?: number
  }) => {
    return request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getApplications: async () => {
    return request<Application[]>('/applications')
  }
}
