type MoneyProps = {
  amount: number;
  currency: string;
  locale?: string;
};

export function Money({ amount, currency, locale = "en-US" }: MoneyProps) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  const parts = formatter.formatToParts(amount);

  return (
    <span className="inline-flex items-baseline tabular-nums">
      {parts.map((part, index) =>
        part.type === "fraction" ? (
          <span key={`${part.type}-${index}`} className="text-money-cents">
            {part.value}
          </span>
        ) : (
          <span key={`${part.type}-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  );
}
