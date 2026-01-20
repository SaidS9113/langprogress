import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { sendChapterHomeworkEmail } from '@/lib/email';
import { chapters, chapterLessonToGlobalPage } from '@/lib/chapters';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Devoirs par chapitre (contenu à envoyer par email)
const CHAPTER_HOMEWORK: Record<number, string> = {
  1: `Exercice 1: Répondez aux questions suivantes sur le module 1.
  
1. Qu'avez-vous appris de nouveau dans ce chapitre ?
2. Quels concepts vous semblent les plus importants ?
3. Comment comptez-vous appliquer ces connaissances ?

Exercice 2: Pratiquez les notions vues pendant 15 minutes.`,

  2: `Exercice 1: Résumez les points clés du chapitre 2.

1. Listez 3 concepts importants de ce chapitre.
2. Expliquez-les avec vos propres mots.
3. Donnez un exemple pour chaque concept.`,

  3: `Exercice 1: Application pratique du chapitre 3.

1. Réalisez les exercices pratiques du chapitre.
2. Notez vos difficultés rencontrées.
3. Proposez des solutions pour les surmonter.`,
};

// Fonction pour vérifier si un chapitre est complété
function isChapterComplete(
  chapterNumber: number,
  completedPages: number[],
  completedQuizzes: number[],
  module: 'A' | 'B' = 'A'
): boolean {
  const chapter = chapters.find(c => c.chapterNumber === chapterNumber && (c.module === module || !c.module));
  if (!chapter) return false;

  // Convert lesson numbers to global page numbers for progress check
  const allLessonsCompleted = chapter.lessons.every(lesson => {
    const globalPageNum = chapterLessonToGlobalPage(chapterNumber, lesson.lessonNumber);
    return completedPages.includes(globalPageNum);
  });
  const quizCompleted = chapter.quiz ? completedQuizzes.includes(chapterNumber) : true;

  return allLessonsCompleted && quizCompleted;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { type, pageNumber, chapterNumber, module = 'A' } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (type === 'page') {
      const fieldName = module === 'B' ? 'completedPagesB' : 'completedPages';
      const currentPages: number[] = JSON.parse(
        (module === 'B' ? user.completedPagesB : user.completedPages) || '[]'
      );

      if (!currentPages.includes(pageNumber)) {
        currentPages.push(pageNumber);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            [fieldName]: JSON.stringify(currentPages),
          },
        });

        // Vérifier si le chapitre est maintenant complet et envoyer le devoir par email
        const currentQuizzes: number[] = JSON.parse(
          (module === 'B' ? user.completedQuizzesB : user.completedQuizzes) || '[]'
        );

        // Déterminer le numéro du chapitre à partir du pageNumber
        const chapterNum = Math.ceil(pageNumber / 3);

        if (isChapterComplete(chapterNum, currentPages, currentQuizzes, module as 'A' | 'B')) {
          const chapter = chapters.find(c => c.chapterNumber === chapterNum);
          const homeworkTitle = chapter?.title || `Chapitre ${chapterNum}`;
          
          try {
            await sendChapterHomeworkEmail(
              user.email,
              chapterNum,
              homeworkTitle
            );
            console.log(`[PROGRESS] Email devoir envoyé pour chapitre ${chapterNum} à ${user.email}`);
          } catch (emailError) {
            console.error('[PROGRESS] Erreur envoi email devoir:', emailError);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Page ${pageNumber} validée`,
          completedPages: currentPages,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Page déjà validée',
          completedPages: currentPages,
        });
      }
    } else if (type === 'quiz') {
      const fieldName = module === 'B' ? 'completedQuizzesB' : 'completedQuizzes';
      const currentQuizzes: number[] = JSON.parse(
        (module === 'B' ? user.completedQuizzesB : user.completedQuizzes) || '[]'
      );

      if (!currentQuizzes.includes(chapterNumber)) {
        currentQuizzes.push(chapterNumber);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            [fieldName]: JSON.stringify(currentQuizzes),
          },
        });

        // Vérifier si le chapitre est maintenant complet et envoyer le devoir par email
        const pagesFieldName = module === 'B' ? 'completedPagesB' : 'completedPages';
        const currentPages: number[] = JSON.parse(
          (module === 'B' ? user.completedPagesB : user.completedPages) || '[]'
        );

        if (isChapterComplete(chapterNumber, currentPages, currentQuizzes, module as 'A' | 'B')) {
          const chapter = chapters.find(c => c.chapterNumber === chapterNumber);
          const homeworkTitle = chapter?.title || `Chapitre ${chapterNumber}`;
          
          try {
            await sendChapterHomeworkEmail(
              user.email,
              chapterNumber,
              homeworkTitle
            );
            console.log(`[PROGRESS] Email devoir envoyé pour chapitre ${chapterNumber} à ${user.email}`);
          } catch (emailError) {
            console.error('[PROGRESS] Erreur envoi email devoir:', emailError);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Quiz du chapitre ${chapterNumber} validé`,
          completedQuizzes: currentQuizzes,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Quiz déjà validé',
          completedQuizzes: currentQuizzes,
        });
      }
    } else if (type === 'remove-page') {
      const fieldName = module === 'B' ? 'completedPagesB' : 'completedPages';
      const currentPages: number[] = JSON.parse(
        (module === 'B' ? user.completedPagesB : user.completedPages) || '[]'
      );

      const index = currentPages.indexOf(pageNumber);
      if (index > -1) {
        currentPages.splice(index, 1);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            [fieldName]: JSON.stringify(currentPages),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Page ${pageNumber} retirée`,
        completedPages: currentPages,
      });
    } else if (type === 'remove-quiz') {
      const fieldName = module === 'B' ? 'completedQuizzesB' : 'completedQuizzes';
      const currentQuizzes: number[] = JSON.parse(
        (module === 'B' ? user.completedQuizzesB : user.completedQuizzes) || '[]'
      );

      const index = currentQuizzes.indexOf(chapterNumber);
      if (index > -1) {
        currentQuizzes.splice(index, 1);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            [fieldName]: JSON.stringify(currentQuizzes),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Quiz du chapitre ${chapterNumber} retiré`,
        completedQuizzes: currentQuizzes,
      });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch (error) {
    console.error('Progress validate error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
