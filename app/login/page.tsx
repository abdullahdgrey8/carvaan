import { LoginForm } from "@/components/login-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Convert searchParams to regular values - properly awaited
  const showRegisteredMessage = searchParams?.registered === "true"
  const showResetMessage = searchParams?.reset === "true"
  const redirectPath = (searchParams?.redirect as string) || "/"

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {showRegisteredMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Registration Successful</AlertTitle>
              <AlertDescription>Your account has been created. You can now log in.</AlertDescription>
            </Alert>
          )}

          {showResetMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Password Reset</AlertTitle>
              <AlertDescription>
                Your password has been reset. You can now log in with your new password.
              </AlertDescription>
            </Alert>
          )}

          <LoginForm redirectPath={redirectPath} />
        </div>
      </div>
    </div>
  )
}
