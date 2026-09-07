import { Input } from '@/components/ui/input'
import { signin } from '../actions'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function SignInPage() {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<h1 className="mb-5">Sign In</h1>
			<form action={signin} className="flex flex-col gap-2 mb-3">
				<Input name="username" placeholder="Username" />
				<Input name="password" placeholder="Password" />
				<Button type="submit">Continue</Button>
			</form>
			<p className="text-sm text-gray-600">
				Don&apos;t have account?{' '}
				<Link className="text-blue-700" href={'/auth/signup'}>
					Sign Up
				</Link>
			</p>
		</div>
	)
}
