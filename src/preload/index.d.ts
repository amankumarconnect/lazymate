import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      runAutomation: (url: string, script: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}
