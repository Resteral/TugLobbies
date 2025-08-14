import { SimpleLoginForm } from "@/components/simple-login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <SimpleLoginForm />
        <div className="text-center">
          <p className="text-gray-300">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
