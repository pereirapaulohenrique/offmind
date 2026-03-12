/**
 * Edge-fade gradient divider between sections.
 * A 1px line that fades to transparent at both ends — cleaner than hard borders.
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: '1px',
        background:
          'linear-gradient(to right, transparent, rgba(161,161,170,0.15) 20%, rgba(161,161,170,0.15) 80%, transparent)',
      }}
    />
  );
}
