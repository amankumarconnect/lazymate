import { useEffect, useRef, JSX } from 'react'

interface ActivityLogProps {
  logs: string[]
}

export function ActivityLog({ logs }: ActivityLogProps): JSX.Element {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold mb-2 flex-shrink-0">Activity Log</h3>
      <div className="flex-1 overflow-y-auto bg-muted/50 rounded-md border p-2">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-xs font-mono text-muted-foreground break-all">
              {log}
            </div>
          ))}
        </div>
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
