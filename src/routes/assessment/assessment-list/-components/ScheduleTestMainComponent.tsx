import { Helmet } from 'react-helmet';
import { Tabs } from '@/components/ui/tabs';
import { useEffect, useState, useCallback } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { ScheduleTestFilters } from './ScheduleTestFilters';
import {
    useFilterDataForAssesment,
    useFilterDataForAssesmentInitData,
} from '../-utils.ts/useFiltersData';
import { ScheduleTestSearchComponent } from './ScheduleTestSearchComponent';
import { MyFilterOption } from '@/types/assessments/my-filter';
import { ScheduleTestHeaderDescription } from './ScheduleTestHeaderDescription';
import ScheduleTestTabList from './ScheduleTestTabList';
import ScheduleTestFilterButtons from './ScheduleTestFilterButtons';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import ScheduleTestLists from './ScheduleTestLists';
import {
    getAssessmentListWithFilters,
    getInitAssessmentDetails,
} from '../-services/assessment-services';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { ScheduleTestTab } from '@/types/assessments/assessment-list';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { NoCourseDialog } from '@/components/common/students/no-course-dialog';
import { useRefetchStoreAssessment } from '../-global-store/refetch-store';
import { Route } from '..';
import { useNavigate } from '@tanstack/react-router';
import { getCourseSubjects } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';

export interface SelectedQuestionPaperFilters {
    name: string | { id: string; name: string }[];
    batch_ids: MyFilterOption[];
    subjects_ids: MyFilterOption[];
    tag_ids: MyFilterOption[];
    get_live_assessments: boolean;
    get_passed_assessments: boolean;
    get_upcoming_assessments: boolean;
    institute_ids: string[];
    assessment_statuses: MyFilterOption[];
    assessment_modes: MyFilterOption[];
    access_statuses: MyFilterOption[];
    evaluation_types: MyFilterOption[];
}

const SafeRouteSearch = () => {
    try {
        return Route.useSearch();
    } catch (error) {
        // Return a default object if the hook fails
        return { selectedTab: 'liveTests' };
    }
};

export const ScheduleTestMainComponent = ({
    isCourseOutline = false,
    batchId,
    showBatchFilter = true,
}: {
    isCourseOutline?: boolean;
    batchId?: string;
    showBatchFilter?: boolean;
}) => {
    const navigate = useNavigate();

    // Always call Route.useSearch() regardless of props
    const routeSearchParams = SafeRouteSearch();

    const searchParams = !isCourseOutline ? routeSearchParams : { selectedTab: 'liveTests' };

    // Set state based on the derived value
    const [selectedTab, setSelectedTab] = useState(searchParams.selectedTab ?? 'liveTests');
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const [isOpen, setIsOpen] = useState(false);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const { setNavHeading } = useNavHeadingStore();
    const { data: initData } = useSuspenseQuery(useInstituteQuery());
    const { data: initAssessmentData } = useSuspenseQuery(getInitAssessmentDetails(initData?.id));
    const { BatchesFilterData, SubjectFilterData } = useFilterDataForAssesment(initData);
    const { AssessmentTypeData, ModeData, EvaluationTypeData } =
        useFilterDataForAssesmentInitData(initAssessmentData);
    const { getCourseFromPackage, getDetailsFromPackageSessionId } = useInstituteDetailsStore();
    const setHandleRefetchDataAssessment = useRefetchStoreAssessment(
        (state) => state.setHandleRefetchDataAssessment
    );

    const [selectedQuestionPaperFilters, setSelectedQuestionPaperFilters] =
        useState<SelectedQuestionPaperFilters>({
            name: '',
            // If in course outline mode and batchId is provided, pre-select it
            batch_ids: isCourseOutline && batchId ? [{ id: batchId, name: '' }] : [],
            subjects_ids: [],
            tag_ids: [],
            get_live_assessments: false,
            get_passed_assessments: false,
            get_upcoming_assessments: false,
            institute_ids: [initData?.id || ''],
            assessment_statuses: [],
            assessment_modes: [],
            access_statuses: [],
            evaluation_types: [],
        });

    const [scheduleTestTabsData, setScheduleTestTabsData] = useState<ScheduleTestTab[]>([
        {
            value: 'liveTests',
            message: 'No tests are currently live.',
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: 'upcomingTests',
            message: 'No upcoming tests scheduled.',
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: 'previousTests',
            message: 'No previous tests available.',
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
        {
            value: 'draftTests',
            message: 'No draft tests available.',
            data: {
                content: [],
                last: false,
                page_no: 1,
                page_size: 10,
                total_elements: 0,
                total_pages: 0,
            },
        },
    ]);

    const [searchText, setSearchText] = useState('');
    const [pageNo, setPageNo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (filterKey: string, selectedItems: MyFilterOption[]) => {
        setSelectedQuestionPaperFilters((prev) => {
            const updatedFilters = { ...prev, [filterKey]: selectedItems };
            return updatedFilters;
        });
    };

    const clearSearch = () => {
        setSearchText('');
        selectedQuestionPaperFilters['name'] = '';
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                get_live_assessments: selectedTab === 'liveTests' ? true : false,
                get_passed_assessments: selectedTab === 'previousTests' ? true : false,
                get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
                assessment_statuses: [
                    {
                        id: '0',
                        name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                    },
                ],
                name: '',
            },
        });
    };

    const handleSearch = (searchValue: string) => {
        setSearchText(searchValue);
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                get_live_assessments: selectedTab === 'liveTests' ? true : false,
                get_passed_assessments: selectedTab === 'previousTests' ? true : false,
                get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
                assessment_statuses: [
                    {
                        id: '0',
                        name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                    },
                ],
                name: [{ id: searchValue, name: searchValue }],
            },
        });
    };

    const handleResetFilters = () => {
        setSelectedQuestionPaperFilters({
            name: '',
            // Keep the batch selection if in course outline mode
            batch_ids: isCourseOutline && batchId ? [{ id: batchId, name: '' }] : [],
            subjects_ids: [],
            tag_ids: [],
            get_live_assessments: false,
            get_passed_assessments: false,
            get_upcoming_assessments: false,
            institute_ids: [initData?.id || ''],
            assessment_statuses: [],
            assessment_modes: [],
            access_statuses: [],
            evaluation_types: [],
        });
        setSearchText('');
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                name: '',
                batch_ids: [],
                subjects_ids: [],
                tag_ids: [],
                get_live_assessments: selectedTab === 'liveTests' ? true : false,
                get_passed_assessments: selectedTab === 'previousTests' ? true : false,
                get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
                institute_ids: [initData?.id || ''],
                evaluation_types: [],
                assessment_statuses: [
                    {
                        id: '0',
                        name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                    },
                ],
                assessment_modes: [],
                access_statuses: [],
            },
        });
    };

    const getFilteredData = useMutation({
        mutationFn: ({
            pageNo,
            pageSize,
            instituteId,
            data,
        }: {
            pageNo: number;
            pageSize: number;
            instituteId: string | undefined;
            data: SelectedQuestionPaperFilters;
        }) => getAssessmentListWithFilters(pageNo, pageSize, instituteId, data),
        onSuccess: (data) => {
            if (selectedTab === 'liveTests') {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === 'liveTests' ? { ...tab, data: data } : tab
                    )
                );
            } else if (selectedTab === 'upcomingTests') {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === 'upcomingTests' ? { ...tab, data: data } : tab
                    )
                );
            } else if (selectedTab === 'previousTests') {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === 'previousTests' ? { ...tab, data: data } : tab
                    )
                );
            } else {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === 'draftTests' ? { ...tab, data: data } : tab
                    )
                );
            }
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleSubmitFilters = () => {
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                get_live_assessments: selectedTab === 'liveTests' ? true : false,
                get_passed_assessments: selectedTab === 'previousTests' ? true : false,
                get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
                assessment_statuses: [
                    {
                        id: '0',
                        name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                    },
                ],
            },
        });
    };

    const handleRefetchData = () => {
        getFilteredData.mutate({
            pageNo: pageNo,
            pageSize: 10,
            instituteId: INSTITUTE_ID,
            data: {
                ...selectedQuestionPaperFilters,
                get_live_assessments: selectedTab === 'liveTests' ? true : false,
                get_passed_assessments: selectedTab === 'previousTests' ? true : false,
                get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
                assessment_statuses: [
                    {
                        id: '0',
                        name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                    },
                ],
            },
        });
    };

    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
        getAssessmentListWithFilters(newPage, 10, INSTITUTE_ID, {
            ...selectedQuestionPaperFilters,
            get_live_assessments: selectedTab === 'liveTests' ? true : false,
            get_passed_assessments: selectedTab === 'previousTests' ? true : false,
            get_upcoming_assessments: selectedTab === 'upcomingTests' ? true : false,
            assessment_statuses: [
                {
                    id: '0',
                    name: selectedTab === 'draftTests' ? 'DRAFT' : 'PUBLISHED',
                },
            ],
        })
            .then((data) => {
                setScheduleTestTabsData((prevTabs) =>
                    prevTabs.map((tab) =>
                        tab.value === selectedTab ? { ...tab, data: data } : tab
                    )
                );
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    };

    // Make sure getSubjectsByBatchId is defined outside any effect or function
    const getSubjectsByBatchId = useCallback(
        (batchId: string) => {
            const batch = getDetailsFromPackageSessionId({ packageSessionId: batchId });
            const subjects = getCourseSubjects(
                batch?.package_dto?.id ?? '',
                batch?.session?.id ?? '',
                batch?.level?.id ?? ''
            );
            return subjects.map((subject) => ({
                name: subject.subject_name,
                id: subject.id,
            }));
        },
        [getDetailsFromPackageSessionId]
    );

    useEffect(() => {
        setIsLoading(true);

        const timeoutId = setTimeout(() => {
            // Define base filters that include batch_id if in course outline mode
            const baseFilters = {
                ...selectedQuestionPaperFilters,
                // When in course outline mode, always include the batchId
                batch_ids:
                    isCourseOutline && batchId
                        ? [{ id: batchId, name: '' }]
                        : selectedQuestionPaperFilters.batch_ids,
            };

            const fetchLiveTests = getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...baseFilters,
                assessment_statuses: [{ id: '0', name: 'PUBLISHED' }],
                get_live_assessments: true,
                get_passed_assessments: false,
                get_upcoming_assessments: false,
            });

            const fetchUpcomingTests = getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...baseFilters,
                assessment_statuses: [{ id: '0', name: 'PUBLISHED' }],
                get_live_assessments: false,
                get_passed_assessments: false,
                get_upcoming_assessments: true,
            });

            const fetchPreviousTests = getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...baseFilters,
                assessment_statuses: [{ id: '0', name: 'PUBLISHED' }],
                get_live_assessments: false,
                get_passed_assessments: true,
                get_upcoming_assessments: false,
            });

            const fetchDraftTests = getAssessmentListWithFilters(pageNo, 10, INSTITUTE_ID, {
                ...baseFilters,
                assessment_statuses: [{ id: '0', name: 'DRAFT' }],
                get_live_assessments: false,
                get_passed_assessments: false,
                get_upcoming_assessments: false,
            });

            Promise.all([fetchLiveTests, fetchUpcomingTests, fetchPreviousTests, fetchDraftTests])
                .then(([liveData, upcomingData, previousData, draftData]) => {
                    setScheduleTestTabsData((prevTabs) =>
                        prevTabs.map((tab) => {
                            if (tab.value === 'liveTests') return { ...tab, data: liveData };
                            if (tab.value === 'upcomingTests')
                                return { ...tab, data: upcomingData };
                            if (tab.value === 'previousTests')
                                return { ...tab, data: previousData };
                            if (tab.value === 'draftTests') return { ...tab, data: draftData };
                            return tab;
                        })
                    );
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 500); // Delay execution by 500ms

        return () => {
            clearTimeout(timeoutId); // Cleanup to prevent duplicate calls
        };
    }, [isCourseOutline, batchId]);

    useEffect(() => {
        if (!isCourseOutline) setNavHeading(<h1 className="text-lg">Assessments List</h1>);
    }, []);

    useEffect(() => {
        const courseList = getCourseFromPackage();
        if (courseList.length === 0) {
            setIsOpen(true);
        }
    }, []);

    useEffect(() => {
        if (!isCourseOutline)
            navigate({
                to: '/assessment/assessment-list',
                search: {
                    selectedTab: selectedTab,
                },
            });
    }, [selectedTab, isCourseOutline, navigate]);

    // Define the handleRefetchData function here
    useEffect(() => {
        setHandleRefetchDataAssessment(handleRefetchData);
    }, [setHandleRefetchDataAssessment]);

    if (isLoading) return <DashboardLoader />;
    return (
        <>
            <Helmet>
                <title>Schedule Tests</title>
                <meta
                    name="description"
                    content="This page shows the list of all the schedules tests and also an assessment can be scheduled here."
                />
            </Helmet>
            <ScheduleTestHeaderDescription isCourseOutline />
            <div className="flex flex-col gap-4">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <ScheduleTestTabList
                        selectedTab={selectedTab}
                        scheduleTestTabsData={scheduleTestTabsData}
                    />
                    <div className="my-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Only show batch filter if not in course outline mode or explicitly enabled */}
                            {(!isCourseOutline || showBatchFilter) && (
                                <ScheduleTestFilters
                                    label="Batches"
                                    data={BatchesFilterData}
                                    selectedItems={selectedQuestionPaperFilters['batch_ids'] || []}
                                    onSelectionChange={(items) =>
                                        handleFilterChange('batch_ids', items)
                                    }
                                />
                            )}
                            <ScheduleTestFilters
                                label={getTerminology(ContentTerms.Subjects, SystemTerms.Subjects)}
                                data={
                                    isCourseOutline && batchId
                                        ? getSubjectsByBatchId(batchId)
                                        : SubjectFilterData
                                }
                                selectedItems={selectedQuestionPaperFilters['subjects_ids'] || []}
                                onSelectionChange={(items) =>
                                    handleFilterChange('subjects_ids', items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Mode"
                                data={ModeData}
                                selectedItems={
                                    selectedQuestionPaperFilters['assessment_modes'] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange('assessment_modes', items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Type"
                                data={AssessmentTypeData}
                                selectedItems={
                                    selectedQuestionPaperFilters['access_statuses'] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange('access_statuses', items)
                                }
                            />
                            <ScheduleTestFilters
                                label="Evaluation"
                                data={EvaluationTypeData}
                                selectedItems={
                                    selectedQuestionPaperFilters['evaluation_types'] || []
                                }
                                onSelectionChange={(items) =>
                                    handleFilterChange('evaluation_types', items)
                                }
                            />
                            <ScheduleTestFilterButtons
                                selectedQuestionPaperFilters={selectedQuestionPaperFilters}
                                handleSubmitFilters={handleSubmitFilters}
                                handleResetFilters={handleResetFilters}
                            />
                        </div>
                        <ScheduleTestSearchComponent
                            onSearch={handleSearch}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            clearSearch={clearSearch}
                        />
                    </div>
                    {scheduleTestTabsData.map((tab, index) => (
                        <ScheduleTestLists
                            key={index}
                            tab={tab}
                            pageNo={pageNo}
                            handlePageChange={handlePageChange}
                            selectedTab={selectedTab}
                            handleRefetchData={handleRefetchData}
                        />
                    ))}
                </Tabs>
            </div>
            <NoCourseDialog type={'Creating assessment'} isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};
