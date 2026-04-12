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
        <svg
            className={className}
            viewBox="0 0 340 140"
            fill={white ? "#ffffff" : "#122b5e"}
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
                height: "1em", 
                width: "auto", 
                display: "inline-block",
                verticalAlign: "middle",
                transform: "translateY(0.04em)" // subtle optical alignment
            }}
        >
            {/* 'p' - Notice the slight slant on the descender exactly matching the logo */}
            <path fillRule="evenodd" clipRule="evenodd" d="M 12 26 L 42 26 L 42 43 C 50 26 65 24 82 24 C 112 24 130 44 130 67 C 130 90 112 110 82 110 C 65 110 50 108 42 91 L 42 135 L 12 138 Z M 72 52 C 58 52 42 58 42 67 C 42 76 58 82 72 82 C 86 82 102 76 102 67 C 102 58 86 52 72 52 Z" />
            
            {/* 'a' - Single-story 'a' with flat top matching geometric styling */}
            <path fillRule="evenodd" clipRule="evenodd" d="M 190 26 L 220 26 L 220 110 L 190 110 L 190 93 C 182 110 167 110 150 110 C 120 110 102 90 102 67 C 102 44 120 24 150 24 C 167 24 182 24 190 41 Z M 160 52 C 146 52 130 58 130 67 C 130 76 146 82 160 82 C 174 82 190 76 190 67 C 190 58 174 52 160 52 Z" />

            {/* 'x' - Explicitly wider and bolder as requested */}
            <path d="M 230 26 L 268 26 L 338 110 L 300 110 Z" />
            <path d="M 226 110 L 258 110 L 326 26 L 294 26 Z" />
        </svg>
    );
}
