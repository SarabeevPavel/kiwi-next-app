'use client'

import { AlertTriangleIcon, Loader2Icon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui'

interface ConfirmationModalProps {
	open: boolean
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	isLoading?: boolean
	onConfirm: () => void
	onClose: () => void
}

export default function ConfirmationModal({
	open,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	isLoading = false,
	onConfirm,
	onClose,
}: ConfirmationModalProps) {
	if (!open) {
		return null
	}

	return (
		<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 gap-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
							<AlertTriangleIcon aria-hidden="true" className="size-4" />
						</span>
						<div className="min-w-0">
							<h2 className="text-base font-semibold">{title}</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								{description}
							</p>
						</div>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Close dialog"
						disabled={isLoading}
						onClick={onClose}
					>
						<XIcon aria-hidden="true" className="size-4" />
					</Button>
				</div>

				<div className="mt-5 flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						disabled={isLoading}
						onClick={onClose}
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant="destructive"
						disabled={isLoading}
						onClick={onConfirm}
					>
						{isLoading ? (
							<Loader2Icon aria-hidden="true" className="size-3.5 animate-spin" />
						) : (
							<AlertTriangleIcon aria-hidden="true" className="size-3.5" />
						)}
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	)
}
