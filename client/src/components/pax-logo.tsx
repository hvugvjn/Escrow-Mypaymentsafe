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

    const logoSrc = white ? "/pax-light-logo.png" : "/pax-dark-logo.png";
    const hasHeightClass = /\bh-\d+|\bh-\[\w+\]/.test(className);
    const heightClass = hasHeightClass ? "" : "h-7 md:h-8";

    return (
        <img 
            src={logoSrc} 
            alt="pax logo" 
            className={`${heightClass} w-auto object-contain inline-block shrink-0 align-middle ${className}`} 
        />
    );
}
