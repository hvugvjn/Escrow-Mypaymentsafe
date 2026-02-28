/**
 * PaxLogo — renders the brand name "pax" in the official logo style:
 *   • Nunito ExtraBold (800)
 *   • Lowercase
 *   • Dark navy #1e3a6e
 *
 * Usage:
 *   <PaxLogo />                    — default size
 *   <PaxLogo className="text-4xl" /> — custom size via className
 *   <PaxLogo white />               — white variant (for dark backgrounds)
 */

interface PaxLogoProps {
    className?: string;
    /** When true, renders in white (for use on dark/coloured backgrounds) */
    white?: boolean;
}

export function PaxLogo({ className = "", white = false }: PaxLogoProps) {
    return (
        <span
            className={className}
            style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                color: white ? "#ffffff" : "#1e3a6e",
                letterSpacing: "-0.02em",
                lineHeight: 1,
            }}
        >
            pax
        </span>
    );
}
