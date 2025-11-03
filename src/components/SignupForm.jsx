import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {toast} from "react-toastify";
import React, {useState} from "react";
import {signup} from "@/services/api.js";
import {useNavigate} from "react-router-dom";

export function SignupForm({className, ...props}) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validName = /^[A-Za-z_][A-Za-z0-9_-]*$/;

  // --- Validation ---
  const validateInputs = (username, password, confirmPassword) => {
    if (!username.trim()) return "Name is required";
    if (username.trim().length > 20)
      return "Name must be less than 20 characters";
    if (!validName.test(username))
      return "Name must start with a letter and contain only letters, numbers, underscores, and dashes";
    if (!password.trim()) return "Password is required";
    if (password.trim().length < 8)
      return "Password must be at least 8 characters";
    if (password.trim() !== confirmPassword.trim())
      return "Passwords do not match";
    return null;
  };

  // --- Handle Submit ---
  const handleSignup = async (e) => {
    e.preventDefault();

    const errorMessage = validateInputs(username, password, confirmPassword);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({username, password});
      toast.success("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 400) {
        toast.error("Username already exists");
      } else {
        toast.error("An error occurred during signup");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Account</Label>
                <Input
                  id="username"
                  type="username"
                  placeholder="youraccount"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="auth-input"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="auth-input"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                </div>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="auth-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm font-semibold">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-bold underline underline-offset-4 auth-link"
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}