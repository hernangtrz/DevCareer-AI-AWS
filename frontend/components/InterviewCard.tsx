import "dayjs/locale/es";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
dayjs.locale("es");
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getFeedbackByInterviewId } from "@/lib/api";
import { getSessionCookie } from "@/lib/api.server";
import StartTemplateButton from "@/components/StartTemplateButton";

const InterviewCard = async ({
  id, userId, role, type, techstack, createdAt,
  isTemplate = false, currentUserId,
}: InterviewCardProps) => {
  const sessionCookie = await getSessionCookie();

  const isOwner = !isTemplate && currentUserId && currentUserId === userId;
  const feedback = isOwner && userId && id
    ? await getFeedbackByInterviewId({ interviewId: id }, sessionCookie)
    : null;

  const typeTranslations: Record<string, string> = {
    Technical: "Técnica", Behavioral: "Conductual", Mixed: "Mixta",
    tecnica: "Técnica", conductual: "Conductual", combinada: "Combinada",
  };
  const normalizedType = typeTranslations[type] || (/mix/gi.test(type) ? "Mixta" : type);
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("D [de] MMMM, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>
          <Image src={getRandomInterviewCover()} alt="cover image" width={90} height={90} className="rounded-full object-fit size-[90px]" />
          <h3 className="mt-5 capitalize">Entrevista de {role}</h3>
          <div className="flex flex-row gap-5 mt-3">
            {!isTemplate && (
              <div className="flex flex-row gap-2">
                <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                <p>{formattedDate}</p>
              </div>
            )}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment || "Aún no has realizado la entrevista. Hazla ahora para mejorar tus habilidades."}
          </p>
        </div>
        <div className="flex flex-row justify-between items-center w-full gap-4">
          <DisplayTechIcons techStack={techstack} />
          {isTemplate ? (
            <StartTemplateButton templateId={id!} userId={currentUserId || ""} />
          ) : (
            <Button className="btn-primary">
              <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
                {feedback ? "Ver retroalimentación" : "Ver entrevista"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default InterviewCard;
