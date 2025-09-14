import { Badge } from '@/components/ui/badge';
import { Route } from '..';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { getAssessmentDetails } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-services/assessment-services';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { handleGetInstituteUsersForAccessControl } from '@/routes/dashboard/-services/dashboard-services';
import { RoleTypeUserIcon } from '@/svgs';

interface Role {
    role_name: string;
    status: string;
    role_id: string;
}

interface AccessControlUser {
    id: string;
    username: string;
    email: string;
    full_name: string;
    address_line: string | null;
    city: string | null;
    region: string | null;
    pin_code: string | null;
    mobile_number: string | null;
    date_of_birth: string | null;
    gender: string | null;
    password: string | null;
    profile_pic_file_id: string | null;
    roles: Role[];
    status: string;
    root_user: boolean;
}

const AssessmentAccessControlTab = () => {
    const { assessmentId, examType } = Route.useParams();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        })
    );
    const { data: accessControlUsers, isLoading: isUsersLoading } = useSuspenseQuery(
        handleGetInstituteUsersForAccessControl(instituteDetails?.id, {
            roles: [
                { id: '1', name: 'ADMIN' },
                { id: '2', name: 'COURSE CREATOR' },
                { id: '3', name: 'ASSESSMENT CREATOR' },
                { id: '4', name: 'EVALUATOR' },
                { id: '5', name: 'TEACHER' },
            ],
            status: [
                { id: '1', name: 'ACTIVE' },
                { id: '2', name: 'DISABLED' },
                { id: '3', name: 'INVITED' },
            ],
        })
    );

    if (isLoading || isUsersLoading) return <DashboardLoader />;
    return (
        <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Creation Access</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.creation_access.user_ids?.map(
                            (userId) => {
                                const matchedUser = accessControlUsers?.find(
                                    (user: AccessControlUser) => user.id === userId
                                );
                                return matchedUser ? (
                                    <div
                                        key={matchedUser.id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {matchedUser.status !== 'INVITED' && (
                                                <RoleTypeUserIcon />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <p>{matchedUser.full_name}</p>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex items-center gap-4">
                                                            {matchedUser.roles.map((role: Role) => {
                                                                return (
                                                                    <Badge
                                                                        key={role.role_id}
                                                                        className={`whitespace-nowrap rounded-lg border border-neutral-300 ${
                                                                            role.role_name ===
                                                                            'ADMIN'
                                                                                ? 'bg-[#F4F9FF]'
                                                                                : role.role_name ===
                                                                                    'COURSE CREATOR'
                                                                                  ? 'bg-[#F4FFF9]'
                                                                                  : role.role_name ===
                                                                                      'ASSESSMENT CREATOR'
                                                                                    ? 'bg-[#FFF4F5]'
                                                                                    : 'bg-[#F5F0FF]'
                                                                        } py-1.5 font-thin shadow-none`}
                                                                    >
                                                                        {role.role_name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs">{matchedUser.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            }
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Live Assessment Notifications</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.live_assessment_access.user_ids?.map(
                            (userId) => {
                                const matchedUser = accessControlUsers?.find(
                                    (user: AccessControlUser) => user.id === userId
                                );
                                return matchedUser ? (
                                    <div
                                        key={matchedUser.id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {matchedUser.status !== 'INVITED' && (
                                                <RoleTypeUserIcon />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <p>{matchedUser.full_name}</p>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex items-center gap-4">
                                                            {matchedUser.roles.map((role: Role) => {
                                                                return (
                                                                    <Badge
                                                                        key={role.role_id}
                                                                        className={`whitespace-nowrap rounded-lg border border-neutral-300 ${
                                                                            role.role_name ===
                                                                            'ADMIN'
                                                                                ? 'bg-[#F4F9FF]'
                                                                                : role.role_name ===
                                                                                    'COURSE CREATOR'
                                                                                  ? 'bg-[#F4FFF9]'
                                                                                  : role.role_name ===
                                                                                      'ASSESSMENT CREATOR'
                                                                                    ? 'bg-[#FFF4F5]'
                                                                                    : 'bg-[#F5F0FF]'
                                                                        } py-1.5 font-thin shadow-none`}
                                                                    >
                                                                        {role.role_name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs">{matchedUser.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            }
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Assessment Submission & Reports Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.report_and_submission_access.user_ids?.map(
                            (userId) => {
                                const matchedUser = accessControlUsers?.find(
                                    (user: AccessControlUser) => user.id === userId
                                );
                                return matchedUser ? (
                                    <div
                                        key={matchedUser.id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {matchedUser.status !== 'INVITED' && (
                                                <RoleTypeUserIcon />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <p>{matchedUser.full_name}</p>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex items-center gap-4">
                                                            {matchedUser.roles.map((role: Role) => {
                                                                return (
                                                                    <Badge
                                                                        key={role.role_id}
                                                                        className={`whitespace-nowrap rounded-lg border border-neutral-300 ${
                                                                            role.role_name ===
                                                                            'ADMIN'
                                                                                ? 'bg-[#F4F9FF]'
                                                                                : role.role_name ===
                                                                                    'COURSE CREATOR'
                                                                                  ? 'bg-[#F4FFF9]'
                                                                                  : role.role_name ===
                                                                                      'ASSESSMENT CREATOR'
                                                                                    ? 'bg-[#FFF4F5]'
                                                                                    : 'bg-[#F5F0FF]'
                                                                        } py-1.5 font-thin shadow-none`}
                                                                    >
                                                                        {role.role_name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs">{matchedUser.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            }
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border p-5">
                <h1 className="font-semibold">Evaluation Access</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {assessmentDetails[3]?.saved_data.evaluation_access.user_ids?.map(
                            (userId) => {
                                const matchedUser = accessControlUsers?.find(
                                    (user: AccessControlUser) => user.id === userId
                                );
                                return matchedUser ? (
                                    <div
                                        key={matchedUser.id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {matchedUser.status !== 'INVITED' && (
                                                <RoleTypeUserIcon />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4">
                                                    <p>{matchedUser.full_name}</p>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex items-center gap-4">
                                                            {matchedUser.roles.map((role: Role) => {
                                                                return (
                                                                    <Badge
                                                                        key={role.role_id}
                                                                        className={`whitespace-nowrap rounded-lg border border-neutral-300 ${
                                                                            role.role_name ===
                                                                            'ADMIN'
                                                                                ? 'bg-[#F4F9FF]'
                                                                                : role.role_name ===
                                                                                    'COURSE CREATOR'
                                                                                  ? 'bg-[#F4FFF9]'
                                                                                  : role.role_name ===
                                                                                      'ASSESSMENT CREATOR'
                                                                                    ? 'bg-[#FFF4F5]'
                                                                                    : 'bg-[#F5F0FF]'
                                                                        } py-1.5 font-thin shadow-none`}
                                                                    >
                                                                        {role.role_name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs">{matchedUser.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentAccessControlTab;
