'use client';

import PhoneInputComponent from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = 'Enter phone number',
  disabled = false,
  className = '',
  error,
}: PhoneInputProps) {
  return (
    <div className={className}>
      <PhoneInputComponent
        international
        countryCallingCodeEditable={false}
        defaultCountry="US"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`phone-input ${error ? 'phone-input-error' : ''}`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      <style jsx global>{`
        .phone-input-wrapper .phone-input .PhoneInputInput {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 14px;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #111827 !important;
          background-color: #ffffff !important;
          caret-color: #111827;
        }
        
        .phone-input-wrapper .phone-input .PhoneInputInput::placeholder {
          color: #6b7280 !important;
        }
        
        .phone-input-wrapper .phone-input .PhoneInputInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .phone-input-error .PhoneInputInput {
          border-color: #ef4444 !important;
        }
        
        .phone-input-error .PhoneInputInput:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .phone-input-wrapper .phone-input .PhoneInputCountrySelect {
          margin-right: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem;
          background: white !important;
          color: #111827 !important;
        }
        
        .phone-input-wrapper .phone-input .PhoneInputCountrySelect:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .phone-input-wrapper .phone-input .PhoneInputCountrySelectArrow {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}