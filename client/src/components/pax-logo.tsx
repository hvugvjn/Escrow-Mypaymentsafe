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
    /** When true, renders as text-only (Inter font) instead of an image */
    textOnly?: boolean;
}

export function PaxLogo({ className = "", white = false, textOnly = false }: PaxLogoProps) {
    // Standardize branding: Purely typographic for maximum precision and scalability
    // Uses Inter (Black 900) for an authoritative, matured tech feel
    return (
        <span 
            className={`font-["Inter"] font-[900] lowercase tracking-tighter inline-flex items-center ${className}`}
            style={{ 
                color: white ? "#ffffff" : "#122b5e",
                lineHeight: '1'
            }}
        >
            pax
        </span>
    );
}
