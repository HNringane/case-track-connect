import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  stage: string;
}

interface CaseTimelineProps {
  updates: TimelineUpdate[];
  currentStatus: string;
}

const stageOrder = ['submitted', 'under-review', 'investigation', 'resolution', 'completed'];

export function CaseTimeline({ updates, currentStatus }: CaseTimelineProps) {
  const currentStageIndex = stageOrder.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      {updates.map((update, index) => {
        const isCompleted = stageOrder.indexOf(update.stage) < currentStageIndex;
        const isCurrent = update.stage === currentStatus;

        return (
          <div key={update.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Timeline Line */}
            {index < updates.length - 1 && (
              <div className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] ${
                isCompleted ? 'bg-success' : 'bg-border'
              }`} />
            )}

            {/* Icon */}
            <div className="relative z-10">
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : isCurrent ? (
                <Clock className="w-8 h-8 text-warning animate-pulse-slow" />
              ) : (
                <Circle className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-heading font-semibold">{update.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {new Date(update.date).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{update.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
