import { contextBridge, ipcRenderer } from 'electron'

interface LogEntry {
  message: string
  type: 'info' | 'success' | 'error' | 'skip' | 'match'
  jobTitle?: string
  matchScore?: number
}

contextBridge.exposeInMainWorld('api', {
  startAutomation: (data: { userProfile: string }) => ipcRenderer.invoke('start-automation', data),
  stopAutomation: () => ipcRenderer.send('stop-automation'),
  parseResume: (buffer: ArrayBuffer) => ipcRenderer.invoke('parse-resume', buffer),
  onLog: (callback: (msg: LogEntry) => void) => {
    const handler = (_: unknown, msg: LogEntry): void => callback(msg)
    ipcRenderer.on('log', handler)
    return () => {
      ipcRenderer.removeListener('log', handler)
    }
  },
  saveUserProfile: (text: string) => ipcRenderer.invoke('save-user-profile', text),
  getUserProfile: () => ipcRenderer.invoke('get-user-profile')
})
