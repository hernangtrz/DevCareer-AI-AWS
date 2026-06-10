export const dynamic = "force-dynamic";

import "dayjs/locale/es";
import "dayjs/locale/en";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getCurrentUser, getSessionCookie, getLanguageCookie } from "@/lib/api.server";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translations";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const sessionCookie = await getSessionCookie();
  const user = await getCurrentUser();
  const lang = await getLanguageCookie();
  dayjs.locale(lang);
  const t = translations[lang];

  const interview = await getInterviewById(id, sessionCookie);
  if (!interview) redirect("/dashboard");

  const feedback = await getFeedbackByInterviewId({ interviewId: id }, sessionCookie);

  const formattedDate = lang === "es"
    ? (feedback?.createdAt ? dayjs(feedback.createdAt).format("D [de] MMMM, YYYY h:mm A") : "N/A")
    : (feedback?.createdAt ? dayjs(feedback.createdAt).format("MMMM D, YYYY h:mm A") : "N/A");

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          {t.feed_title}{" "}
          <span className="capitalize">{interview.role}</span>
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>{t.feed_general_impression}: <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>/100</p>
          </div>
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>{formattedDate}</p>
          </div>
        </div>
      </div>

      <hr />
      <p>{feedback?.finalAssessment}</p>

      <div className="flex flex-col gap-4">
        <h2>{t.feed_breakdown}</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index} className="text-left">
            <p className="font-bold">{index + 1}. {category.name} ({category.score}/100)</p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-left">
        <h3>{t.feed_strengths}</h3>
        <ul>{feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      <div className="flex flex-col gap-3 text-left">
        <h3>{t.feed_improvements}</h3>
        <ul>{feedback?.areasForImprovement?.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </div>

      {feedback?.englishFeedback && (
        <div className="flex flex-col gap-6 mt-8 p-6 bg-dark-300 border border-primary-200/20 rounded-2xl text-left">
          <div className="flex items-center justify-between border-b border-light-800 pb-4">
            <h2 className="text-2xl font-semibold text-primary-200 flex items-center gap-2">
              🇺🇸 English Proficiency Evaluation
            </h2>
            <div className="flex items-center gap-2 bg-primary-200 text-dark-100 font-bold px-4 py-1.5 rounded-full text-lg shadow-sm">
              <span className="text-xs uppercase font-medium tracking-wider text-dark-200">CEFR:</span>
              {feedback.englishFeedback.overallLevel}
            </div>
          </div>

          <p className="text-light-100 italic">
            "{feedback.englishFeedback.overallComment}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-dark-200 p-4 rounded-xl border border-light-800 flex flex-col gap-1">
              <span className="text-light-400 text-xs font-semibold uppercase tracking-wider">Grammar</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">{feedback.englishFeedback.grammarScore}</span>
                <span className="text-light-400 text-sm">/100</span>
              </div>
              <div className="w-full bg-dark-300 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-success-100 h-full rounded-full" 
                  style={{ width: `${feedback.englishFeedback.grammarScore}%` }} 
                />
              </div>
            </div>

            <div className="bg-dark-200 p-4 rounded-xl border border-light-800 flex flex-col gap-1">
              <span className="text-light-400 text-xs font-semibold uppercase tracking-wider">Vocabulary</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">{feedback.englishFeedback.vocabularyScore}</span>
                <span className="text-light-400 text-sm">/100</span>
              </div>
              <div className="w-full bg-dark-300 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-success-100 h-full rounded-full" 
                  style={{ width: `${feedback.englishFeedback.vocabularyScore}%` }} 
                />
              </div>
            </div>

            <div className="bg-dark-200 p-4 rounded-xl border border-light-800 flex flex-col gap-1">
              <span className="text-light-400 text-xs font-semibold uppercase tracking-wider">Fluency</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">{feedback.englishFeedback.fluencyScore}</span>
                <span className="text-light-400 text-sm">/100</span>
              </div>
              <div className="w-full bg-dark-300 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-success-100 h-full rounded-full" 
                  style={{ width: `${feedback.englishFeedback.fluencyScore}%` }} 
                />
              </div>
            </div>
          </div>

          {feedback.englishFeedback.grammarErrors && feedback.englishFeedback.grammarErrors.length > 0 && (
            <div className="flex flex-col gap-2.5 text-left">
              <h3 className="text-lg font-semibold text-destructive-100">Grammar Mistakes Identified</h3>
              <ul className="list-none flex flex-col gap-2 pl-0">
                {feedback.englishFeedback.grammarErrors.map((error, idx) => (
                  <li key={idx} className="bg-destructive-100/10 border border-destructive-100/20 text-light-100 px-4 py-2.5 rounded-lg text-sm flex items-start gap-2.5">
                    <span className="text-destructive-100 font-bold">✗</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.englishFeedback.vocabularySuggestions && feedback.englishFeedback.vocabularySuggestions.length > 0 && (
            <div className="flex flex-col gap-2.5 text-left">
              <h3 className="text-lg font-semibold text-success-100">Vocabulary Suggestions</h3>
              <ul className="list-none flex flex-col gap-2 pl-0">
                {feedback.englishFeedback.vocabularySuggestions.map((suggestion, idx) => (
                  <li key={idx} className="bg-success-100/10 border border-success-100/20 text-light-100 px-4 py-2.5 rounded-lg text-sm flex items-start gap-2.5">
                    <span className="text-success-100 font-bold">✓</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/dashboard" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">{t.feed_btn_home}</p>
          </Link>
        </Button>
        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">{t.feed_btn_retake}</p>
          </Link>
        </Button>
      </div>
    </section>
  );
};
export default Page;
