"use client";

import { updateEventVoteDeadlineAction } from "@/app/actions";
import { FormStatusOverlay } from "@/components/form-status-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatSeoulDateTimeLabel, toDateTimeLocalStringSeoul } from "@/lib/seoul-time";

type EventVoteDeadlineFormProps = {
  slug: string;
  voteDeadlineIso: string | null;
};

export function EventVoteDeadlineForm({ slug, voteDeadlineIso }: EventVoteDeadlineFormProps) {
  const defaultLocal = voteDeadlineIso ? toDateTimeLocalStringSeoul(voteDeadlineIso) : "";

  return (
    <form action={updateEventVoteDeadlineAction} className="relative grid gap-2">
      <FormStatusOverlay />
      <input name="slug" type="hidden" value={slug} />
      <Label className="gap-1.5">
        <span className="text-xs text-stone-600">투표 마감 (선택, 서울 시간)</span>
        <Input defaultValue={defaultLocal} name="voteDeadline" type="datetime-local" />
      </Label>
      <p className="text-[0.7rem] leading-relaxed text-stone-500">
        비우고 저장하면 기한 없음으로 바뀝니다. 지난 시각으로는 설정할 수 없어요.
        {voteDeadlineIso ? (
          <span className="mt-1 block font-medium text-stone-600">
            현재: {formatSeoulDateTimeLabel(voteDeadlineIso)}
          </span>
        ) : (
          <span className="mt-1 block font-medium text-stone-600">현재: 기한 없음</span>
        )}
      </p>
      <Button className="w-full" size="sm" type="submit" variant="secondary">
        마감 저장
      </Button>
    </form>
  );
}
