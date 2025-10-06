"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { startQuiz, fetchQuestions, submitAnswers } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Timer as TimerIcon } from "lucide-react";

type QuizQuestion = { _id: string; text: string; options: string[] };

export default function QuizPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});
  const [result, setResult] = useState<{ totalCorrect: number; score: number; freeNext: boolean; results?: { questionId: string; chosenIndex: number; correctIndex: number; correct: boolean }[] } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6 * 60);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const storageKey = "daily_quiz_progress";
  const [needsTopup, setNeedsTopup] = useState(false);

  const numAnswered = useMemo(() => Object.values(answers).filter((v) => v != null).length, [answers]);

  async function handleStart() {
    setLoading(true);
    try {
      const started = await startQuiz(phone || "");
      setQuizId(started.quizId);
      const q = await fetchQuestions(started.questionIds);
      setQuestions(q.questions);
      setAnswers({});
      setResult(null);
      setNeedsTopup(false);
    } catch (e: unknown) {
      const err = (e as { status?: number }) || {};
      if (err.status === 402) {
        toast.error("Insufficient credits. Please top up.");
        setNeedsTopup(true);
        // Keep user on this screen to show the Top up CTA clearly
      } else if (err.status === 401 || err.status === 403) {
        toast.error("Please sign in to play.");
        router.push("/auth");
      } else {
        toast.error("Failed to start quiz");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!quizId || result || loading) return;
    const formatted = questions.map((q) => ({ questionId: q._id, chosenIndex: answers[q._id] ?? -1 }));
    const firstUnansweredIndex = formatted.findIndex((a) => a.chosenIndex < 0);
    if (firstUnansweredIndex !== -1) {
      const q = questions[firstUnansweredIndex];
      toast.error("Answer all 10 questions");
      const el = questionRefs.current[q._id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    try {
      const r = await submitAnswers(quizId, phone, formatted);
      setResult(r);
      toast.success(`Score: ${r.score}. ${r.freeNext ? "Next set is free!" : ""}`);
    } catch {
      toast.error("Failed to submit answers");
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    // reset local state and start a fresh set
    setAnswers({});
    setResult(null);
    setQuestions([]);
    setSecondsRemaining(6 * 60);
    handleStart();
  }

  useEffect(() => {
    const p = localStorage.getItem("phone");
    if (p) setPhone(p);
    // auto-start if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
    if (token) {
      handleStart();
    }
  }, []);
  useEffect(() => {
    if (phone) localStorage.setItem("phone", phone);
  }, [phone]);

  // restore saved progress for the current quiz
  useEffect(() => {
    if (!quizId || questions.length === 0) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { quizId: string; answers: Record<string, number | undefined>; secondsRemaining: number };
      if (saved.quizId === quizId) {
        setAnswers(saved.answers || {});
        if (!result) setSecondsRemaining(saved.secondsRemaining ?? 6 * 60);
      }
    } catch {}
  }, [quizId, questions.length]);

  // start/pause timer when quiz questions exist
  useEffect(() => {
    if (questions.length === 0 || result) return;
    setSecondsRemaining(6 * 60);
    const intervalId = window.setInterval(() => {
      setSecondsRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [questions.length, result]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(secondsRemaining / 60)
      .toString()
      .padStart(1, "0");
    const s = (secondsRemaining % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsRemaining]);

  // auto-submit on timer end
  useEffect(() => {
    if (questions.length === 0) return;
    if (secondsRemaining === 0 && !result && !loading) {
      handleSubmit();
    }
  }, [secondsRemaining, result, loading, questions.length]);

  const displayedScore = result?.score ?? 0;

  // lightweight confetti on perfect score (safe dynamic import)
  useEffect(() => {
    if (result?.totalCorrect === 10) {
      (async () => {
        try {
          const mod: unknown = await import("canvas-confetti").catch(() => null);
          if (mod) {
            const confetti = (mod as { default?: unknown })?.default || mod;
            if (typeof confetti === 'function') {
              confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            }
          }
        } catch {}
      })();
    }
  }, [result?.totalCorrect]);

  // persist progress
  useEffect(() => {
    if (!quizId || questions.length === 0 || result) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ quizId, answers, secondsRemaining })
      );
    } catch {}
  }, [quizId, answers, secondsRemaining, questions.length, result]);

  function selectAnswer(questionId: string, optionIndex: number) {
    if (result || secondsRemaining === 0) return;
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionIndex };
      return next;
    });
    // scroll to next unanswered question
    const order = questions.map((q) => q._id);
    const currentIdx = order.indexOf(questionId);
    for (let i = currentIdx + 1; i < order.length; i++) {
      const id = order[i];
      if (answers[id] == null && questionRefs.current[id]) {
        setTimeout(() => questionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        break;
      }
    }
  }

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div className="min-h-[70vh] relative flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-background rounded-xl">
          <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-32 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply blur-xl opacity-20 animate-blob animation-delay-4000" />

          <div className="relative z-10 bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m4.243.757l-1.414 1.414M21 12h-2m-1.757 6.243l-1.414-1.414M12 19v2M6.757 18.243l1.414-1.414M5 12H3m3.757-6.243l1.414 1.414M9 13a3 3 0 106 0 3 3 0 00-6 0z"/></svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4 tracking-tight">Daily Quiz</h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">10 questions. 10 points each. 1 reward per set unless you keep a 10/10 streak.</p>
            {needsTopup && (
              <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Not enough credits. Top up to play.</div>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handleStart} disabled={loading} className="relative px-8 py-6 text-lg font-bold rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 cursor-pointer ">
                {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin"/> Starting…</span>) : 'Start'}
              </Button>
              {needsTopup && (
                <Button variant="secondary" className="px-6 py-6 text-lg font-semibold rounded-full" onClick={() => router.push('/topup')}>Top up</Button>
              )}
            </div>
          </div>

          <style jsx global>{`
            @keyframes blob {0% {transform: translate(0,0) scale(1);}33% {transform: translate(30px,-50px) scale(1.1);}66% {transform: translate(-20px,20px) scale(0.9);}100% {transform: translate(0,0) scale(1);} }
            .animate-blob { animation: blob 7s infinite cubic-bezier(0.6,0.01,0.28,0.98); }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
          `}</style>
        </div>
      ) : (
        <div className="relative">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl font-extrabold text-purple-700">Daily Quiz</CardTitle>
                  <CardDescription>10 questions. 10 points each. 1 SZL per set unless you keep a 10/10 streak.</CardDescription>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold">
                    <TimerIcon className="h-5 w-5" />
                    <span>{timeLabel}</span>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-foreground/80">Score: {displayedScore}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {result && (
                <div className="rounded-xl border bg-gradient-to-r from-purple-50 to-emerald-50 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Result</div>
                    <div className="text-base md:text-lg font-semibold">Total Correct: {result.totalCorrect}/10 • Score: {result.score}</div>
                    {result.freeNext && (
                      <div className="text-xs mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 font-medium">Next set is free!</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => router.push('/leaderboard')}>View Leaderboard</Button>
                    <Button size="sm" onClick={handleRestart}>Try another set</Button>
                  </div>
                </div>
              )}
              <div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all"
                    style={{ width: `${(numAnswered / 10) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center justify-between">
                  <span>Answered {numAnswered}/10</span>
                </div>
              </div>

              <div className="grid gap-4">
                {questions.map((q, idx) => (
                  <div
                    key={q._id}
                    ref={(el) => { questionRefs.current[q._id] = el; }}
                    className="bg-card border rounded-2xl shadow-sm"
                  >
                    <div className="px-5 pt-5">
                      <h2 className="text-base md:text-lg font-semibold text-foreground">Q{idx + 1}. {q.text}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
                    {q.options.map((opt, i) => {
                        const checked = answers[q._id] === i;
                        const letter = String.fromCharCode(65 + i);
                        const correctness = result?.results?.find((r) => r.questionId === q._id);
                        const isCorrect = result && correctness ? correctness.correctIndex === i : false;
                        const isWrongChoice = result && correctness ? correctness.chosenIndex === i && !correctness.correct : false;
                        return (
                          <button
                            key={i}
                            onClick={() => selectAnswer(q._id, i)}
                            disabled={!!result || secondsRemaining === 0}
                            className={`group relative flex items-center gap-3 w-full rounded-xl border-2 px-4 py-3 text-left transition-all ${
                              result
                                ? isCorrect
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                  : isWrongChoice
                                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                                    : 'border-muted bg-muted/40 text-foreground'
                                : checked
                                  ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-inner'
                                  : 'border-muted bg-muted/40 hover:bg-muted/60 hover:border-purple-300'
                            }`}
                          >
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                              result
                                ? isCorrect
                                  ? 'border-emerald-600 text-emerald-700'
                                  : isWrongChoice
                                    ? 'border-rose-500 text-rose-700'
                                    : 'border-muted-foreground/30 text-muted-foreground'
                                : checked
                                  ? 'border-purple-600 text-purple-700'
                                  : 'border-muted-foreground/30 text-muted-foreground'
                            }`}>{letter}</span>
                            <span className="font-medium">{opt}</span>
                          </button>
                        );
                      })}
                    {result && result.results && (
                      <div className="px-5 pb-5 -mt-2 text-sm text-muted-foreground">
                        Correct answer: <span className="font-semibold">{(() => {
                          const r = result.results?.find((rr) => rr.questionId === q._id);
                          if (!r) return '—';
                          const idx = r.correctIndex;
                          return `${String.fromCharCode(65 + idx)}. ${q.options[idx]}`;
                        })()}</span>
                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button onClick={handleSubmit} disabled={loading || numAnswered < 10 || !!result} className="hidden md:inline-flex">
                  {loading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</span>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
                {result && (
                  <div className="text-sm mt-2">Total Correct: {result.totalCorrect} / 10. Score: {result.score}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {numAnswered === 10 && !result && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="md:hidden fixed bottom-6 right-6 z-20 rounded-full px-6 py-4 text-white text-sm font-bold shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-700 disabled:opacity-70"
            >
              {loading ? 'Submitting…' : 'Submit Quiz'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


