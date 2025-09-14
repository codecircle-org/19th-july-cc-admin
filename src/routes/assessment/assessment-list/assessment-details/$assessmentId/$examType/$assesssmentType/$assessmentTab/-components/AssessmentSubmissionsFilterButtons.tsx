import { MyButton } from '@/components/design-system/button';
import { SelectedSubmissionsFilterInterface } from './AssessmentSubmissionsTab';

interface ScheduleTestFilterButtonsProps {
    selectedQuestionPaperFilters: SelectedSubmissionsFilterInterface;
    handleSubmitFilters: () => void;
    handleResetFilters: () => void;
}

const AssessmentSubmissionsFilterButtons = ({
    selectedQuestionPaperFilters,
    handleSubmitFilters,
    handleResetFilters,
}: ScheduleTestFilterButtonsProps) => {
    const isButtonEnabled = () => {
        const { name, batches } = selectedQuestionPaperFilters;
        return name || batches?.length > 0;
    };
    return (
        <>
            {!!isButtonEnabled() && (
                <div className="flex gap-6">
                    <MyButton
                        buttonType="primary"
                        scale="small"
                        layoutVariant="default"
                        className="h-8"
                        onClick={handleSubmitFilters}
                    >
                        Filter
                    </MyButton>
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        layoutVariant="default"
                        className="h-8 border border-neutral-400 bg-neutral-200 hover:border-neutral-500 hover:bg-neutral-300 active:border-neutral-600 active:bg-neutral-400"
                        onClick={handleResetFilters}
                    >
                        Reset
                    </MyButton>
                </div>
            )}
        </>
    );
};

export default AssessmentSubmissionsFilterButtons;
