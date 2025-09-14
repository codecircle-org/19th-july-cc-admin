import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { CaretDown, CaretUp, Check } from 'phosphor-react';
import { Badge } from '../ui/badge';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { type Control } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface Option {
    id: string;
    name: string;
}

interface MultiSelectFieldProps {
    form: any; // eslint-disable-line
    className?: string;
    label: string;
    labelStyle?: string;
    name: string;
    options: Option[];
    required?: boolean;
    control: any; // eslint-disable-line
}

export function MultiSelectField({
    form,
    label,
    labelStyle,
    name,
    options,
    required = false,
    control,
    className,
}: MultiSelectFieldProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedOptions((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const selectedNames = selectedOptions
            .map((id) => options.find((opt) => opt.id === id)?.name)
            .filter(Boolean); // Remove undefined if any id not found
        form.setValue(name, selectedNames);
    }, [selectedOptions, form, name, options]);

    useEffect(() => {
        setSelectedOptions(form.getValues(name) || []);
    }, []);

    return (
        <>
            <FormField
                control={control as Control}
                name={name}
                render={() => {
                    return (
                        <div>
                            <FormItem className={cn('flex w-44 flex-col', className)}>
                                <FormLabel className={labelStyle}>
                                    {label}
                                    {required && <span className="text-red-500">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                                        <PopoverTrigger>
                                            <div className="flex w-96 items-center justify-between rounded-lg border px-3 py-2">
                                                <h1 className="text-sm">Select options</h1>
                                                {isOpen ? <CaretUp /> : <CaretDown />}
                                            </div>
                                        </PopoverTrigger>
                                        {isOpen && (
                                            <div
                                                ref={popoverRef}
                                                className="w-fit rounded-md border p-2"
                                            >
                                                {options.map((option) => (
                                                    <div
                                                        key={option.id}
                                                        className="flex w-80 cursor-pointer justify-between rounded-lg p-2 hover:bg-neutral-100"
                                                        onClick={() => toggleSelection(option.id)}
                                                    >
                                                        <label className="text-sm">
                                                            {option.name}
                                                        </label>
                                                        {selectedOptions.includes(option.id) && (
                                                            <Check size={18} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Popover>
                                </FormControl>
                            </FormItem>
                            <div className="mt-4 flex flex-wrap justify-start gap-4">
                                {selectedOptions.map((id) => {
                                    const option = options.find((opt) => opt.id === id);
                                    return (
                                        <Badge key={id} className="bg-[#F4F9FF] px-2 py-1">
                                            {option?.name}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }}
            />
        </>
    );
}
