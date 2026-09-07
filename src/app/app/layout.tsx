import { NavigationMenu } from '@/components/ui'
import { me } from '../auth/actions'

function getUserName(user: Awaited<ReturnType<typeof me>>) {
	return user.name || user.username || user.email || 'User'
}

export default async function AppLayout({ children }: LayoutProps<'/app'>) {
	const user = await me()

	return (
		<main className="flex-1 w-full h-full">
			<NavigationMenu userName={getUserName(user)} />
			{children}
		</main>
	)
}
