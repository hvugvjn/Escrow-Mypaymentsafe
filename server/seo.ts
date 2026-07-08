export function injectMetaTags(url: string, html: string): string {
  // Parse path to find matching metadata
  const path = url.split("?")[0];
  
  let title = "PAX - Secure B2B Escrow & Trade Protection";
  let description = "Secure B2B trade, import/export shipments, and commercial contracts. PAX locks transaction values in regulated escrow, protecting buyers and sellers from credit and delivery risks.";
  const ogImage = "https://www.paxdot.com/assets/pax-share-banner.png"; // Premium share banner

  if (path === "/info/escrow-for-import-export") {
    title = "Secure Import & Export Escrow Solutions - PAX";
    description = "Eliminate cross-border default risk, secure supplier advance deposits, and gate payouts against Bill of Lading, weight slips, and custom clearance papers.";
  } else if (path === "/info/escrow-for-wholesale-trade") {
    title = "B2B Escrow for Bulk Wholesale & Manufacturing - PAX";
    description = "Protect domestic supply lines, secure raw materials, and prevent buyer default. Gate payouts against freight loading, weight clearance, and inspection approvals.";
  } else if (path === "/info/escrow-for-service-contracts") {
    title = "Milestone Escrow for High-Value Service Contracts - PAX";
    description = "Safeguard software development milestones, digital agency deliverables, and high-value consultancy agreements. Payouts release strictly upon milestone code reviews and UAT approvals.";
  } else if (path === "/info/dispute-resolution") {
    title = "Neutral Arbitration & Dispute Resolution - PAX";
    description = "When trade disputes arise, PAX freezes payouts and brings in trade-specific inspectors or technical auditors to resolve issues neutrally.";
  } else if (path === "/info/managed-escrow") {
    title = "Managed Nodal Escrow Infrastructure - PAX";
    description = "RBI-compliant secure nodal accounts. Protect buyer deposits and guarantee seller payments with dual-consent gates.";
  } else if (path === "/info/guaranteed-payments") {
    title = "Guaranteed Payments for Exporters & Sellers - PAX";
    description = "Secure trade financing. Exporters ship with complete payment security, knowing buyer funds are locked in nodal banking vaults.";
  } else if (path === "/info/trust-and-safety") {
    title = "RBI Nodal Guidelines & Compliance - PAX";
    description = "Safe financial custody. PAX operates strictly under RBI-compliant nodal banking rules to secure transaction values.";
  } else if (path === "/privacy") {
    title = "Privacy Policy - PAX B2B Escrow";
    description = "Read how PAX protects your corporate data and transaction history.";
  } else if (path === "/terms") {
    title = "Terms of Service - PAX B2B Escrow";
    description = "Review the terms and legal parameters governing trade escrow on PAX.";
  } else if (path === "/support") {
    title = "Contact Trade Specialist & Support - PAX";
    description = "Get in touch with our operations desk for customs clearance, contract adjustments, or dispute inquiries.";
  }

  let modifiedHtml = html;
  
  // Replace existing default title
  modifiedHtml = modifiedHtml.replace(/<title>[^<]*<\/title>/g, "");
  
  // Replace existing default description meta tag
  modifiedHtml = modifiedHtml.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, "");
  
  // Construct dynamic SEO and Social Card Tags
  const seoTags = `
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.paxdot.com${path}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="PAX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
  `;

  // Inject the tags right before </head>
  modifiedHtml = modifiedHtml.replace("</head>", `${seoTags}\n</head>`);

  return modifiedHtml;
}
