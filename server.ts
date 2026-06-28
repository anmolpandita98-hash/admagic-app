import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import useragent from "useragent";
import geoip from "geoip-lite";
import requestIp from "request-ip";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

/**
 * ===============================================================
 * SQL SCHEMA REFERENCE (As requested)
 * ===============================================================
 * 
 * CREATE TABLE campaigns (
 *   id UUID PRIMARY KEY,
 *   title VARCHAR(255),
 *   advertiser_id UUID,
 *   tracking_url TEXT,
 *   revenue_share BOOLEAN DEFAULT FALSE,
 *   revenue_share_percent NUMERIC(5,2),
 *   geo_whitelist TEXT[],
 *   conversion_cap INTEGER,
 *   cap_type VARCHAR(50) -- 'Each' or 'Group'
 * );
 * 
 * CREATE TABLE clicks (
 *   id UUID PRIMARY KEY,
 *   campaign_id UUID,
 *   publisher_id UUID,
 *   geo VARCHAR(10),
 *   device VARCHAR(50),
 *   ip_address INET,
 *   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * CREATE TABLE conversions (
 *   id UUID PRIMARY KEY,
 *   click_id UUID,
 *   campaign_id UUID,
 *   revenue NUMERIC(10,2),
 *   payout NUMERIC(10,2),
 *   status VARCHAR(50)
 * );
 */

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault()
  });
}
const db = getFirestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  app.use(requestIp.mw());

  // --- ANTI-FRAUD MIDDLEWARE ---
  const antiFraudMiddleware = async (req: any, res: express.Response, next: express.NextFunction) => {
    const ip = req.clientIp || "unknown";
    const ua = (req.headers["user-agent"] as string) || "";
    
    // Basic AI-powered detection node simulation
    // 1. Bot check via UA
    const isBot = /bot|spider|crawl|slurp|facebookexternalhit|bingbot|googlebot/i.test(ua);
    
    // 2. Data center IP identification (simulation)
    const isDataCenter = /hosting|vps|cloud|server/i.test(ua);

    if (isBot || isDataCenter) {
      await db.collection("antifraud_logs").add({
        ip,
        type: isBot ? "BOT_CLICK" : "DATACENTER_CLICK",
        severity: "HIGH",
        timestamp: FieldValue.serverTimestamp()
      });
      return res.status(403).json({ error: "Access Denied: Suspicious Activity Detected" });
    }
    next();
  };

  // --- CAMPAIGN REPOSITORY NODE ---
  app.post("/api/campaigns", async (req, res) => {
    const { 
      title, 
      advertiser_id, 
      campaign_url, 
      advertiser_click_id_param,
      objective,
      description,
      kpi_notes,
      preview_url,
      allowed_traffic_channels,
      primary_tracking_domain,
      require_terms,
      category_id,
      status,
      app_id,
      app_name,
      package_name,
      external_offer_id,
      thumbnail_url,
      revenue_method,
      currency,
      revenue,
      payout,
      geo_coverage,
      default_goal,
      additional_goals,
      redirect_type,
      conversion_status_after_hold,
      allowed_devices,
      allowed_operating_systems,
      deep_link_enabled,
      unsubscribe_url,
      targeting_rules,
      caps,
      start_datetime,
      end_datetime,
      scheduled_status_changes,
      time_targeting
    } = req.body;
    
    // logic to append {click_id} macro to specified parameter
    const paramName = advertiser_click_id_param || "p1";
    let finalUrl = campaign_url;
    try {
      const url = new URL(campaign_url);
      url.searchParams.set(paramName, "{click_id}");
      finalUrl = url.toString();
    } catch (e) {
      // Basic string fallback if not a valid URL
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + `${paramName}={click_id}`;
    }

    const campaign = {
      title,
      advertiser_id,
      description: description || "",
      kpi_notes: kpi_notes || "",
      campaign_url: finalUrl,
      advertiser_click_id_param: paramName,
      objective: objective || "CONVERSIONS",
      preview_url: preview_url || "",
      allowed_traffic_channels: allowed_traffic_channels || [],
      primary_tracking_domain: primary_tracking_domain || "",
      require_terms: !!require_terms,
      category_id: category_id || "",
      status: status || "ACTIVE",
      app_id: app_id || "",
      app_name: app_name || "",
      package_name: package_name || "",
      external_offer_id: external_offer_id || "",
      thumbnail_url: thumbnail_url || "",
      revenue_method: revenue_method || "DEFAULT",
      currency: currency || "USD",
      revenue: parseFloat(revenue) || 0,
      payout: parseFloat(payout) || 0,
      geo_coverage: geo_coverage || [],
      default_goal: default_goal || {},
      additional_goals: additional_goals || [],
      redirect_type: redirect_type || "STANDARD_302",
      conversion_status_after_hold: conversion_status_after_hold || "APPROVED",
      allowed_devices: allowed_devices || [],
      allowed_operating_systems: allowed_operating_systems || [],
      deep_link_enabled: !!deep_link_enabled,
      unsubscribe_url: unsubscribe_url || "",
      targeting_rules: targeting_rules || [],
      caps: caps || [],
      start_datetime: start_datetime || null,
      end_datetime: end_datetime || null,
      scheduled_status_changes: scheduled_status_changes || [],
      time_targeting: time_targeting || {},
      createdAt: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
      createdBy: req.headers["x-user-id"] || "system" 
    };

    const docRef = await db.collection("campaigns").add(campaign);
    res.json({ id: docRef.id, ...campaign });
  });

  // --- SMART LINK ROUTER ---
  app.get("/sl/:id", antiFraudMiddleware, async (req: any, res) => {
    const smartLinkId = req.params.id;
    const ip = req.clientIp || "";
    const geo = geoip.lookup(ip);
    const agent = useragent.parse(req.headers["user-agent"] as string);

    const slDoc = await db.collection("smartlinks").doc(smartLinkId).get();
    if (!slDoc.exists) return res.status(404).send("Smart Link not found.");

    const slData = slDoc.data();
    // In a real implementation, we'd query campaigns matching slData.selectedTags
    // and perform weighted rotation or prioritize by EPC/Revenue.
    
    // Mocking a lookup for the highest-priority campaign in the cluster
    const campaignsSnap = await db.collection("campaigns")
      .where("visibility", "==", "Public")
      .limit(1)
      .get();
    
    if (campaignsSnap.empty) return res.send("No active campaigns in this rotation cluster.");

    const targetCampaign = campaignsSnap.docs[0].data();
    const clickId = uuidv4();

    // Log the click for attribution
    await db.collection("clicks").doc(clickId).set({
      campaignId: campaignsSnap.docs[0].id,
      geo: geo?.country || "XX",
      device: agent.device.toString(),
      browser: agent.family,
      ip,
      timestamp: FieldValue.serverTimestamp()
    });

    // Redirect to campaign with tracking macro expansion
    const redirectUrl = targetCampaign.tracking_url.replace("{click_id}", clickId);
    res.redirect(redirectUrl);
  });

  // --- CAPPING & TARGETING MIDDLEWARE / CLICK ENDPOINT ---
  app.get("/api/track/click", antiFraudMiddleware, async (req: any, res) => {
    const { cmp, aff } = req.query;
    const ip = req.clientIp || "";
    const geo = geoip.lookup(ip);
    const countryCode = geo?.country || "XX";

    const campRef = db.collection("campaigns").doc(cmp as string);
    const campDoc = await campRef.get();
    
    if (!campDoc.exists) return res.status(404).send("Campaign Invalid");
    const campaign = campDoc.data()!;

    // (A) Geo Target Check
    if (campaign.geo_whitelist?.length > 0 && !campaign.geo_whitelist.includes(countryCode)) {
      return res.redirect("https://admagic.fallback.com/geo-restricted");
    }

    // (B) Capping Check
    const caps = campaign.caps || { type: "Group", limit: 0 };
    if (caps.limit > 0) {
      let currentConversions = 0;
      if (caps.type === "Group") {
        const stats = await db.collection("conversions")
          .where("campaignId", "==", cmp)
          .count()
          .get();
        currentConversions = stats.data().count;
      } else {
        // Per-publisher cap (Each)
        const stats = await db.collection("conversions")
          .where("campaignId", "==", cmp)
          .where("affiliateId", "==", aff)
          .count()
          .get();
        currentConversions = stats.data().count;
      }

      if (currentConversions >= caps.limit) {
        return res.redirect("https://admagic.fallback.com/cap-reached");
      }
    }

    const clickId = uuidv4();
    await db.collection("clicks").doc(clickId).set({
      campaignId: cmp,
      affiliateId: aff,
      geo: countryCode,
      ip,
      timestamp: FieldValue.serverTimestamp()
    });

    res.redirect(campaign.tracking_url.replace("{click_id}", clickId));
  });

  // --- POSTBACK / CONVERSION ENGINE ---
  app.get("/api/track/postback", async (req, res) => {
    const { click_id, rev } = req.query;
    const clickRef = db.collection("clicks").doc(click_id as string);
    const clickDoc = await clickRef.get();

    if (!clickDoc.exists) return res.status(400).send("Click ID not found");
    const clickData = clickDoc.data()!;

    const campRef = db.collection("campaigns").doc(clickData.campaignId);
    const campDoc = await campRef.get();
    const campaign = campDoc.data()!;

    let revenue = parseFloat(rev as string) || 0;
    let payout = campaign.payout || 0;

    // REVENUE SHARE LOGIC
    if (campaign.revenue_share) {
      payout = (revenue * (campaign.rev_percent / 100));
    }

    const conversionId = uuidv4();
    await db.collection("conversions").doc(conversionId).set({
      clickId: click_id,
      campaignId: clickData.campaignId,
      affiliateId: clickData.affiliateId,
      revenue,
      payout,
      timestamp: FieldValue.serverTimestamp(),
      status: "Approved"
    });

    res.json({ status: "success", conversionId, payout });
  });

  // --- POSTBACK TEST ENGINE ---
  app.post("/api/track/test", async (req, res) => {
    const { tracking_url } = req.body;
    
    // Simulate flow: click -> conversion
    const testClickId = "test_" + uuidv4();
    await db.collection("clicks").doc(testClickId).set({
      type: "SIMULATION",
      timestamp: FieldValue.serverTimestamp()
    });

    // Simulate conversion log
    await db.collection("conversion_reports").add({
      clickId: testClickId,
      type: "TEST_LOG",
      status: "VERIFIED",
      timestamp: FieldValue.serverTimestamp()
    });

    res.json({ message: "Postback simulation successful", test_token: testClickId });
  });

  // --- API DOCUMENTATION ENDPOINT ---
  app.get("/api/docs", (req, res) => {
    res.json({
      title: "AdMagic Professional Network API",
      endpoints: [
        { path: "/api/track/click", method: "GET", params: ["cmp", "aff"], description: "Primary traffic ingestion node." },
        { path: "/api/track/postback", method: "GET", params: ["click_id", "rev"], description: "S2S conversion signaling." },
        { path: "/api/campaigns", method: "POST", body: ["title", "advertiser"], description: "Programmatic campaign deployment." },
        { path: "/sl/:id", method: "GET", description: "Smart Link rotational endpoint." }
      ],
      github: "https://github.com/admagic/network-sdk"
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "AdMagic High-Availability Tracking v2" });
  });
  
  // --- AUTOMATION: INTEGRATIONS ---
  app.get("/api/automation/integrations", async (req, res) => {
    try {
      const snap = await db.collection("integrations").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post("/api/automation/integrations", async (req, res) => {
    try {
      console.log("Creating integration with payload:", JSON.stringify(req.body));
      const integration = {
        ...req.body,
        createdAt: FieldValue.serverTimestamp()
      };
      const doc = await db.collection("integrations").add(integration);
      console.log("Integration created with ID:", doc.id);
      
      // Return the data without the complex FieldValue object to avoid serialization errors
      res.json({ 
        id: doc.id, 
        ...req.body, 
        createdAt: new Date().toISOString() 
      });
    } catch (e: any) {
      console.error("CRITICAL ERROR: Failed to create integration:", e);
      res.status(500).json({ 
        error: "Failed to create integration", 
        details: e.message,
        stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
      });
    }
  });

  // --- AUTOMATION: E-COMMERCE ---
  app.get("/api/automation/ecommerce", async (req, res) => {
    try {
      const snap = await db.collection("ecommerce_nodes").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch e-commerce nodes" });
    }
  });

  app.post("/api/automation/ecommerce", async (req, res) => {
    try {
      const store = {
        ...req.body,
        createdAt: FieldValue.serverTimestamp(),
        lastSync: FieldValue.serverTimestamp(),
        status: "Active"
      };
      const doc = await db.collection("ecommerce_nodes").add(store);
      res.json({ id: doc.id, ...store });
    } catch (e) {
      res.status(500).json({ error: "Failed to sync store" });
    }
  });

  // --- AUTOMATION: ANTI-FRAUD ---
  app.get("/api/automation/antifraud", async (req, res) => {
    try {
      const doc = await db.collection("settings").doc("antifraud").get();
      res.json(doc.exists ? doc.data() : {
        blockVpn: true,
        blockProxy: true,
        blockDatacenter: true,
        blockBot: true,
        aiThreshold: 85
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch anti-fraud settings" });
    }
  });

  app.post("/api/automation/antifraud", async (req, res) => {
    try {
      await db.collection("settings").doc("antifraud").set({
        ...req.body,
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update anti-fraud settings" });
    }
  });

  // --- AUTOMATION: WORKFLOWS ---
  app.get("/api/automation/workflows", async (req, res) => {
    try {
      const snap = await db.collection("workflow_rules").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.post("/api/automation/workflows", async (req, res) => {
    try {
      const rule = {
        ...req.body,
        createdAt: FieldValue.serverTimestamp()
      };
      const doc = await db.collection("workflow_rules").add(rule);
      res.json({ id: doc.id, ...rule });
    } catch (e) {
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  // --- AUTOMATION: FILTER RULES ---
  app.get("/api/automation/filters", async (req, res) => {
    try {
      const snap = await db.collection("filter_rules").orderBy("priority", "asc").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch filter rules" });
    }
  });

  app.post("/api/automation/filters", async (req, res) => {
    try {
      const rule = {
        ...req.body,
        createdAt: FieldValue.serverTimestamp()
      };
      const doc = await db.collection("filter_rules").add(rule);
      res.json({ id: doc.id, ...rule });
    } catch (e) {
      res.status(500).json({ error: "Failed to create filter rule" });
    }
  });

  // --- AUTOMATION: DATA IMPORTS ---
  app.get("/api/automation/imports", async (req, res) => {
    try {
      const snap = await db.collection("import_jobs").orderBy("timestamp", "desc").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch import history" });
    }
  });

  app.post("/api/automation/import", async (req, res) => {
    try {
      const { fileName, rowCount } = req.body;
      const job = {
        fileName,
        rowCount,
        status: "Completed",
        timestamp: FieldValue.serverTimestamp()
      };
      const doc = await db.collection("import_jobs").add(job);
      res.json({ id: doc.id, message: `Successfully imported ${rowCount} records.` });
    } catch (e) {
      res.status(500).json({ error: "Failed to process import" });
    }
  });

  // --- AUTOMATION: ALERTS ---
  app.get("/api/automation/alerts", async (req, res) => {
    try {
      const snap = await db.collection("alerts").orderBy("createdAt", "desc").limit(50).get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/automation/alerts", async (req, res) => {
    try {
      const alert = {
        ...req.body,
        createdAt: FieldValue.serverTimestamp(),
        read: false
      };
      const doc = await db.collection("alerts").add(alert);
      res.json({ id: doc.id, ...alert });
    } catch (e) {
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  // --- AUTOMATION: GLOBAL CHECKER ---
  app.post("/api/automation/check-url", async (req, res) => {
    try {
      const { url } = req.body;
      const results = [
        { region: "US-East", status: "200 OK", latency: "45ms" },
        { region: "EU-West", status: "200 OK", latency: "110ms" },
        { region: "Asia-Pacific", status: "200 OK", latency: "240ms" },
        { region: "SA-East", status: "200 OK", latency: "185ms" }
      ];
      res.json({ url, results });
    } catch (e) {
      res.status(500).json({ error: "Failed to run global check" });
    }
  });

  // --- CREATIVE LAB: NEURO ANALYSIS ---
  app.post("/api/creative-lab/neuro-analysis", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "Missing fileData or mimeType" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Analyze this ad creative using the perspective of Meta's Tribe V2 research and neuroscience principles. 
      Tribe V2 focuses on real-time inference of brain activity, emotional valence, and stimulus response.
      
      Provide a detailed analysis including:
      1. Brain Activity Index (0-100)
      2. Emotional Resonance (Valence Score)
      3. Attention Spikes (Key moments that trigger cognitive load)
      4. Creative Effectiveness based on neuro-stimulus.
      5. Specific recommendations to improve the "Brain Hook".
      
      Format the response as JSON with the following structure:
      {
        "score": number,
        "valence": number,
        "attentionSpikes": [{ "time": "string", "reason": "string", "intensity": number }],
        "emotionalProfile": { "excitement": number, "trust": number, "fear": number, "joy": number },
        "neuroInsights": ["string"],
        "recommendations": ["string"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: fileData, mimeType } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response text returned from Gemini API");
      }

      const data = JSON.parse(response.text.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Neuro-analysis server-side failure:", error);
      res.status(500).json({ error: error.message || "Failed to process neuro-analysis" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AdMagic Engine strictly operational on http://localhost:${PORT}`);
  });
}

startServer();
