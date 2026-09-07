'use client'

import { Menu } from '@base-ui/react/menu'
import {
	ChevronDownIcon,
	LogOutIcon,
	User2,
	UserCircle,
	UserCircle2Icon,
} from 'lucide-react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { logout } from '@/app/auth/actions'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type NavigationDeepLinkBase = {
	label: string
	value: string
	icon?: ReactNode
}

type NavigationDeepLink =
	| (NavigationDeepLinkBase & { href: string })
	| (NavigationDeepLinkBase & {
			action: () => Promise<void>
	  })

type NavigationItem = {
	icon?: ReactNode
	href: string
	label: string
	value: 'home' | 'notes' | 'auth'
	deepLinks: NavigationDeepLink[]
	hidden?: boolean
}

const navigation: NavigationItem[] = [
	{
		href: '/app/home',
		label: 'Home',
		value: 'home',
		deepLinks: [],
	},
	{
		href: '/app/notes',
		label: 'Notes',
		value: 'notes',
		deepLinks: [],
	},
	{
		href: '/auth',
		label: 'Auth',
		value: 'auth',
		deepLinks: [
			{
				icon: <LogOutIcon aria-hidden="true" className="size-4" />,
				action: logout,
				label: 'Logout',
				value: 'logout',
			},
		],
		hidden: true,
	},
]

type NavigationMenuProps = {
	className?: string
	userName?: string
}

function NavigationMenu({ className, userName }: NavigationMenuProps) {
	const pathname = usePathname()
	const appNavigation = navigation.filter((item) => !item.hidden)
	const authNavigation = navigation.find((item) => item.value === 'auth')
	const menuItemClassName = cn(
		'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors',
		'data-highlighted:bg-muted',
	)

	return (
		<header
			className={cn(
				'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur',
				className,
			)}
		>
			<div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
				<nav aria-label="Main navigation" className="flex items-center gap-1">
					{appNavigation.map((item) => (
						<Link
							key={item.value}
							href={item.href}
							className={cn(
								buttonVariants({ variant: 'ghost', size: 'lg' }),
								pathname === item.href
									? 'text-white bg-blue-600'
									: 'text-gray-600',
								'hover:text-white hover:bg-blue-600 active:text-white active:bg-blue-600',
							)}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<Menu.Root>
					<Menu.Trigger
						className={cn(
							'group/user-menu inline-flex h-10 items-center gap-1.5 rounded-xl pr-2.5 text-sm font-medium outline-none transition-all',
							'hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
							'data-popup-open:bg-muted',
						)}
					>
						<span className="w-6 h-6 rounded-full flex items-center justify-center ring-black ring-1 bg-blue-500 mr-1">
							<User2 className="fill-white w-4 h-4" />
						</span>
						<span>{userName}</span>
						<ChevronDownIcon
							aria-hidden="true"
							className="size-3.5 transition-transform group-data-popup-open/user-menu:rotate-180"
						/>
					</Menu.Trigger>

					<Menu.Portal>
						<Menu.Positioner align="end" sideOffset={8}>
							<Menu.Popup
								className={cn(
									'min-w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
									'data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
									'origin-(--transform-origin) transition-[opacity,transform] duration-150',
								)}
							>
								{authNavigation?.deepLinks.map((deepLink) => (
									<div key={deepLink.value}>
										{'href' in deepLink ? (
											<Menu.LinkItem
												render={<Link href={deepLink.href} />}
												className={menuItemClassName}
												closeOnClick
											>
												{deepLink.icon}
												{deepLink.label}
											</Menu.LinkItem>
										) : (
											<Menu.Item className={menuItemClassName} closeOnClick>
												<form action={deepLink.action}>
													<button type="submit" className={menuItemClassName}>
														{deepLink.icon}
														{deepLink.label}
													</button>
												</form>
											</Menu.Item>
										)}
									</div>
								))}
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</div>
		</header>
	)
}

export { NavigationMenu, navigation }
