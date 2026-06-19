import { STATUS_PILL, type Status } from "@/data/tracker";

export default function StatusPill({ status }: { status: Status }) {
  const { bg, fg } = STATUS_PILL[status];
  return (
    <span
      className="inline-block rounded-[3px] px-[11px] py-1 text-[11.5px] whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {status}
    </span>
  );
}
