import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Sprout, Globe, MessageSquare, MailCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { t, setLanguage } from "@/lib/i18n";
import { AFRICAN_COUNTRIES, LANGUAGES } from "@/lib/constants";
import CountryPhoneSelect from "@/components/auth/CountryPhoneSelect";
import Onboarding from "@/components/auth/Onboarding";
import GitHubExportButton from "@/components/auth/GitHubExportButton";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryDial, setCountryDial] = useState("+243");
  const [language, setLang] = useState("fr");
  const [verifyMethod, setVerifyMethod] = useState("otp");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t("passwords_no_match"));
      return;
    }
    setLoading(true);
    setLanguage(language);
    try {
      await base44.auth.register({ email, password });
      if (verifyMethod === "otp") {
        setStep("otp");
      } else {
        setStep("email_verify");
      }
    } catch (err) {
      setError(err.message || t("registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      await createProfile();
      setStep("onboarding");
    } catch (err) {
      setError(err.message || t("invalid_code"));
    } finally {
      setLoading(false);
    }
  };

  async function createProfile() {
    try {
      const country = AFRICAN_COUNTRIES.find(c => c.dial === countryDial);
      await base44.entities.Profile.create({
        full_name: fullName,
        phone: phone,
        email: email,
        country_code: countryDial,
        country: country?.name || "RDC",
        language: language,
        role: "agriculteur",
      });
      await base44.auth.updateMe({ full_name: fullName });
    } catch (e) {
      console.error("Profile creation failed:", e);
    }
  }

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: t("code_resent"), description: t("check_email_code") });
    } catch (err) {
      setError(err.message || t("registration_failed"));
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  const finishOnboarding = () => {
    window.location.href = "/";
  };

  if (step === "onboarding") {
    return <Onboarding onFinish={finishOnboarding} />;
  }

  if (step === "email_verify") {
    return (
      <AuthLayout
        icon={MailCheck}
        title={t("verify_email")}
        subtitle={`${t("check_email_link")} ${email}`}
      >
        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
          {t("click_link_verify")}
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <Button className="w-full h-12 font-medium bg-green-600 hover:bg-green-700" onClick={() => window.location.href = "/login"}>
          {t("go_to_login")}
        </Button>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout
        icon={Mail}
        title={t("verify_email")}
        subtitle={`${t("we_sent_code")} ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium bg-green-600 hover:bg-green-700"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("verifying")}
            </>
          ) : (
            t("verify")
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t("didnt_receive")}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            {t("resend")}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Sprout}
      title={t("welcome_title")}
      subtitle={t("welcome_subtitle")}
      footer={
        <>
          {t("already_have_account")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("login")}
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        {t("continue_google")}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{t("or")}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullname">{t("full_name")}</Label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="fullname"
              type="text"
              autoFocus
              placeholder="Jean Mukendi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              required
            />
          </div>
        </div>

        <CountryPhoneSelect
          countryDial={countryDial}
          onCountryChange={setCountryDial}
          phone={phone}
          onPhoneChange={setPhone}
        />

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">{t("confirm_password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label><Globe className="w-3.5 h-3.5 inline mr-1" />{t("preferred_language")}</Label>
          <Select value={language} onValueChange={setLang}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("verification_method")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVerifyMethod("otp")}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                verifyMethod === "otp"
                  ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 text-muted-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">{t("by_otp")}</span>
            </button>
            <button
              type="button"
              onClick={() => setVerifyMethod("email")}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                verifyMethod === "email"
                  ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 text-muted-foreground"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs font-medium">{t("by_email")}</span>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-medium bg-green-600 hover:bg-green-700 rounded-xl" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("creating_account")}
            </>
          ) : (
            t("create_account")
          )}
        </Button>
      </form>
      <GitHubExportButton />
      <p className="text-center text-[10px] text-gray-400 mt-4">{t("created_by")}</p>
    </AuthLayout>
  );
}