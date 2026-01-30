import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  isLast?: boolean;
}

function TimelineItem({
  title,
  description,
  status,
  isLast,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center border-2",
            status === "done" && "bg-green-100 border-green-600 text-green-600",
            status === "in-progress" &&
              "bg-yellow-100 border-yellow-600 text-yellow-600",
            status === "todo" && "bg-gray-100 border-gray-300 text-gray-400",
          )}
        >
          {status === "done" && <CheckCircle2 className="h-5 w-5" />}
          {status === "in-progress" && <Clock className="h-5 w-5" />}
          {status === "todo" && <Circle className="h-5 w-5" />}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 grow my-2",
              status === "done" ? "bg-green-600" : "bg-gray-200",
            )}
          />
        )}
      </div>
      <div className="pb-8">
        <h4
          className={cn(
            "text-base font-semibold",
            status === "todo" && "text-muted-foreground",
          )}
        >
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Timeline({ checklist }: { checklist: any }) {
  return (
    <div className="mt-4">
      <TimelineItem
        title="Lengkapi Biodata"
        description="Isi data diri, orang tua, dan wali secara lengkap."
        status={checklist?.biodata ? "done" : "todo"} // Could ideally have 'in-progress' if partial
      />
      <TimelineItem
        title="Upload Dokumen"
        description="Upload KK dan Akta Kelahiran."
        status={
          checklist?.documents
            ? "done"
            : checklist?.biodata
              ? "in-progress"
              : "todo"
        }
      />
      <TimelineItem
        title="Pembayaran & Verifikasi"
        description="Lakukan pembayaran dan tunggu verifikasi admin."
        status={
          checklist?.payment
            ? "done"
            : checklist?.documents
              ? "in-progress"
              : "todo"
        }
        isLast
      />
    </div>
  );
}
