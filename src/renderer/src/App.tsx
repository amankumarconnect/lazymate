import { useState, useEffect, JSX } from 'react'
import { Header } from './components/dashboard/Header'
import { ActivityLog, LogEntry } from './components/dashboard/ActivityLog'
import { ProfileEditView } from './components/dashboard/ProfileEditView'
import { ProfileReadView } from './components/dashboard/ProfileReadView'

function App(): JSX.Element {
  const [profile, setProfile] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

  const addLog = (entry: Omit<LogEntry, 'timestamp'>): void => {
    setLogs((prev) => [...prev, { ...entry, timestamp: new Date() }])
  }

  useEffect(() => {
    // Load existing profile
    const loadProfile = async (): Promise<void> => {
      try {
        // @ts-ignore (window.api is exposed by preload)
        const savedProfile = await window.api.getUserProfile()
        if (savedProfile) {
          setProfile(savedProfile)
        } else {
          setEditMode(true) // No profile, go to edit mode
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        setEditMode(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    // Listen for logs from Main process
    // @ts-ignore (Assuming window.api exists from preload)
    const cleanup = window.api.onLog((msg: LogEntry) => {
      setLogs((prev) => [...prev, { ...msg, timestamp: new Date() }])
    })
    return cleanup
  }, [])

  const handleStart = (): void => {
    setIsRunning(true)
    // @ts-ignore (Assuming window.api exists from preload)
    window.api.startAutomation()
  }

  const handleSave = async (): Promise<void> => {
    try {
      // @ts-ignore (window.api is exposed by preload)
      await window.api.saveUserProfile(profile)
      setEditMode(false)
      addLog({ message: 'Profile saved!', type: 'success' })
    } catch (error) {
      console.error('Failed to save profile:', error)
      addLog({ message: 'Error saving profile', type: 'error' })
    }
  }

  const handleFileUpload = async (file: File): Promise<void> => {
    setIsParsing(true)
    addLog({ message: 'Uploading resume...', type: 'info' })

    try {
      const buffer = await file.arrayBuffer()
      // @ts-ignore (window.api is exposed by preload)
      const text = await window.api.parseResume(buffer)
      setProfile(text)
      addLog({ message: 'Resume parsed successfully!', type: 'success' })
      // Auto-save after parse
      // @ts-ignore (window.api is exposed by preload)
      await window.api.saveUserProfile(text)
      setEditMode(false)
      addLog({ message: 'Profile saved automatically!', type: 'success' })
    } catch (error) {
      console.error(error)
      addLog({ message: 'Error parsing resume', type: 'error' })
    } finally {
      setIsParsing(false)
    }
  }

  const handleStop = (): void => {
    setIsRunning(false)
    // @ts-ignore (Assuming window.api exists from preload)
    window.api.stopAutomation()
  }

  return (
    // Only occupy the left 450px. The Main process handles the view on the right.
    <div className="h-screen w-[450px] bg-background border-r flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
        <Header />

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading profile...</div>
        ) : editMode ? (
          <ProfileEditView
            profile={profile}
            setProfile={setProfile}
            onSave={handleSave}
            onCancel={profile ? () => setEditMode(false) : undefined}
            onFileUpload={handleFileUpload}
            isParsing={isParsing}
            isRunning={isRunning}
          />
        ) : (
          <ProfileReadView
            profile={profile}
            onEdit={() => setEditMode(true)}
            isRunning={isRunning}
            onStart={handleStart}
            onStop={handleStop}
          />
        )}

        <ActivityLog logs={logs} />
      </div>
    </div>
  )
}

export default App
