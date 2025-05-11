import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import LoginForm from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string; reset?: string; redirect?: string }
}) {
  // Convert searchParams to regular values
  const showRegisteredMessage = searchParams?.registered === "true"
  const showResetMessage = searchParams?.reset === "true"
  const redirectPath = searchParams?.redirect || "/"

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>

        {showRegisteredMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Account created successfully! Please login with your credentials.
            </AlertDescription>
          </Alert>
        )}

        {showResetMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Password reset successfully! Please login with your new password.
            </AlertDescription>
          </Alert>
        )}

        <LoginForm redirectPath={redirectPath} />
      </div>
    </div>
  )
}
