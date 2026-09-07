import { Input } from '@/components/ui/input'
import { signup } from '../actions'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function SignUpPage() {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<h1 className="mb-5">Sign Up</h1>
			<form action={signup} className="flex flex-col gap-2 mb-3">
				<Input name="username" placeholder="Username" />
				<Input name="password" placeholder="Password" />
				<Input name="confirm-password" placeholder="Confirm Password" />
				<Button type="submit">Continue</Button>
			</form>
			<p className="text-sm text-gray-600">
				Already have account?{' '}
				<Link className="text-blue-700" href={'/auth/signin'}>
					Sign In
				</Link>
			</p>
		</div>
	)
}
