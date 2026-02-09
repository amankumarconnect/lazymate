import { JSX, useState } from 'react'
import { Play, Loader2, Globe, Terminal, Trash2 } from 'lucide-react'

// Shadcn Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

function App(): JSX.Element {
  const [url, setUrl] = useState('https://todomvc.com/examples/react/dist/')
  // Default script for demo
  const [script, setScript] = useState(`await page.waitForSelector('.new-todo');
await page.type('.new-todo', 'Buy Milk', { delay: 100 });
await page.keyboard.press('Enter');
await page.type('.new-todo', 'Walk the dog', { delay: 100 });
await page.keyboard.press('Enter');`)
  
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])

  const handleRun = async () => {
    if (!url) return addLog('Error: Please enter a URL')
    
    setIsRunning(true)
    addLog('🚀 Starting automation...')
    
    try {
      // @ts-ignore (exposed via preload)
      const result = await window.api.runAutomation(url, script)
      
      if (result.success) {
        addLog('✅ Script finished successfully!')
      } else {
        addLog(`❌ Error: ${result.error}`)
      }
    } catch (e) {
      addLog('❌ System Error: Failed to communicate with main process')
    }
    
    setIsRunning(false)
  }

  return (
    // Main container - limit width to 400px (sidebar width)
    <div className="flex h-screen w-[400px] flex-col border-r bg-background text-foreground">
      
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">LazyMate</h1>
        </div>
        <p className="text-xs text-muted-foreground">Browser automation playground</p>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Target URL Section */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-xs font-semibold uppercase text-muted-foreground">
              Target URL
            </Label>
            <div className="relative">
              <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="url"
                placeholder="https://example.com" 
                className="pl-8 font-mono text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Script Section */}
          <div className="space-y-2 flex flex-col h-[300px]">
            <div className="flex justify-between items-center">
              <Label htmlFor="script" className="text-xs font-semibold uppercase text-muted-foreground">
                Playwright Script
              </Label>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                async (page)
              </span>
            </div>
            <Textarea 
              id="script"
              className="flex-1 font-mono text-xs resize-none leading-relaxed p-3 bg-secondary/30"
              placeholder="// Enter Playwright code here..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleRun} 
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run Script
              </>
            )}
          </Button>

          {/* Console Output */}
          <Card className="bg-zinc-950 border-zinc-800 shadow-inner">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-mono text-zinc-400">Console Output</CardTitle>
              {logs.length > 0 && (
                <button 
                  onClick={() => setLogs([])}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </CardHeader>
            <Separator className="bg-zinc-800" />
            <CardContent className="p-0">
              <ScrollArea className="h-[150px] p-3">
                <div className="space-y-1">
                  {logs.length === 0 ? (
                    <span className="text-zinc-600 text-xs italic">Ready to execute...</span>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="text-xs font-mono text-zinc-300 break-all">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
      
      <Separator />
      
      {/* Footer */}
      <div className="p-2 text-center">
        <p className="text-[10px] text-muted-foreground">
          Powered by Electron & Playwright
        </p>
      </div>
    </div>
  )
}

export default App