import { useState } from "react";
import { Button, Field, Input, Label } from "@headlessui/react";
import useAuth from "../context/auth/useAuth";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [userId, setUserId] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const { login, verifyLogin, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      if (mode === "login") {
        const data = await login(username, password);
        setUserId(data.userId);
        setInfo(data.message || "Enter the code sent to your email.");
        setMode("2fa");
      } else if (mode === "2fa") {
        await verifyLogin(userId, code);
      } else if (mode === "register") {
        await register(username, email, password);
        setInfo("Registration successful! Please log in.");
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setInfo("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onyx font-mono text-lavender">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-md bg-darkAmethyst md:border-dashed md:border-4 md:border-evergreen p-8 flex flex-col justify-center">
        <h1 className="text-4xl font-gothic tracking-wide font-bold mb-6 text-center text-white text-shadow-hard-greyOlive">
          {mode === "2fa"
            ? "2-Factor Verification"
            : mode === "register"
              ? "Create Account"
              : "Log In"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 text-blue-200 text-sm">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-4">
          {mode === "2fa" ? (
            <Field>
              <Label className="block text-sm font-bold mb-1">
                Verification Code
              </Label>
              <Input
                className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                type="text"
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
          ) : (
            <>
              <Field>
                <Label className="block text-sm font-bold mb-1">Username</Label>
                <Input
                  className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                  type="text"
                  placeholder="Your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>

              {mode === "register" && (
                <Field>
                  <Label className="block text-sm font-bold mb-1">Email</Label>
                  <Input
                    className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              )}

              <Field>
                <Label className="block text-sm font-bold mb-1">Password</Label>
                <Input
                  className="w-full bg-onyx border border-greyOlive text-lavender p-2 focus:outline-none focus:border-lavender"
                  type="password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              className="w-full bg-greyOlive hover:bg-paleSlate text-onyx font-bold py-2 px-4 transition-colors"
            >
              {mode === "2fa"
                ? "Verify"
                : mode === "register"
                  ? "Register"
                  : "Login"}
            </Button>
            {mode === "register" && (
              <Button
                type="button"
                onClick={toggleMode}
                className="text-sm text-paleSlate hover:text-white underline"
              >
                Already have an account? Login
              </Button>
            )}
            {mode === "2fa" && (
              <Button
                type="button"
                onClick={() => setMode("login")}
                className="text-sm text-paleSlate hover:text-white underline"
              >
                Back to Login
              </Button>
            )}

            {mode === "login" && (
              <button
                onClick={toggleMode}
                className="mt-2 text-center text-sm text-lavender underline hover:text-white"
              >
                Create account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
