import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, X, Check } from 'lucide-react';

export const CLIENT_ENGINE_PIN = '1991';
const STORAGE_KEY = 'client_engine_pin_unlocked';

export function isPinUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPinUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

interface PinPromptProps {
  mode?: 'modal' | 'inline';
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const PinPrompt: React.FC<PinPromptProps> = ({
  mode = 'inline',
  title = 'Clients & Engine Profiles Security',
  subtitle = 'Enter 4-digit PIN to access client profiles and engine configurations.',
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = (codeToVerify?: string) => {
    const candidate = codeToVerify ?? pin;
    if (candidate === CLIENT_ENGINE_PIN) {
      setError(false);
      setErrorMessage('');
      setPinUnlocked(true);
      onSuccess();
    } else {
      setError(true);
      setErrorMessage('Incorrect PIN. Please enter the valid PIN (1991).');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setError(false);
    if (val.length === 4) {
      handleVerify(val);
    }
  };

  const content = (
    <div className="w-full max-w-sm mx-auto bg-slate-900 border border-slate-700/90 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
      {/* Top Header Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">{subtitle}</p>
      </div>

      {/* Hidden real input for mobile keyboard / pasting */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && pin.length > 0) {
            handleVerify();
          }
        }}
        className="opacity-0 absolute -z-10 h-0 w-0"
        autoFocus
      />

      {/* 4 Digit Visual Boxes */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex justify-center items-center gap-3 cursor-pointer py-1"
      >
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500/10 text-rose-300 animate-pulse'
                  : filled
                  ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                  : 'border-slate-700 bg-slate-950/60 text-slate-600'
              }`}
            >
              {filled ? '•' : ''}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1.5 bg-rose-950/30 border border-rose-500/30 rounded-lg py-1.5 px-3">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* On-screen Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyPress(digit)}
            className="h-11 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-white font-mono text-lg font-bold border border-slate-700/80 transition active:scale-95 shadow-sm"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          className="h-11 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700/60 transition active:scale-95"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="h-11 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-white font-mono text-lg font-bold border border-slate-700/80 transition active:scale-95 shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-11 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700/60 transition active:scale-95"
        >
          ⌫ Back
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => handleVerify()}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Unlock</span>
        </button>
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
        <KeyRound className="w-3 h-3 text-amber-400" />
        <span>Default PIN is <strong>1991</strong></span>
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 px-4 flex justify-center items-center">
      {content}
    </div>
  );
};
