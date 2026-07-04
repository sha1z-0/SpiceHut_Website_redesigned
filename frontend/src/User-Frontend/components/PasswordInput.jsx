import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { calculateStrength } from "../utils/passwordUtils";

const PasswordInput = ({
  value, onChange, placeholder = "Password",
  errors = [], showStrengthMeter = true,
  className = "", inputClassName = "", ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = calculateStrength(value);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-premium pr-12 ${inputClassName}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2B1D17] p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>

      {showStrengthMeter && value && (
        <div className="space-y-1 px-0.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#2B1D17]/40">Strength</span>
            <span className={`font-semibold ${strength.color.replace("bg-", "text-").replace("-500", "-600")}`}>
              {strength.label} ({Math.round(strength.percentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.percentage}%` }} />
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-0.5 px-0.5">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-500 font-medium">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
