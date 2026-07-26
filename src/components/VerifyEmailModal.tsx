import React, { useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, X, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ email, onClose, onSuccess }) => {
  const { verifyEmail, resendVerificationCode, demoCode } = useAuth();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await verifyEmail(email, fullCode);
    setLoading(false);

    if (res.success) {
      setSuccess('Email verified successfully! Loading your dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(res.error || 'Failed to verify email code.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await resendVerificationCode(email);
    setLoading(false);

    if (res.success) {
      setSuccess('A new 6-digit verification code has been sent!');
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(res.error || 'Failed to resend code.');
    }
  };

  // Quick fill demo code helper
  const handleQuickFill = () => {
    if (demoCode && demoCode.length === 6) {
      setCode(demoCode.split(''));
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            We've sent a 6-digit confirmation code to <span className="font-semibold text-indigo-300">{email}</span>
          </p>
        </div>

        {/* Demo Helper Banner */}
        {demoCode && (
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Demo Code: <strong className="text-white font-mono tracking-wider">{demoCode}</strong>
              </span>
            </div>
            <button
              onClick={handleQuickFill}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
            >
              Auto Fill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-sm flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 6-Digit Code Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-bold font-mono bg-gray-950 border border-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl outline-none transition text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Verify & Continue</span>
              </>
            )}
          </button>
        </form>

        {/* Resend Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-800 pt-4 flex items-center justify-between">
          <span>Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 font-semibold transition flex items-center space-x-1"
          >
            {resendCooldown > 0 ? (
              <span>Resend code in {resendCooldown}s</span>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
