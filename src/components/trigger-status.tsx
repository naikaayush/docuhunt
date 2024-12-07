import { cn } from "@/lib/utils";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Badge } from "./ui/badge";

export function TriggerStatus({ taskId }: { taskId: string }) {
  const { run } = useRealtimeRun(taskId);

  const statuses = {
    WAITING_FOR_DEPLOY: "text-gray-500 bg-gray-100/10",
    QUEUED: "text-gray-500 bg-gray-100/10",
    EXECUTING: "text-blue-400 bg-blue-400/10",
    REATTEMPTING: "text-rose-400 bg-rose-400/10",
    FROZEN: "text-rose-400 bg-rose-400/10",
    COMPLETED: "text-green-400 bg-green-400/10",
    CANCELED: "text-gray-500 bg-gray-100/10",
    FAILED: "text-rose-400 bg-rose-400/10",
    CRASHED: "text-rose-400 bg-rose-400/10",
    INTERRUPTED: "text-rose-400 bg-rose-400/10",
    SYSTEM_FAILURE: "text-rose-400 bg-rose-400/10",
    DELAYED: "text-gray-500 bg-gray-100/10",
    EXPIRED: "text-gray-500 bg-gray-100/10",
    TIMED_OUT: "text-rose-400 bg-rose-400/10",
  };

  if (!run) return null;

  return (
    <li className="relative flex items-center py-2">
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-3">
          <div
            className={cn(statuses[run.status], "flex-none rounded-full p-1")}
          >
            <div className="size-2 rounded-full bg-current" />
          </div>
          <h2 className="min-w-0 text-sm/6 ">
            <div className="flex flex-col gap-x-2">
              <p className="font-semibold">{run.taskIdentifier}</p>
              <p className="text-xs text-gray-500">{run.id}</p>
            </div>
          </h2>
        </div>
      </div>
      <Badge className={cn(statuses[run.status])} variant="outline">
        {run.status}
      </Badge>
    </li>
  );
}
