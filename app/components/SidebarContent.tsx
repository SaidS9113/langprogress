'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle, Circle, Home, Play } from "lucide-react";
import { chapters, chapterLessonToGlobalPage } from "@/lib/chapters";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useChapterVideos } from "@/hooks/useChapterVideos";
import { useAutoProgress } from "@/hooks/useAutoProgress";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string | null;
  isActive: boolean;
  accountType?: 'ACTIVE' | 'INACTIVE' | 'PAID_LEGACY';
  subscriptionPlan?: 'SOLO' | 'COACHING' | null;
}


const calculateProgress = (completedPages: Set<number>, completedQuizzes: Set<number>) => {
  const totalLessons = chapters.reduce((total, ch) => total + ch.lessons.length, 0);
  const totalQuizzes = chapters.filter(ch => ch.quiz && ch.quiz.length > 0).length;
  const totalItems = totalLessons + totalQuizzes;

  const completedItems = completedPages.size + completedQuizzes.size;
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
};


export default function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/get-user', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const isChapterLocked = (chapterNumber: number) => {
    if (!user) return false;
    
    if (user.isActive || user.accountType === 'ACTIVE' || user.accountType === 'PAID_LEGACY') return false;
    
    if (user.accountType === 'INACTIVE' || !user.isActive) {
      return true;
    }
    
    return false;
  };

  const {
    completedPages,
    completedQuizzes,
    isLoading,
    togglePageCompletion,
    toggleQuizCompletion,
    isProfessorMode,
    updateTrigger,
    updateFromExternal,
  } = useUserProgress();

  const { getVideoByChapter } = useChapterVideos();
  
  const autoProgressHook = useAutoProgress({
    minTimeOnPage: 6000,
    enabled: true 
  });
  
  const { 
    currentPageInfo, 
    validateCurrentPage,
    getTimeOnCurrentPage,
    hasValidated
  } = autoProgressHook;

  const currentOpenChapter = useMemo(() => {
    const chapter = chapters.find(ch =>
      ch.lessons.some(l => pathname === `/chapters/${ch.chapterNumber}/${l.lessonNumber}`)
    )?.chapterNumber;
    return chapter;
  }, [pathname]);

  const progressPercentage = useMemo(() => {
    return calculateProgress(completedPages, completedQuizzes);
  }, [completedPages, completedQuizzes, updateTrigger]);

  const isChapterCompleted = useCallback((chapter: typeof chapters[0]) => {
    const lessonsCompleted = chapter.lessons.every(lesson => {
      const globalPageNum = chapterLessonToGlobalPage(chapter.chapterNumber, lesson.lessonNumber);
      return completedPages.has(globalPageNum);
    });
    const quizCompleted = chapter.quiz ? completedQuizzes.has(chapter.chapterNumber) : true;
    return lessonsCompleted && quizCompleted;
  }, [completedPages, completedQuizzes]);

  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictedChapterName, setRestrictedChapterName] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChapterClick = (chapterNumber: number, chapterTitle: string) => {
    if (isChapterLocked(chapterNumber)) {
      setRestrictedChapterName(`${chapterTitle}`);
      setShowRestrictionModal(true);
    } else {
      setOpen(prev => ({ ...prev, [chapterNumber]: !prev[chapterNumber] }));
    }
  };

  const handleNavigation = useCallback(async (href: string, e: React.MouseEvent) => {
    const timeOnPage = getTimeOnCurrentPage();

    if (!isProfessorMode && timeOnPage >= 6000) {
      e.preventDefault();

      if (validateCurrentPage && typeof validateCurrentPage === 'function') {
        await validateCurrentPage();
      }
      
      setTimeout(() => {
        router.push(href);
      }, 100);
    }
  }, [getTimeOnCurrentPage, validateCurrentPage, router, isProfessorMode]);

  const handleDashboardReturn = useCallback(() => {
    if (!isProfessorMode) {
      fetch('/api/auth/time/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' } }).catch(console.error);
    }
  }, [isProfessorMode]);

  const handleTogglePageCompletion = (pageNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePageCompletion(pageNumber);
  };

  useEffect(() => {
    if (currentOpenChapter !== undefined) {
      setOpen(prev => ({ ...prev, [currentOpenChapter]: true }));
    }
  }, [currentOpenChapter]);

  useEffect(() => {
    if (!isProfessorMode) {
      const checkInterval = setInterval(async () => {
        const timeOnPage = getTimeOnCurrentPage();
        
        if (hasValidated) {
          clearInterval(checkInterval);
          return;
        }
        
        if (validateCurrentPage && typeof validateCurrentPage === 'function' && timeOnPage >= 6000) {
          await validateCurrentPage();
        }
      }, 10000);
      
      return () => clearInterval(checkInterval);
    }
  }, [isProfessorMode, getTimeOnCurrentPage, validateCurrentPage, hasValidated]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full text-white bg-gray-900">
        <div className="px-6 py-5 border-b border-gray-800 flex-shrink-0">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-gray-100 bg-gray-900">
      <div className="px-6 py-5 border-b border-gray-800 flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="text-blue-400" size={20} />
          <span>Sommaire du Cours</span>
        </h1>
        <div className="mt-3 space-y-1">
          <Link
            href={isProfessorMode ? "/professor" : "/dashboard"}
            onClick={handleDashboardReturn}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-200 hover:bg-gray-800"
          >
            <Home size={16} className="text-blue-400" />
            <span>Retour au tableau de bord</span>
          </Link>
          <Link
            href="/homework"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-200 hover:bg-gray-800"
          >
            <BookOpen size={16} className="text-orange-400" />
            <span>Mes devoirs Module A</span>
          </Link>
        </div>

        {!isProfessorMode && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span className="font-medium text-blue-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-grow overflow-y-auto touch-auto overscroll-contain scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-gray-700 scrollbar-track-transparent transition-colors">
        <ul className="space-y-1 px-3">
          {chapters.map((chapter) => {
            const chapterComplete = isChapterCompleted(chapter);
            const isLocked = isChapterLocked(chapter.chapterNumber);
            return (
              <li key={chapter.chapterNumber} className="rounded-lg">
                <button
                  onClick={() => handleChapterClick(chapter.chapterNumber, chapter.title)}
                  className={`w-full text-left px-3 py-3 flex justify-between items-center rounded-lg transition-colors ${
                    open[chapter.chapterNumber]
                      ? 'bg-gray-800 text-gray-100'
                      : 'hover:bg-gray-800 text-gray-200'
                  } ${chapterComplete && !isProfessorMode ? '!text-blue-400' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isLocked ? 'blur-sm opacity-75' : ''}`}>
                      {chapter.title}
                    </span>
                  </div>
                  {!isLocked && (open[chapter.chapterNumber] ? (
                    <ChevronDown className={`${chapterComplete && !isProfessorMode ? 'text-blue-400' : 'text-gray-400'}`} size={18} />
                  ) : (
                    <ChevronRight className={`${chapterComplete && !isProfessorMode ? 'text-blue-400' : 'text-gray-400'}`} size={18} />
                  ))}
                </button>

                {open[chapter.chapterNumber] && (
                  <ul className="ml-8 mt-1 space-y-1 py-1 border-l-2 border-gray-700">
                    {getVideoByChapter(chapter.chapterNumber) && (
                      <li key={`video-${chapter.chapterNumber}`}>
                        <Link
                          href={`/chapters/${chapter.chapterNumber}/video`}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            pathname === `/chapters/${chapter.chapterNumber}/video`
                              ? 'bg-gray-800 text-blue-400 border-l-2 border-blue-500'
                              : 'hover:bg-gray-800 text-gray-200'
                          }`}
                        >
                          <Play size={14} className="text-blue-400" />
                          <span className="font-semibold">Vidéo explicative</span>
                        </Link>
                      </li>
                    )}

                    {chapter.lessons.map((lesson) => {
                      const globalPageNum = chapterLessonToGlobalPage(chapter.chapterNumber, lesson.lessonNumber);
                      const isCompleted = completedPages.has(globalPageNum);
                      const lessonHref = `/chapters/${chapter.chapterNumber}/${lesson.lessonNumber}`;
                      return (
                        <li key={lesson.lessonNumber}>
                          <Link
                            href={lessonHref}
                            onClick={(e) => handleNavigation(lessonHref, e)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                              pathname === lessonHref
                                ? 'bg-gray-800 text-blue-400 border-l-2 border-blue-500'
                                : 'hover:bg-gray-800 text-gray-200'
                            }`}
                          >
                            {!isProfessorMode && (
                              <button
                                onClick={(e) => handleTogglePageCompletion(globalPageNum, e)}
                                className="flex-shrink-0"
                              >
                                {isCompleted ? (
                                  <CheckCircle className="text-green-500" size={14} />
                                ) : (
                                  <Circle className="text-gray-500 hover:text-green-400" size={14} />
                                )}
                              </button>
                            )}
                            <span>{lesson.title}</span>
                          </Link>
                        </li>
                      );
                    })}

                    {chapter.quiz && chapter.quiz.length > 0 && (
                      <li key={`quiz-${chapter.chapterNumber}`}>
                        <Link
                          href={`/chapters/${chapter.chapterNumber}/quiz`}
                          onClick={(e) => handleNavigation(`/chapters/${chapter.chapterNumber}/quiz`, e)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            pathname === `/chapters/${chapter.chapterNumber}/quiz`
                              ? 'bg-gray-800 text-blue-400 border-l-2 border-blue-500'
                              : 'hover:bg-gray-800 text-gray-200'
                          }`}
                        >
                          {!isProfessorMode && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleQuizCompletion(chapter.chapterNumber);
                              }}
                              className="flex-shrink-0"
                            >
                              {completedQuizzes.has(chapter.chapterNumber) ? (
                                <CheckCircle className="text-green-500" size={14} />
                              ) : (
                                <Circle className="text-gray-500 hover:text-green-400" size={14} />
                              )}
                            </button>
                          )}
                          <BookOpen size={14} className="text-blue-400" />
                          <span className="font-semibold">Quiz</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {!isProfessorMode && (
        <div className="border-t border-gray-800 px-6 py-3 text-xs text-gray-400 flex justify-between">
          <span>Pages complétées: {completedPages.size}</span>
          <span>Quiz complétés: {completedQuizzes.size}</span>
        </div>
      )}
    </div>
  );
}
