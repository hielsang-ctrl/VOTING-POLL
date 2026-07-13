import { useEffect, useState } from "react";

function AuthForm({
  authMode,
  onSwitchMode,
  onLogin,
  onRegister,
  onRequestReset,
  onResetPassword,
  onVerifyEmail,
  error,
  clearError,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    clearError();
  }, [authMode, clearError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === "register") {
      onRegister({ name: name.trim(), email: email.trim(), password });
      return;
    }
    onLogin({ email: email.trim(), password });
  };

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-950/60 p-6 shadow-xl shadow-slate-900/30">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {authMode === "register" ? "Register" : "Login"}
          </h2>
          <p className="text-sm text-slate-400">
            {authMode === "register"
              ? "Create a new user account to participate in the poll."
              : "Sign in to vote or manage the poll."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwitchMode(authMode === "register" ? "login" : "register")}
          className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
        >
          {authMode === "register" ? "Go to Login" : "Create Account"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === "register" && (
          <label className="block text-sm text-slate-300">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={clearError}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
              placeholder="Your name"
            />
          </label>
        )}

        <label className="block text-sm text-slate-300">
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={clearError}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            placeholder="you@example.com"
            type="email"
          />
        </label>

        <label className="block text-sm text-slate-300">
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={clearError}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            placeholder="Enter password"
            type="password"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={authMode === "register" ? !name.trim() || !email.trim() || !password : !email.trim() || !password}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {authMode === "register" ? "Register" : "Login"}
          </button>

          {authMode === "login" && (
            <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-sm text-slate-300">
              <p className="font-medium text-white">Password reset</p>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Account email"
              />
              <button
                type="button"
                onClick={() => onRequestReset(resetEmail)}
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-white"
              >
                Send reset code
              </button>
              <input
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Reset code"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="New password"
                type="password"
              />
              <button
                type="button"
                onClick={() => onResetPassword(resetEmail, resetCode, newPassword)}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 text-white"
              >
                Reset password
              </button>
              <input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Verification code"
              />
              <button
                type="button"
                onClick={() => onVerifyEmail(email, verificationCode)}
                className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-white"
              >
                Verify email
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

export default AuthForm;
