import { SectionHeader } from './section-header';
import { QuestionComponent } from './question-component';
import type { Section } from '../types/question';
import { useMemo, useRef, useEffect, useState } from 'react';
import type { ExportSettings } from '../contexts/export-settings-context';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { Input } from '@/components/ui/input';

interface PaperSetProps {
    sections: Section[];
    setNumber: number;
    settings: ExportSettings;
    className?: string;
    // eslint-disable-next-line
    instructions?: any;
}

export function PaperSet({ sections, setNumber, settings, instructions }: PaperSetProps) {
    const [heights, setHeights] = useState({
        initialHeader: 0,
        instructionsHeight: 0,
        sectionHeader: 0,
        questions: [] as number[],
    });
    const { instituteDetails } = useInstituteDetailsStore();

    const initialHeaderRef = useRef<HTMLDivElement>(null);
    const instructionsRef = useRef<HTMLDivElement>(null);
    const sectionHeaderRef = useRef<HTMLDivElement>(null);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Constants for page layout (in mm)
    const PAGE_HEIGHT = 297; // A4 height
    const PAGE_MARGIN = 20; // Top and bottom margins
    const QUESTION_SPACING = 10; // Space between questions
    const ROUGH_WORK_HEIGHT =
        settings.spaceForRoughWork === 'none'
            ? 0
            : settings.roughWorkSize === 'small'
              ? 50
              : settings.roughWorkSize === 'large'
                ? 150
                : 100;

    useEffect(() => {
        const measureHeight = (element: HTMLElement | null): number => {
            if (!element) return 0;
            const styles = window.getComputedStyle(element);
            const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
            return (element.offsetHeight + margin) / 3.7795275591; // Convert px to mm
        };

        const newHeights = {
            initialHeader: measureHeight(initialHeaderRef.current),
            instructionsHeight: measureHeight(instructionsRef.current),
            sectionHeader: measureHeight(sectionHeaderRef.current),
            questions: questionRefs.current.map(measureHeight),
        };

        setHeights(newHeights);
    }, [sections, settings]);

    const renderHeader = (isInstructionPage = false) => (
        <div ref={initialHeaderRef} className="mb-6">
            {settings.showInstitutionLetterhead && (
                <div className="mb-6 border-b pb-4 text-center">
                    {settings.customLetterheadImage ? (
                        <img
                            src={settings.customLetterheadImage}
                            alt="Letterhead"
                            className="mx-auto mb-2 max-h-24"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{instituteDetails?.institute_name}</h1>
                    )}
                </div>
            )}

            {settings.includeQuestionSetCode && (
                <div className="mb-4 text-right text-sm text-gray-600">
                    Set Code: {String.fromCharCode(65 + setNumber)}
                </div>
            )}

            {settings.includeCustomInputFields && settings.customFields && (
                <div className="mb-6 space-y-4">
                    {settings.customFields
                        .filter((field) => field.enabled)
                        .map((field, index) => (
                            <div
                                key={index}
                                className="mb-4 flex items-center justify-between gap-4"
                            >
                                <label className="w-1/4 text-sm font-medium">{field.label}:</label>
                                <div className="w-3/4">
                                    {field.type === 'blank' && (
                                        <div className="h-8 border-b border-gray-300" />
                                    )}
                                    {field.type === 'blocks' && (
                                        <div className="flex">
                                            {[...Array(field.numberOfBlocks || 10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="size-6 border border-gray-300"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {field.type === 'input' && (
                                        <Input className="w-full" readOnly />
                                    )}
                                    {field.type === 'checkbox' && (
                                        <div className="size-6 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {isInstructionPage && instructions && (
                <div ref={instructionsRef} className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold">Instructions</h2>
                    <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: instructions.content,
                        }}
                    />
                </div>
            )}
        </div>
    );

    const renderRoughWork = () => (
        <div className="mt-auto">
            <h3 className="mb-2 text-lg font-semibold">Space for Rough Work</h3>
            <div
                className="rounded-lg border-t-2 border-dashed"
                style={{ height: `${ROUGH_WORK_HEIGHT}mm` }}
            />
        </div>
    );

    const pages = useMemo(() => {
        const pages: JSX.Element[] = [];
        let pageNumber = 1;

        const calculateAvailableHeight = (pageHeight: number) => {
            return (
                pageHeight -
                2 * PAGE_MARGIN -
                (settings.spaceForRoughWork !== 'none' ? ROUGH_WORK_HEIGHT : 0)
            );
        };

        const createPage = (content: JSX.Element[]) => (
            <div key={`page-${pageNumber}`} className="page relative bg-white">
                <div className="flex h-full flex-col">
                    <div className="grow">{content}</div>
                    {settings.spaceForRoughWork !== 'none' && renderRoughWork()}
                </div>
                {settings.showPageNumbers && (
                    <div
                        className="absolute bottom-4 text-sm text-gray-500"
                        style={{
                            left:
                                settings.pageNumbersPosition === 'center'
                                    ? '50%'
                                    : settings.pageNumbersPosition === 'left'
                                      ? '1rem'
                                      : 'auto',
                            right: settings.pageNumbersPosition === 'right' ? '1rem' : 'auto',
                        }}
                    >
                        {pageNumber}
                    </div>
                )}
            </div>
        );

        // First page with instructions if enabled
        if (settings.showFirstPageInstructions) {
            pages.push(createPage([renderHeader(true)]));
            pageNumber++;
        }

        // Process each section
        sections.forEach((section, sectionIndex) => {
            let currentContent: JSX.Element[] = [];
            let availableHeight = calculateAvailableHeight(PAGE_HEIGHT);

            // Add header for first content page
            if (!settings.showFirstPageInstructions && sectionIndex === 0) {
                currentContent.push(renderHeader(false));
                availableHeight -= heights.initialHeader;
            }

            // Add section header
            const sectionHeader = (
                <div ref={sectionHeaderRef} key={`section-${section.id}-header`}>
                    <SectionHeader
                        title={section.title}
                        description={section.description}
                        totalMarks={section.totalMarks}
                        duration={section.duration}
                        showDuration={settings.showSectionDuration}
                        showMarks={settings.showMarksPerQuestion}
                    />
                </div>
            );
            currentContent.push(sectionHeader);
            availableHeight -= heights.sectionHeader;

            // Calculate questions per column
            const columns = settings.columnsPerPage || 1;
            let currentQuestions: JSX.Element[][] = Array(columns)
                .fill([])
                .map(() => []);
            let currentColumn = 0;
            let columnHeights = Array(columns).fill(0);

            section.questions.forEach((question, questionIndex) => {
                const questionHeight = heights.questions[questionIndex] || 0;

                // Check if question fits in current column
                if (
                    columnHeights[currentColumn] + questionHeight + QUESTION_SPACING <=
                    availableHeight
                ) {
                    // Add question to current column
                    // @ts-expect-error : Object is possibly 'undefined'
                    currentQuestions[currentColumn].push(
                        <div
                            key={question.question_id}
                            ref={(el) => (questionRefs.current[questionIndex] = el)}
                            className="mb-4"
                            style={{
                                fontSize:
                                    settings.fontSize === 'small'
                                        ? '12px'
                                        : settings.fontSize === 'large'
                                          ? '16px'
                                          : '14px',
                            }}
                        >
                            <QuestionComponent
                                question={question}
                                questionNumber={questionIndex + 1}
                                showMarks={settings.showMarksPerQuestion}
                                showCheckboxes={settings.showCheckboxesBeforeOptions}
                                answerSpacing={
                                    settings.answerSpacings?.[question.question_id] || 10
                                }
                            />
                        </div>
                    );
                    columnHeights[currentColumn] += questionHeight + QUESTION_SPACING;
                } else {
                    // Move to next column or create new page
                    if (currentColumn < columns - 1) {
                        currentColumn++;
                        // @ts-expect-error : Object is possibly 'undefined'
                        currentQuestions[currentColumn].push(
                            <div
                                key={question.question_id}
                                ref={(el) => (questionRefs.current[questionIndex] = el)}
                                className="mb-4"
                                style={{
                                    fontSize:
                                        settings.fontSize === 'small'
                                            ? '12px'
                                            : settings.fontSize === 'large'
                                              ? '16px'
                                              : '14px',
                                }}
                            >
                                <QuestionComponent
                                    question={question}
                                    questionNumber={questionIndex + 1}
                                    showMarks={settings.showMarksPerQuestion}
                                    showCheckboxes={settings.showCheckboxesBeforeOptions}
                                    answerSpacing={
                                        settings.answerSpacings?.[question.question_id] || 10
                                    }
                                />
                            </div>
                        );
                        columnHeights[currentColumn] = questionHeight + QUESTION_SPACING;
                    } else {
                        // Create new page
                        const questionsGrid = (
                            <div
                                className={`grid gap-8 ${
                                    columns === 2
                                        ? 'grid-cols-2'
                                        : columns === 3
                                          ? 'grid-cols-3'
                                          : ''
                                }`}
                            >
                                {currentQuestions.map((colQuestions, colIndex) => (
                                    <div key={colIndex} className="flex flex-col">
                                        {colQuestions}
                                    </div>
                                ))}
                            </div>
                        );
                        currentContent.push(questionsGrid);
                        pages.push(createPage(currentContent));
                        pageNumber++;

                        // Reset for new page
                        currentContent = [];
                        currentQuestions = Array(columns)
                            .fill([])
                            .map(() => []);
                        columnHeights = Array(columns).fill(0);
                        currentColumn = 0;
                        availableHeight = calculateAvailableHeight(PAGE_HEIGHT);

                        // Add current question to new page
                        // @ts-expect-error : Object is possibly 'undefined'
                        currentQuestions[currentColumn].push(
                            <div
                                key={question.question_id}
                                ref={(el) => (questionRefs.current[questionIndex] = el)}
                                className="mb-4"
                                style={{
                                    fontSize:
                                        settings.fontSize === 'small'
                                            ? '12px'
                                            : settings.fontSize === 'large'
                                              ? '16px'
                                              : '14px',
                                }}
                            >
                                <QuestionComponent
                                    question={question}
                                    questionNumber={questionIndex + 1}
                                    showMarks={settings.showMarksPerQuestion}
                                    showCheckboxes={settings.showCheckboxesBeforeOptions}
                                    answerSpacing={
                                        settings.answerSpacings?.[question.question_id] || 10
                                    }
                                />
                            </div>
                        );
                        columnHeights[currentColumn] = questionHeight + QUESTION_SPACING;
                    }
                }
            });

            // Add remaining questions
            if (currentQuestions.some((col) => col.length > 0)) {
                const questionsGrid = (
                    <div
                        className={`grid gap-8 ${
                            columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : ''
                        }`}
                    >
                        {currentQuestions.map((colQuestions, colIndex) => (
                            <div key={colIndex} className="flex flex-col">
                                {colQuestions}
                            </div>
                        ))}
                    </div>
                );
                currentContent.push(questionsGrid);
                // @ts-expect-error : Expected 1 arguments, but got 2
                pages.push(createPage(currentContent, true));
                pageNumber++;
            }
        });

        return pages;
    }, [sections, settings, heights]);

    return <div className="space-y-4">{pages}</div>;
}
