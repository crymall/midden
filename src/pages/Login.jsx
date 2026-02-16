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
        if (data.token) return;
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

  const handleGuestLogin = async () => {
    setError("");
    setInfo("");
    try {
      const data = await login("guest", "guest");
      if (data.token) return;
      // Fallback if guest login somehow triggers 2FA flow
    } catch (err) {
      setError(err.response?.data?.error || "Guest login failed");
    }
  };

  return (
    <div className="bg-dark text-lightestGrey flex min-h-screen items-center justify-center font-mono">
      <div className="bg-primary md:border-accent flex min-h-screen w-full flex-col justify-center p-8 md:min-h-0 md:max-w-md md:border-4 md:border-dashed">
        <h1 className="font-gothic text-shadow-hard-grey mb-6 text-center text-4xl font-bold tracking-wide text-white">
          {mode === "2fa"
            ? "2-Factor Verification"
            : mode === "register"
              ? "Create Account"
              : "Log In"}
        </h1>

        {error && (
          <div className="mb-4 border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 border border-blue-500 bg-blue-900/50 p-3 text-sm text-blue-200">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-4">
          {mode === "2fa" ? (
            <Field>
              <Label className="mb-1 block text-sm font-bold">
                Verification Code
              </Label>
              <Input
                className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
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
                <Label className="mb-1 block text-sm font-bold">Username</Label>
                <Input
                  className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
                  type="text"
                  placeholder="Your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>

              {mode === "register" && (
                <Field>
                  <Label className="mb-1 block text-sm font-bold">Email</Label>
                  <Input
                    className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              )}

              <Field>
                <Label className="mb-1 block text-sm font-bold">Password</Label>
                <Input
                  className="bg-dark border-grey text-lightestGrey focus:border-lightestGrey w-full border p-2 focus:outline-none"
                  type="password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="submit"
              className="bg-grey hover:bg-lightGrey text-dark w-full px-4 py-2 font-bold transition-colors"
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
                className="text-lightGrey text-sm underline hover:text-white"
              >
                Already have an account? Login
              </Button>
            )}
            {mode === "2fa" && (
              <Button
                type="button"
                onClick={() => setMode("login")}
                className="text-lightGrey text-sm underline hover:text-white"
              >
                Back to Login
              </Button>
            )}

            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-lightestGrey mt-2 text-center text-sm underline hover:text-white"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-lightestGrey text-center text-sm underline hover:text-white"
                >
                  Guest Login
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
