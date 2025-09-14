import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MyFilterOption, MyFilterProps } from '@/types/assessments/my-filter';
import { CheckIcon } from '@radix-ui/react-icons';
import { PlusCircle } from 'phosphor-react';

export const ScheduleTestFilters = ({
    label,
    data,
    selectedItems,
    onSelectionChange,
}: MyFilterProps) => {
    const toggleSelection = (option: MyFilterOption) => {
        const updatedItems = selectedItems.some((item) => item.id === option.id)
            ? selectedItems.filter((item) => item.id !== option.id)
            : [...selectedItems, option];
        onSelectionChange(updatedItems);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={`text-neutral-600 ${
                        selectedItems.length > 0
                            ? 'border-primary-500 bg-primary-100 hover:bg-primary-100'
                            : ''
                    }`}
                >
                    <PlusCircle size={32} />
                    {label}
                    {selectedItems.length > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 bg-black" />
                            <span className="rounded-md bg-primary-200 px-3 py-1 text-xs">
                                {selectedItems.length} selected
                            </span>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${label}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading={label}>
                            {data?.map((option, index) => {
                                const isSelected = selectedItems.some(
                                    (item) => item.id === option.id
                                );
                                return (
                                    <CommandItem
                                        key={index}
                                        onSelect={() => toggleSelection(option)}
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300',
                                                isSelected
                                                    ? 'border-none bg-primary-300 text-white'
                                                    : 'opacity-70 [&_svg]:invisible'
                                            )}
                                        >
                                            <CheckIcon
                                                className={cn('h-4 w-4 rounded-sm bg-primary-500')}
                                            />
                                        </div>
                                        {option.name}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
