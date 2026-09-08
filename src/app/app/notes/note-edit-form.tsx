'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { SaveIcon, StarIcon, TrashIcon } from 'lucide-react'
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

import type { Note } from './actions'

const noteSchema = z
	.object({
		id: z.number(),
		title: z.string().trim().max(120, 'Title is too long'),
		body: z.string().max(10000, 'Note is too long'),
		isFavorite: z.boolean(),
	})
	.refine((note) => note.title.length > 0 || note.body.trim().length > 0, {
		message: 'Title or body is required',
		path: ['title'],
	})

export type NoteFormData = z.infer<typeof noteSchema>

export type NoteEditFormHandle = {
	discardChanges: () => void
	getValidatedSnapshot: () => Promise<NoteFormData | null>
	hasChanges: () => boolean
	resetTo: (note: Note | null) => void
}

interface NoteEditFormProps {
	initialData?: Note | null
	onDelete?: (note: Note) => void
	onSubmit: (data: NoteFormData) => void
}

function getDefaultValues(note?: Note | null): NoteFormData {
	return {
		id: note?.id ?? -1,
		title: note?.title ?? '',
		body: note?.body ?? '',
		isFavorite: Boolean(note?.isFavorite),
	}
}

const NoteEditForm = forwardRef<NoteEditFormHandle, NoteEditFormProps>(
	function NoteEditForm({ initialData, onDelete, onSubmit }, ref) {
		const defaultValues = useMemo(
			() => getDefaultValues(initialData),
			[initialData],
		)
		const dirtyRef = useRef(false)

		const {
			control,
			formState: { errors, isDirty },
			getValues,
			handleSubmit,
			register,
			reset,
			trigger,
		} = useForm<NoteFormData>({
			defaultValues,
			mode: 'onChange',
			resolver: zodResolver(noteSchema),
		})

		useEffect(() => {
			dirtyRef.current = isDirty
		}, [isDirty])

		useEffect(() => {
			reset(defaultValues)
		}, [defaultValues, reset])

		useImperativeHandle(
			ref,
			() => ({
				discardChanges: () => {
					reset(defaultValues)
				},
				getValidatedSnapshot: async () => {
					const isValid = await trigger()

					if (!isValid) {
						return null
					}

					return getValues()
				},
				hasChanges: () => dirtyRef.current,
				resetTo: (note) => {
					reset(getDefaultValues(note))
				},
			}),
			[defaultValues, getValues, reset, trigger],
		)

		if (!initialData) {
			return (
				<div className="flex min-h-0 flex-col items-center justify-center p-8 text-center">
					<p className="text-sm font-medium">Select a note</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Choose a note from the list or create a new one.
					</p>
				</div>
			)
		}

		return (
			<div className="flex min-h-0 flex-col">
				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={handleSubmit((data) => {
						onSubmit(data)
						reset(data)
					})}
				>
					<div className="flex h-14 items-center justify-end border-b border-border px-5">
						<div className="flex items-center gap-1">
							{initialData.id !== -1 ? (
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label="Delete note"
									onClick={() => onDelete?.(initialData)}
								>
									<TrashIcon aria-hidden="true" className="size-4" />
								</Button>
							) : null}

							{isDirty ? (
								<Button
									type="submit"
									variant="ghost"
									size="icon-sm"
									aria-label="Save note"
								>
									<SaveIcon aria-hidden="true" className="size-4" />
								</Button>
							) : null}

							<Controller
								control={control}
								name="isFavorite"
								render={({ field }) => (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										aria-label="Toggle favorite"
										onClick={() => field.onChange(!field.value)}
									>
										<StarIcon
											aria-hidden="true"
											className={cn(
												'size-4',
												field.value
													? 'fill-primary text-primary'
													: 'text-muted-foreground',
											)}
										/>
									</Button>
								)}
							/>
						</div>
					</div>

					<div className="flex flex-1 flex-col gap-2 p-5">
						<input
							{...register('title')}
							aria-invalid={Boolean(errors.title)}
							placeholder="Title"
							className={cn(
								'w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-muted-foreground',
								errors.title && 'text-destructive',
							)}
						/>
						{errors.title ? (
							<p className="text-sm text-destructive">{errors.title.message}</p>
						) : null}

						<textarea
							{...register('body')}
							aria-invalid={Boolean(errors.body)}
							placeholder="Start writing..."
							className="min-h-96 flex-1 resize-none bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground"
						/>
						{errors.body ? (
							<p className="text-sm text-destructive">{errors.body.message}</p>
						) : null}
					</div>
				</form>
			</div>
		)
	},
)

export default NoteEditForm
