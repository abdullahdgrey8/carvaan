import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        <SignupForm />
      </div>
    </div>
  )
}
