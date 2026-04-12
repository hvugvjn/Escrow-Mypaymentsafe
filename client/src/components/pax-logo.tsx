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
            src="/pax-logo.png" 
            alt="pax logo" 
            className={className} 
            style={{ 
                height: "1.2em", 
                width: "auto", 
                display: "inline-block", 
                verticalAlign: "middle",
                transform: "translateY(-0.05em)",
                // If it's a dark logo and needs to be white for dark backgrounds:
                filter: white ? "brightness(0) invert(1)" : "none",
                // Mix blend mode ensures solid white backgrounds disappear on dark headers
                mixBlendMode: white ? "screen" : "multiply"
            }} 
        />
    );
}
