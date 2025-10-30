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
import React from "react";
import {toast} from "react-toastify";
import {login} from "@/services/api.js";
import {useNavigate} from "react-router-dom";

export function LoginForm({className, ...props}) {
  const navigate = useNavigate();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validName = /^[A-Za-z_][A-Za-z0-9_-]*$/;

  const validateInputs = (username, password) => {
    if (!username.trim()) return "Name is required";

    if (username.trim().length > 20) return "Name must be less than 20 characters";

    if (!validName.test(username)) return "Name must start with a letter and contain only letters, numbers, underscores and dashes";

    if (!password.trim()) return "Password is required";

    if (password.trim().length < 8) return "Password must be at least 8 characters";

    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errorMessage = validateInputs(username, password);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      await login({username, password});
      toast.success("Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 2000);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.status === 400) {
        toast.error("Incorrect username or password. Please try again.");
      } else {
        toast.error("An error occurred during login");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your account below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Account</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="youraccount"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold underline underline-offset-4 text-black"
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
