import { JSX } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ProfileReadViewProps {
  profile: string
  onEdit: () => void
  isRunning: boolean
  onStart: () => void
  onStop: () => void
}

export function ProfileReadView({
  profile,
  onEdit,
  isRunning,
  onStart,
  onStop
}: ProfileReadViewProps): JSX.Element {
  return (
    <div className="space-y-4">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Ready to Apply</CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground line-clamp-6 whitespace-pre-wrap">
            {profile}
          </div>
        </CardContent>
      </Card>

      {!isRunning ? (
        <Button className="w-full" onClick={onStart}>
          Start Applying
        </Button>
      ) : (
        <Button variant="destructive" className="w-full" onClick={onStop}>
          Stop
        </Button>
      )}
    </div>
  )
}
