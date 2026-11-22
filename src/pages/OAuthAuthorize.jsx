import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { getToken } from "@/api/client";

const SCOPE_LABELS = {
  "studies:read": "Read the studies and your study progress",
};

async function call(path, options = {}) {
  const token = await getToken();
  /** @type {Record<string, string>} */
  const headers = {};
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api/oauth${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Consent screen for pre-approved OAuth clients. Only admins can approve.
export default function OAuthAuthorize() {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    call(`/authorize-info?${searchParams.toString()}`)
      .then(setInfo)
      .catch((err) => setError(err.message || "This authorization request is invalid."));
  }, [searchParams]);

  const decide = async (decision) => {
    setBusy(decision);
    setError("");
    try {
      const { redirect } = await call("/decision", {
        method: "POST",
        body: JSON.stringify({ ...params, decision }),
      });
      window.location.href = redirect;
    } catch (err) {
      setError(err.message);
      setBusy("");
    }
  };

  if (error && !info) {
    return (
      <AuthLayout icon={AlertTriangle} title="Authorization failed" subtitle={error} footer={null}>
        <p className="text-sm text-muted-foreground">Go back to the app that sent you here and try again.</p>
      </AuthLayout>
    );
  }

  if (!info) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  const scopes = info.scope.split(" ");

  return (
    <AuthLayout
      icon={ShieldCheck}
      title={`Connect ${info.client_name}?`}
      subtitle={`Signed in as ${info.user_email}`}
      footer={null}
    >
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm">
        {scopes.map((s) => (
          <li key={s}>{SCOPE_LABELS[s] || s}</li>
        ))}
      </ul>

      {!info.is_admin && (
        <div className="mb-4 rounded-[8px] border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
          Only admins can approve connections. Sign in with an admin account to continue.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-[8px] border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button className="flex-1" disabled={!!busy || !info.is_admin} onClick={() => decide("approve")}>
          {busy === "approve" ? "Connecting..." : "Approve"}
        </Button>
        <Button className="flex-1" variant="outline" disabled={!!busy} onClick={() => decide("deny")}>
          {busy === "deny" ? "Denying..." : "Deny"}
        </Button>
      </div>
    </AuthLayout>
  );
}
