export function getPasswordStrength(pass: string): number {
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score;
}

const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = [
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-[#18372b]",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#657069]">Password strength</span>
        <span className="font-semibold text-[#18372b]">
          {strengthLabels[strength]}
        </span>
      </div>
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-[#dfe2dc]">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              index < strength ? strengthColors[strength] : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

