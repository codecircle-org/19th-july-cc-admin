import { MyButton } from '@/components/design-system/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { handleGetQuestionsFromAudio } from '../../-services/ai-center-service';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import AITasksList from '../AITasksList';
import { FormProvider, useForm } from 'react-hook-form';
import {
    AudioAIQuestionFormSchema,
    audioQuestionsFormSchema,
} from '../../-utils/audio-questions-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { languageSupport } from '@/constants/dummy-data';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { Textarea } from '@/components/ui/textarea';
import SelectField from '@/components/design-system/select-field';
import { getRandomTaskName } from '../../-utils/helper';

const GenerateQuestionsFromAudio = ({ fileId }: { fileId: string }) => {
    const form = useForm<AudioAIQuestionFormSchema>({
        resolver: zodResolver(audioQuestionsFormSchema),
        defaultValues: {
            numQuestions: '',
            prompt: '',
            difficulty: '',
            language: languageSupport[0],
            taskName: getRandomTaskName(),
        },
    });
    const [enableDialog, setEnableDialog] = useState(false);
    const [extractQuestionsDialog, setExtractQuestionsDialog] = useState(false);
    const queryClient = useQueryClient();

    /* Generate Assessment Complete */
    const getQuestionsFromAudioMutation = useMutation({
        mutationFn: async ({
            audioId,
            numQuestions,
            prompt,
            difficulty,
            language,
            taskName,
            taskId,
        }: {
            audioId: string;
            numQuestions: string;
            prompt: string;
            difficulty: string;
            language: string;
            taskName: string;
            taskId?: string;
        }) => {
            return handleGetQuestionsFromAudio(
                audioId,
                numQuestions,
                prompt,
                difficulty,
                language,
                taskName,
                taskId || ''
            );
        },
        onSuccess: () => {
            setEnableDialog(true);
            form.reset();
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['GET_INDIVIDUAL_AI_LIST_DATA'] });
            }, 100);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const onSubmit = (values: AudioAIQuestionFormSchema) => {
        getQuestionsFromAudioMutation.mutate({
            audioId: fileId,
            numQuestions: values.numQuestions.toString(),
            prompt: values.prompt,
            difficulty: values.difficulty,
            language: values.language,
            taskName: getRandomTaskName(),
            taskId: '',
        });
    };

    const handleCloseExtractQuestionDialog = () => {
        setExtractQuestionsDialog(!extractQuestionsDialog);
        setEnableDialog(false);
        form.reset({
            ...form.getValues(),
            taskName: getRandomTaskName(),
        });
    };

    return (
        <>
            <Dialog open={extractQuestionsDialog} onOpenChange={handleCloseExtractQuestionDialog}>
                <DialogTrigger>
                    <Badge className="cursor-pointer whitespace-nowrap bg-[#FFF4F5]">
                        Generate Questions
                    </Badge>
                </DialogTrigger>
                <DialogContent className="w-1/3 p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Generate Questions From Audio
                    </h1>
                    <div className="flex flex-col gap-4">
                        <FormProvider {...form}>
                            <form className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
                                <FormField
                                    control={form.control}
                                    name="prompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex flex-col gap-2">
                                                    <FormLabel>
                                                        Topics{' '}
                                                        <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <Textarea
                                                        placeholder="For example, Generate a set of questions covering the key principles of photosynthesis, including the process, factors affecting it, and its importance in the ecosystem. Focus on conceptual understanding and application"
                                                        className="h-[100px] w-full"
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numQuestions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    input={field.value?.toString() || ''}
                                                    onChangeFunction={(e) =>
                                                        field.onChange(e.target.value)
                                                    }
                                                    label="Number of Questions"
                                                    required={true}
                                                    inputType="text"
                                                    inputPlaceholder="For example, 10"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl className="w-full">
                                                <MyInput
                                                    input={field.value}
                                                    onChangeFunction={(e) =>
                                                        field.onChange(e.target.value)
                                                    }
                                                    inputType="text"
                                                    inputPlaceholder="for example easy, medium and hard"
                                                    className="w-full"
                                                    required={true}
                                                    label="Enter difficulty level"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <SelectField
                                    label="Question Language"
                                    labelStyle="font-semibold"
                                    name="language"
                                    options={languageSupport.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                    className="w-full font-thin"
                                />
                                <div>
                                    {getQuestionsFromAudioMutation.status === 'pending' ? (
                                        <MyButton
                                            buttonType="primary"
                                            layoutVariant="default"
                                            scale="large"
                                            className=""
                                            type="button"
                                        >
                                            <DashboardLoader />
                                        </MyButton>
                                    ) : (
                                        <MyButton
                                            buttonType="primary"
                                            layoutVariant="default"
                                            scale="large"
                                            className=""
                                            type="button"
                                            onClick={form.handleSubmit(onSubmit)}
                                        >
                                            Submit
                                        </MyButton>
                                    )}
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </DialogContent>
            </Dialog>
            {enableDialog && (
                <AITasksList
                    heading="Vsmart Audio"
                    enableDialog={enableDialog}
                    setEnableDialog={setEnableDialog}
                />
            )}
        </>
    );
};

export default GenerateQuestionsFromAudio;
