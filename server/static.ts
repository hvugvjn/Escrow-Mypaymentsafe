import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectMetaTags } from "./seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", async (req, res) => {
    try {
      const url = req.originalUrl;
      const htmlPath = path.resolve(distPath, "index.html");
      let html = await fs.promises.readFile(htmlPath, "utf-8");
      
      // Inject tags based on the URL path dynamically
      html = injectMetaTags(url, html);
      
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
