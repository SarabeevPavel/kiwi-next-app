import {
	ArrowRightIcon,
	FilesIcon,
	FolderIcon,
	ShieldCheckIcon,
	StickyNoteIcon,
	User2Icon,
} from 'lucide-react'
import Link from 'next/link'

import { me } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

type User = Awaited<ReturnType<typeof me>>

const cards = [
	{
		title: 'Storage',
		description: 'Open files and folders',
		href: 'files',
		icon: FolderIcon,
		color: 'bg-blue-50 text-blue-600 ring-blue-100',
	},
	{
		title: 'Notes',
		description: 'Open saved notes',
		href: '/app/notes',
		icon: StickyNoteIcon,
		color: 'bg-amber-50 text-amber-600 ring-amber-100',
	},
]

function getUserName(user: User) {
	return user.name || user.username || user.email || 'User'
}

function getUserInitial(userName: string) {
	return userName.trim().charAt(0).toUpperCase() || 'U'
}

function getRoleLabel(user: User) {
	if (user.role === 'Owner') {
		return 'Owner'
	}

	if (user.role === 'Admin') {
		return 'Admin'
	}

	return 'User'
}

export default async function HomePage() {
	const user = await me()
	const userName = getUserName(user)
	const roleLabel = getRoleLabel(user)
	const filesHref = user.rootFolderId
		? `/app/files/${user.rootFolderId}`
		: '/app/files'
	const navigationCards = cards.map((card) =>
		card.href === 'files' ? { ...card, href: filesHref } : card,
	)

	return (
		<div className="min-h-[calc(100vh-65px)] bg-muted/30 px-4 py-6">
			<div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-5">
				<section className="rounded-lg border border-border bg-background p-6 shadow-sm">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 items-center gap-4">
							<div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary text-2xl font-semibold text-primary-foreground">
								{getUserInitial(userName)}
							</div>

							<div className="min-w-0">
								<p className="text-sm text-muted-foreground">Profile</p>
								<h1 className="truncate text-3xl font-bold">{userName}</h1>
								<p className="mt-1 text-sm text-muted-foreground">
									{user.email || user.username || 'Workspace member'}
								</p>
							</div>
						</div>

						<div className="flex flex-col flex-wrap gap-2">
							<span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium">
								{roleLabel === 'User' ? (
									<User2Icon aria-hidden="true" className="size-3.5" />
								) : (
									<ShieldCheckIcon aria-hidden="true" className="size-3.5" />
								)}
								{roleLabel}
							</span>
							<span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm text-muted-foreground">
								<FilesIcon aria-hidden="true" className="size-3.5" />
								{user.rootFolderId ? 'Root folder connected' : 'No root folder'}
							</span>
						</div>
					</div>
				</section>

				<section className="grid flex-1 gap-5 md:grid-cols-2">
					{navigationCards.map((card) => {
						const Icon = card.icon

						return (
							<Link
								key={card.title}
								href={card.href}
								className="group flex min-h-80 flex-col items-center justify-center rounded-lg border border-border bg-background p-8 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-ring hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<span
									className={cn(
										'mb-6 flex size-24 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105',
										card.color,
									)}
								>
									<Icon aria-hidden="true" className="size-12" />
								</span>

								<h2 className="text-2xl font-semibold">{card.title}</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									{card.description}
								</p>

								<span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
									Open
									<ArrowRightIcon
										aria-hidden="true"
										className="size-4 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</Link>
						)
					})}
				</section>
			</div>
		</div>
	)
}
