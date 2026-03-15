export default function HeatLevel({ level, size = "text-base" }) {
  if (level === 0) {
    return <span className={`${size} text-warm-400`} title="No heat">—</span>;
  }
  return (
    <span className={`${size} inline-flex gap-0.5`} title={`Heat level: ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? "opacity-100" : "opacity-20"}>
          🌶️
        </span>
      ))}
    </span>
  );
}
