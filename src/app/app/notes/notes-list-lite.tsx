'use client'

import { FileTextIcon, Loader2Icon, StarIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

import { Note } from './actions'

interface NotesListItemProps {
	data: Note
	isSaving?: boolean
	isSelected: boolean
	onDelete?: () => void
	onSelect?: () => void
	onToggleFavorite?: () => void
}

export default function NotesListItem({
	data,
	isSaving = false,
	isSelected,
	onDelete,
	onSelect,
	onToggleFavorite,
}: NotesListItemProps) {
	const showFavoriteAction = data.isFavorite || isSaving
	const title = data.title.trim()
	const body = data.body.trim()
	const preview = title || body || 'Untitled note'

	return (
		<li>
			<div
				className={cn(
					'group/note-item flex items-start gap-2 rounded-lg px-2 py-2 pr-1 outline-none transition-colors',
					'hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50',
					isSelected && 'bg-muted',
				)}
			>
				<button
					type="button"
					className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
					onClick={() => {
						if (!isSelected) {
							onSelect?.()
						}
					}}
				>
					<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
						<FileTextIcon aria-hidden="true" className="size-4" />
					</span>
					<span className="min-w-0 flex-1">
						<span className="flex items-center gap-1.5">
							<span className="truncate text-sm font-medium">{preview}</span>
						</span>
					</span>
				</button>

				<div className="flex h-8 w-14 shrink-0 items-center justify-end gap-0.5">
					{isSaving ? (
						<span className="flex size-7 items-center justify-center text-muted-foreground">
							<Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
						</span>
					) : (
						<>
							<Button
								type="button"
								variant="destructive"
								size="icon-xs"
								aria-label="Delete note"
								className="opacity-0 transition-all hover:text-destructive group-hover/note-item:opacity-100 group-focus-within/note-item:opacity-100"
								onClick={onDelete}
							>
								<Trash2Icon
									aria-hidden="true"
									className="size-3.5 text-destructive/70 transition-colors group-hover/button:text-destructive"
								/>
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								aria-label="Toggle favorite"
								className={cn(
									'transition-all hover:bg-transparent',
									!showFavoriteAction &&
										'opacity-0 group-hover/note-item:opacity-100 group-focus-within/note-item:opacity-100',
								)}
								onClick={onToggleFavorite}
							>
								<StarIcon
									aria-hidden="true"
									className={cn(
										'size-3.5 transition-colors',
										data.isFavorite
											? 'fill-amber-400 text-amber-500'
											: 'text-muted-foreground group-hover/button:text-amber-500',
									)}
								/>
							</Button>
						</>
					)}
				</div>
			</div>
		</li>
	)
}
