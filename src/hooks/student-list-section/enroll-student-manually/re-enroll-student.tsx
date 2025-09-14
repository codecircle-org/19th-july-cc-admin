import { useMutation, useQueryClient } from '@tanstack/react-query';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { ENROLL_STUDENT_MANUALLY } from '@/constants/urls';
import {
    StepOneData,
    StepTwoData,
    StepThreeData,
    StepFourData,
    StepFiveData,
} from '@/schemas/student/student-list/schema-enroll-students-manually';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

interface ReEnrollStudentParams {
    userId: string;
    formData: {
        stepOneData: StepOneData | null;
        stepTwoData: StepTwoData | null;
        stepThreeData: StepThreeData | null;
        stepFourData: StepFourData | null;
        stepFiveData: StepFiveData | null;
    };
    packageSessionId: string;
}

export const useReEnrollStudent = () => {
    const queryClient = useQueryClient();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];

    return useMutation<string, Error, ReEnrollStudentParams>({
        mutationFn: async ({ userId, formData, packageSessionId }) => {
            const requestBody = {
                user_id: userId,
                user_details: {
                    username: formData.stepFiveData?.username || '',
                    email: formData.stepThreeData?.email || '',
                    full_name: formData.stepTwoData?.fullName || '',
                    address_line: 'N/A',
                    city: formData.stepThreeData?.city || '',
                    mobile_number: formData.stepThreeData?.mobileNumber || '',
                    date_of_birth: '',
                    gender: formData.stepTwoData?.gender.name || '',
                    password: formData.stepFiveData?.password || '',
                    profile_pic_file_id: formData.stepOneData?.profilePicture || '',
                    roles: ['STUDENT'],
                    root_user: false,
                },
                student_extra_details: {
                    fathers_name: formData.stepFourData?.fatherName || '',
                    mothers_name: formData.stepFourData?.motherName || '',
                    parents_mobile_number: formData.stepFourData?.guardianMobileNumber || '',
                    parents_email: formData.stepFourData?.guardianEmail || '',
                    linked_institute_name: formData.stepTwoData?.collegeName || '',
                    parents_to_mother_mobile_number:
                        formData.stepFourData?.motherMobileNumber || '',
                    parents_to_mother_email: formData.stepFourData?.motherEmail || '',
                },
                institute_student_details: {
                    institute_id: INSTITUTE_ID,
                    package_session_id: packageSessionId,
                    enrollment_id: formData.stepTwoData?.enrollmentNumber || '',
                    enrollment_status: 'ACTIVE',
                    enrollment_date: new Date().toISOString(),
                    accessDays: formData.stepTwoData?.accessDays,
                    group_id: '',
                },
            };

            const response = await authenticatedAxiosInstance.post(
                ENROLL_STUDENT_MANUALLY,
                requestBody
            );

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
};
