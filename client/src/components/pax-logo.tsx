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
    if (textOnly) {
        return (
            <span 
                className={`font-["Inter"] font-black lowercase tracking-tighter ${className}`}
                style={{ color: white ? "#ffffff" : "#122b5e" }}
            >
                pax
            </span>
        );
    }

    return (
        <img 
            src={white ? "/logo-white.jpg" : "/logo-dark.jpg"} 
            alt="Pax Logo"
            className={`h-12 w-auto object-contain ${!white ? 'mix-blend-multiply' : ''} ${className}`}
            style={{ mixBlendMode: !white ? 'multiply' : 'normal' }}
        />
    );
}
