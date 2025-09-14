import { MyButton } from '@/components/design-system/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { handleSortSplitPDF } from '../../-services/ai-center-service';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import AITasksList from '../AITasksList';
import { PromptDummyData } from '../Prompt-dummy-data';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getRandomTaskName } from '../../-utils/helper';

type PromptType = keyof typeof PromptDummyData;

const TopicWiseQuestionsComponent = ({ fileId }: { fileId: string }) => {
    const [prompt, setPrompt] = useState('');
    const [enableDialog, setEnableDialog] = useState(false);
    const [extractQuestionsDialog, setExtractQuestionsDialog] = useState(false);
    const [selectedValue, setSelectedValue] = useState<PromptType>('topic');
    const queryClient = useQueryClient();

    /* Generate Assessment Complete */
    const generateAssessmentMutation = useMutation({
        mutationFn: ({
            pdfId,
            userPrompt,
            taskName,
            taskId,
        }: {
            pdfId: string;
            userPrompt: string;
            taskName: string;
            taskId?: string;
        }) => {
            return handleSortSplitPDF(pdfId, userPrompt, taskName, taskId || '');
        },
        onSuccess: () => {
            setPrompt('');
            setEnableDialog(true);
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['GET_INDIVIDUAL_AI_LIST_DATA'] });
            }, 100);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handleExtractQuestions = () => {
        generateAssessmentMutation.mutate({
            pdfId: fileId || '',
            userPrompt: prompt || '',
            taskName: getRandomTaskName(),
            taskId: '',
        });
    };

    const handleCloseExtractQuestionDialog = () => {
        setExtractQuestionsDialog(!extractQuestionsDialog);
    };

    return (
        <>
            <Dialog open={extractQuestionsDialog} onOpenChange={handleCloseExtractQuestionDialog}>
                <DialogTrigger>
                    <Badge className="cursor-pointer whitespace-nowrap bg-[#F5F0FF]">
                        Topic Wise Sort Questions
                    </Badge>
                </DialogTrigger>
                <DialogContent className="p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Topic Wise Sort Questions
                    </h1>
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex flex-col gap-2">
                            <h1>
                                {PromptDummyData[selectedValue].heading}
                                <span className="text-red-500">*</span>
                            </h1>
                            <Textarea
                                placeholder={PromptDummyData[selectedValue].description}
                                className="h-[100px] w-full"
                                value={prompt}
                                onChange={(e) => setPrompt?.(e.target.value)}
                            />
                            <RadioGroup
                                defaultValue="topic"
                                className="mt-2"
                                value={selectedValue}
                                onValueChange={(newValue) =>
                                    setSelectedValue(newValue as PromptType)
                                }
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="topic" id="r1" />
                                    <Label htmlFor="r1">Select any topic questions covered</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pages" id="r2" />
                                    <Label htmlFor="r2">Select questions from specific pages</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="questionNo" id="r3" />
                                    <Label htmlFor="r3">Select a set of questions</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {generateAssessmentMutation.status === 'pending' ? (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="primary"
                                layoutVariant="default"
                                className="text-sm"
                            >
                                <DashboardLoader />
                            </MyButton>
                        ) : (
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="primary"
                                layoutVariant="default"
                                className="text-sm"
                                onClick={handleExtractQuestions}
                                disable={!prompt}
                            >
                                Extract
                            </MyButton>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {enableDialog && (
                <AITasksList
                    heading="Vsmart Organizer"
                    enableDialog={enableDialog}
                    setEnableDialog={setEnableDialog}
                />
            )}
        </>
    );
};

export default TopicWiseQuestionsComponent;
