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
        <img 
            src={white ? "/logo-white.jpg" : "/logo-dark.jpg"} 
            alt="Pax Logo"
            className={`h-12 w-auto object-contain mix-blend-multiply ${white ? 'mix-blend-normal' : ''} ${className}`}
            style={{ mixBlendMode: white ? 'normal' : 'multiply' }}
        />
    );
}
