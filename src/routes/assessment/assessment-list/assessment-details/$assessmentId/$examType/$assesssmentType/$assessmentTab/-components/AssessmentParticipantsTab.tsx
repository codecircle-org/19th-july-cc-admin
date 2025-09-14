import { DashboardLoader } from '@/components/core/dashboard-loader';
import { MyButton } from '@/components/design-system/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Copy, DownloadSimple } from 'phosphor-react';
import QRCode from 'react-qr-code';
import { Route } from '..';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { getAssessmentDetails } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services';
import {
    copyToClipboard,
    handleDownloadQRCode,
    transformBatchDataEdit,
} from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import { getBatchDetails } from '../-utils/helper';
import { BASE_URL_LEARNER_DASHBOARD } from '@/constants/urls';
import { AssessmentParticipantsList } from './AssessmentParticipantsList';
import { AssessmentParticipantsIndividualList } from './AssessmentParticipantsIndividualList';

const AssessmentParticipantsTab = () => {
    const { assessmentId, examType } = Route.useParams();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { batches_for_sessions } = instituteDetails || {};
    const transformedBatches = transformBatchDataEdit(batches_for_sessions || []);
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        })
    );

    const assignedBatchDetails = getBatchDetails(
        transformedBatches,
        assessmentDetails[2]?.saved_data.pre_batch_registrations
    );

    if (isLoading) return <DashboardLoader />;
    return (
        <>
            <div className="mt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold">Assessment Participants</h1>
                    <div className="flex flex-col gap-4">
                        {(assessmentDetails[2]?.saved_data?.pre_user_registrations ?? 0) > 0 && (
                            <div className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2">
                                <h1 className="text-sm">
                                    {assessmentDetails[2]?.saved_data?.pre_user_registrations}{' '}
                                    participants (Internal)
                                </h1>
                                <AssessmentParticipantsIndividualList type="internal" />
                            </div>
                        )}
                        {/* <div className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2">
                            <h1 className="text-sm">
                                {assessmentDetails[2]?.saved_data?.open_user_registrations}{" "}
                                participants (External)
                            </h1>
                            <AssessmentParticipantsIndividualList type="external" />
                        </div> */}
                        {assignedBatchDetails?.map((batch, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-md border border-primary-200 bg-primary-50 px-4 py-2"
                            >
                                <h1 className="text-sm">{batch.name}</h1>
                                <AssessmentParticipantsList batchId={batch.id} />
                            </div>
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="flex items-start justify-start gap-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-sm font-semibold">Join Link</h1>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <span className="rounded-md border px-3 py-2 text-sm">
                                    {`${BASE_URL_LEARNER_DASHBOARD}/register?code=${assessmentDetails[0]?.saved_data.assessment_url}`}
                                </span>
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="h-9 min-w-10"
                                    onClick={() =>
                                        copyToClipboard(
                                            `${BASE_URL_LEARNER_DASHBOARD}/register?code=${assessmentDetails[0]?.saved_data.assessment_url}` ||
                                                ''
                                        )
                                    }
                                >
                                    <Copy size={32} />
                                </MyButton>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start gap-2">
                        <h1 className="text-sm font-semibold">QR Code</h1>
                        <div className="flex items-center gap-8">
                            <div className="flex items-start gap-4">
                                <QRCode
                                    value={
                                        `${BASE_URL_LEARNER_DASHBOARD}/register?code=${assessmentDetails[0]?.saved_data.assessment_url}` ||
                                        ''
                                    }
                                    className="size-16"
                                    id={`qr-code-svg-participants`}
                                />
                                <MyButton
                                    type="button"
                                    scale="small"
                                    buttonType="secondary"
                                    className="h-9 min-w-10"
                                    onClick={() => handleDownloadQRCode('qr-code-svg-participants')}
                                >
                                    <DownloadSimple size={32} />
                                </MyButton>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                {/* will be added later
                {assessmentDetails[2]?.saved_data?.notifications?.participant_show_leaderboard && (
                    <div className="flex w-1/2 items-center justify-between">
                        <p className="text-sm font-semibold">Show Leaderboard to Participants</p>
                        <CheckCircle size={22} weight="fill" className="text-success-600" />
                    </div>
                )} */}
                <div className="flex w-full items-start gap-16">
                    {/* Participants Data */}
                    <div className="flex w-1/2 flex-col gap-6">
                        <p className="font-semibold">Notify Participants via Email:</p>
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.participant_when_assessment_created && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When Assessment is created:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.participant_before_assessment_goes_live ? (
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-6">
                                    <p className="text-sm">Before Assessment goes live:</p>
                                    <p className="text-sm">
                                        {
                                            assessmentDetails[2]?.saved_data?.notifications
                                                ?.participant_before_assessment_goes_live
                                        }{' '}
                                        Min
                                    </p>
                                </p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        ) : null}
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.participant_when_assessment_live && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When Assessment goes live:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.participant_when_assessment_report_generated && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When assessment reports are generated:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                    </div>
                    {/* Parents Data, this will be added later
                    <div className="flex w-1/2 flex-col gap-6">
                        <p className="font-semibold">Notify Parents via Email:</p>
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.parent_when_assessment_created && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When Assessment is created:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.parent_before_assessment_goes_live ? (
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-6">
                                    <p className="text-sm">Before Assessment goes live:</p>
                                    <p className="text-sm">
                                        {
                                            assessmentDetails[2]?.saved_data?.notifications
                                                ?.parent_before_assessment_goes_live
                                        }{" "}
                                        Min
                                    </p>
                                </p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        ) : null}
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.parent_when_assessment_live && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When Assessment goes live:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When students appears for the Assessment:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm">When students finishes the Assessment:</p>
                            <CheckCircle size={22} weight="fill" className="text-success-600" />
                        </div>
                        {assessmentDetails[2]?.saved_data?.notifications
                            ?.parent_when_assessment_report_generated && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm">When assessment reports are generated:</p>
                                <CheckCircle size={22} weight="fill" className="text-success-600" />
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </>
    );
};

export default AssessmentParticipantsTab;
