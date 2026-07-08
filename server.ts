import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, AggregateField } from "firebase-admin/firestore";
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

// Note: __filename/__dirname were previously derived from import.meta.url, which
// is empty once esbuild bundles this to CJS (dist/server.cjs) and made the
// production bundle throw on boot. They were unused; all paths resolve from
// process.cwd() instead.

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault()
  });
}
const db = getFirestore();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(requestIp.mw());

  // --- AUTH: verify a Firebase ID token on protected routes ---
  // Management endpoints require a real signed-in user. The client attaches
  // `Authorization: Bearer <idToken>` via src/lib/api.ts. The old spoofable
  // `x-user-id` header is no longer trusted anywhere.
  const requireAuth = async (req: any, res: express.Response, next: express.NextFunction) => {
    const header = (req.headers.authorization as string) || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing Authorization bearer token" });
    try {
      const decoded = await getAuth().verifyIdToken(token);
      req.uid = decoded.uid;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  // Body parsers are scoped deliberately:
  //  - Neuro Creative Lab accepts large base64 image uploads, so its route gets
  //    a 50mb JSON parser mounted BEFORE the global 1mb parser (Express uses the
  //    first parser that consumes the body; a small global limit registered first
  //    would 413 the upload before the per-route parser ever ran).
  //  - Everything else is capped at 1mb to remove a memory-exhaustion vector on
  //    the public, unauthenticated tracking endpoints.
  const largeJson = express.json({ limit: "50mb" });
  app.use("/api/creative-lab/neuro-analysis", largeJson);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

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

  // --- TRACKING HELPERS ---
  // Expand the {click_id} macro into a stored advertiser URL. URLSearchParams
  // percent-encodes braces on write, so the stored URL may contain either the
  // raw `{click_id}` or the encoded `%7Bclick_id%7D` (case can vary by
  // serializer). Match both forms, case-insensitively, so attribution never
  // silently ships the literal macro to the advertiser.
  const expandClickMacro = (url: string, clickId: string): string =>
    url.replace(/\{click_id\}|%7Bclick_id%7D/gi, clickId);

  // Resolve the GROSS_CONVERSIONS cap (if any) from the canonical array shape
  // and return { limit, scope } or null when no such cap exists. Legacy docs
  // with a non-array `caps` field are treated as uncapped.
  const resolveConversionCap = (campaign: any): { limit: number; scope: string } | null => {
    if (!Array.isArray(campaign.caps)) return null;
    const cap = campaign.caps.find((c: any) => c && c.type === "GROSS_CONVERSIONS");
    if (!cap) return null;
    const limit = Number(cap.value);
    if (!Number.isFinite(limit) || limit <= 0) return null;
    return { limit, scope: cap.scope || "CAMPAIGN" };
  };

  // Current approved+in-scope conversion count for a campaign. PUBLISHER scope
  // is the per-affiliate ("Each") case; anything else is campaign-wide ("Group").
  const getConversionCount = async (
    campaignId: string,
    affiliateId: string | undefined,
    cap: { limit: number; scope: string }
  ): Promise<number> => {
    let q: FirebaseFirestore.Query = db.collection("conversions").where("campaignId", "==", campaignId);
    if (cap.scope === "PUBLISHER" && affiliateId) {
      q = q.where("affiliateId", "==", affiliateId);
    }
    const stats = await q.count().get();
    return stats.data().count;
  };

  // --- CAMPAIGN REPOSITORY NODE ---
  app.post("/api/campaigns", requireAuth, async (req: any, res) => {
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
      geo_whitelist,
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
      time_targeting,
      visibility,
      revenue_share,
      revenue_share_percent
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
      // Smart Link rotation queries where("visibility","==","Public"); without
      // this field stored, no Smart Link ever matches a campaign.
      visibility: visibility || "Public",
      // Geo whitelist can arrive under either key from the two create forms.
      geo_whitelist: geo_whitelist || geo_coverage || [],
      // Revenue-share fields are normalized here so postback math never sees
      // undefined (which would produce a NaN payout persisted to Firestore).
      revenue_share: !!revenue_share,
      revenue_share_percent: Number(revenue_share_percent) || 0,
      // Per-campaign shared secret required on postbacks to prevent anyone who
      // sees or guesses a click ID from minting conversions (i.e. payouts).
      postback_token: uuidv4(),
      createdAt: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp(),
      createdBy: req.uid
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
    if (!targetCampaign.campaign_url) {
      return res.status(500).send("Campaign has no destination URL");
    }
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

    // Redirect to campaign with tracking macro expansion (raw + encoded forms)
    res.redirect(expandClickMacro(targetCampaign.campaign_url, clickId));
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

    if (!campaign.campaign_url) {
      return res.status(500).send("Campaign has no destination URL");
    }

    // (A) Geo Target Check
    // geoip.lookup returns null for private/localhost IPs (all local testing) and
    // some real IPs, resolving to "XX". Skip the whitelist check for unknown
    // countries so dev testing and un-geolocatable users aren't blanket-blocked.
    if (
      countryCode !== "XX" &&
      campaign.geo_whitelist?.length > 0 &&
      !campaign.geo_whitelist.includes(countryCode)
    ) {
      return res.status(200).send("Offer unavailable in your region");
    }

    // (B) Capping Check (canonical array shape; legacy/non-array caps = uncapped)
    const cap = resolveConversionCap(campaign);
    if (cap) {
      const currentConversions = await getConversionCount(cmp as string, aff as string, cap);
      if (currentConversions >= cap.limit) {
        return res.status(200).send("Offer cap reached");
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

    res.redirect(expandClickMacro(campaign.campaign_url, clickId));
  });

  // --- POSTBACK / CONVERSION ENGINE ---
  app.get("/api/track/postback", async (req, res) => {
    const { click_id, rev, token } = req.query;
    const clickRef = db.collection("clicks").doc(click_id as string);
    const clickDoc = await clickRef.get();

    if (!clickDoc.exists) return res.status(400).send("Click ID not found");
    const clickData = clickDoc.data()!;

    const campRef = db.collection("campaigns").doc(clickData.campaignId);
    const campDoc = await campRef.get();
    // Campaign may have been deleted after the click was recorded.
    if (!campDoc.exists) return res.status(410).send("Campaign no longer exists");
    const campaign = campDoc.data()!;

    // Postback token check. Campaigns created after tokens were introduced carry
    // a `postback_token` and must present it. Legacy token-less campaigns are
    // accepted but flagged `unverified` rather than hard-rejected, so existing
    // advertiser integrations don't silently break mid-flight but stay auditable.
    let unverified = false;
    if (campaign.postback_token) {
      if (token !== campaign.postback_token) {
        return res.status(403).json({ error: "Invalid postback token" });
      }
    } else {
      unverified = true;
    }

    const revenue = parseFloat(rev as string) || 0;
    let payout = Number(campaign.payout) || 0;

    // REVENUE SHARE LOGIC — guard against NaN (a legal Firestore number that
    // would otherwise be silently persisted into financial records).
    if (campaign.revenue_share) {
      payout = revenue * (Number(campaign.revenue_share_percent) / 100);
    }
    if (!Number.isFinite(payout)) payout = 0;

    // Conversion-time cap enforcement. Conversions arrive after clicks, so a
    // campaign at cap with in-flight clicks can still receive postbacks; record
    // over-cap conversions as Rejected with payout 0 rather than dropping them,
    // preserving the audit trail (standard tracking-platform behavior).
    let status = "Approved";
    const cap = resolveConversionCap(campaign);
    if (cap) {
      const currentApproved = await getConversionCount(clickData.campaignId, clickData.affiliateId, cap);
      if (currentApproved >= cap.limit) {
        status = "Rejected";
        payout = 0;
      }
    }

    // Idempotency: use the click ID as the conversion doc ID and .create() (not
    // .set()), which fails with ALREADY_EXISTS if the doc exists. This dedupes
    // atomically without a read-then-write race — the same click_id can never
    // mint more than one conversion (a direct financial exploit otherwise).
    const conversionDoc: any = {
      clickId: click_id,
      campaignId: clickData.campaignId,
      affiliateId: clickData.affiliateId ?? null,
      revenue,
      payout,
      timestamp: FieldValue.serverTimestamp(),
      status
    };
    if (unverified) conversionDoc.unverified = true;

    try {
      await db.collection("conversions").doc(click_id as string).create(conversionDoc);
    } catch (e: any) {
      if (e?.code === 6 /* ALREADY_EXISTS */) {
        return res.status(409).json({ error: "Conversion already recorded for this click_id" });
      }
      throw e;
    }

    res.json({ status: "success", conversionId: click_id, payout, conversion_status: status });
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
        { path: "/api/track/postback", method: "GET", params: ["click_id", "rev", "token"], description: "S2S conversion signaling (token required for tokened campaigns)." },
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
  app.get("/api/automation/integrations", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("integrations").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post("/api/automation/integrations", requireAuth, async (req, res) => {
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
  app.get("/api/automation/ecommerce", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("ecommerce_nodes").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch e-commerce nodes" });
    }
  });

  app.post("/api/automation/ecommerce", requireAuth, async (req, res) => {
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
  app.get("/api/automation/antifraud", requireAuth, async (req, res) => {
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

  app.post("/api/automation/antifraud", requireAuth, async (req, res) => {
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
  app.get("/api/automation/workflows", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("workflow_rules").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.post("/api/automation/workflows", requireAuth, async (req, res) => {
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
  app.get("/api/automation/filters", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("filter_rules").orderBy("priority", "asc").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch filter rules" });
    }
  });

  app.post("/api/automation/filters", requireAuth, async (req, res) => {
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
  app.get("/api/automation/imports", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("import_jobs").orderBy("timestamp", "desc").get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch import history" });
    }
  });

  app.post("/api/automation/import", requireAuth, async (req, res) => {
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
  app.get("/api/automation/alerts", requireAuth, async (req, res) => {
    try {
      const snap = await db.collection("alerts").orderBy("createdAt", "desc").limit(50).get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/automation/alerts", requireAuth, async (req, res) => {
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
  app.post("/api/automation/check-url", requireAuth, async (req, res) => {
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

  // --- REPORTING: real Firestore aggregates (server-side, uid-scoped) ---
  // All windows are UTC and labeled UTC in the UI. Aggregates read index
  // entries (count/sum), not documents, so cost stays flat as click volume grows.
  const ZERO = { clicks: 0, conversions: 0, revenue: 0, payout: 0, profit: 0 };
  const finite = (n: any) => (Number.isFinite(n) ? n : 0);
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // Aggregate clicks + approved conversions for a set of campaign IDs in a
  // [start, end) UTC window. Firestore `in` caps at 30 values and throws on an
  // empty array, so callers must pass a non-empty list and this chunks by 30.
  const aggregateWindow = async (campaignIds: string[], start: Date, end: Date) => {
    let clicks = 0, conversions = 0, revenue = 0, payout = 0;
    for (const ids of chunk(campaignIds, 30)) {
      const clickSnap = await db.collection("clicks")
        .where("campaignId", "in", ids)
        .where("timestamp", ">=", start)
        .where("timestamp", "<", end)
        .count().get();
      clicks += finite(clickSnap.data().count);

      const convSnap = await db.collection("conversions")
        .where("campaignId", "in", ids)
        .where("status", "==", "Approved")
        .where("timestamp", ">=", start)
        .where("timestamp", "<", end)
        .aggregate({
          conv: AggregateField.count(),
          revenue: AggregateField.sum("revenue"),
          payout: AggregateField.sum("payout")
        }).get();
      const d = convSnap.data();
      conversions += finite(d.conv);
      revenue += finite(d.revenue);
      payout += finite(d.payout);
    }
    return { clicks, conversions, revenue, payout, profit: finite(revenue - payout) };
  };

  const ownedCampaignIds = async (uid: string): Promise<string[]> => {
    const snap = await db.collection("campaigns").where("createdBy", "==", uid).select().get();
    return snap.docs.map(d => d.id);
  };

  app.get("/api/reports/summary", requireAuth, async (req: any, res) => {
    try {
      const ids = await ownedCampaignIds(req.uid);
      if (ids.length === 0) {
        return res.json({ today: ZERO, yesterday: ZERO, mtd: ZERO });
      }
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const [today, yesterday, mtd] = await Promise.all([
        aggregateWindow(ids, todayStart, now),
        aggregateWindow(ids, yesterdayStart, todayStart),
        aggregateWindow(ids, monthStart, now)
      ]);
      res.json({ today, yesterday, mtd });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to compute summary" });
    }
  });

  app.get("/api/reports/breakdown", requireAuth, async (req: any, res) => {
    try {
      const groupBy = (req.query.groupBy as string) || "campaign";
      const now = new Date();
      const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = req.query.from ? new Date(req.query.from as string) : defaultFrom;
      const to = req.query.to ? new Date(req.query.to as string) : now;
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ error: "Invalid from/to date" });
      }
      const rangeDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
      if (rangeDays > 31) {
        return res.status(400).json({ error: "Date range too large (max 31 days)" });
      }

      const campSnap = await db.collection("campaigns").where("createdBy", "==", req.uid).get();
      const campaigns = campSnap.docs.map(d => ({ id: d.id, title: d.data().title || "(untitled)" }));
      if (campaigns.length === 0) return res.json({ rows: [] });

      if (groupBy === "campaign") {
        const rows: any[] = [];
        for (const batch of chunk(campaigns, 10)) {
          const results = await Promise.all(batch.map(async (c) => {
            const w = await aggregateWindow([c.id], from, to);
            return {
              campaign_id: c.id,
              campaign: c.title,
              clicks: w.clicks,
              approved_conversions: w.conversions,
              revenue: w.revenue,
              payout: w.payout,
              profit: w.profit,
              cr: w.clicks > 0 ? finite((w.conversions / w.clicks) * 100) : 0
            };
          }));
          rows.push(...results);
        }
        return res.json({ rows });
      }

      if (groupBy === "date") {
        // Per-day buckets across the (capped) range. One click count() per day
        // and per-day approved-conversion aggregates, batched to bound latency.
        const days: { start: Date; end: Date; label: string }[] = [];
        const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
        while (cursor < to) {
          const next = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
          days.push({ start: new Date(cursor), end: next > to ? to : next, label: cursor.toISOString().slice(0, 10) });
          cursor.setTime(next.getTime());
        }
        const ids = campaigns.map(c => c.id);
        const rows: any[] = [];
        for (const batch of chunk(days, 7)) {
          const results = await Promise.all(batch.map(async (day) => {
            const w = await aggregateWindow(ids, day.start, day.end);
            return {
              date: day.label,
              clicks: w.clicks,
              approved_conversions: w.conversions,
              revenue: w.revenue,
              payout: w.payout,
              profit: w.profit,
              cr: w.clicks > 0 ? finite((w.conversions / w.clicks) * 100) : 0
            };
          }));
          rows.push(...results);
        }
        return res.json({ rows });
      }

      return res.status(400).json({ error: `Unsupported groupBy: ${groupBy}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to compute breakdown" });
    }
  });

  // --- AI INSIGHTS (server-side; key never leaves the server) ---
  // Moved off the client so GEMINI_API_KEY is no longer compiled into the public
  // bundle. Mirrors the neuro route's Gemini setup and returns a JSON array of
  // recommendations, matching what AIInsights.tsx renders.
  app.post("/api/ai/insights", requireAuth, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt =
        (req.body && req.body.prompt) ||
        "Analyze current trends in performance marketing and suggest 3 high-impact optimizations for a typical mid-market campaign.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a senior ad performance analyst. Provide 3 specific, actionable ad optimization recommendations for Google or Meta ads. Return a JSON array where each item has: title (string), impact (string percentage number), description (string), and platform ('Google' or 'Meta').",
          responseMimeType: "application/json"
        }
      });

      if (!response || !response.text) {
        throw new Error("No response text returned from Gemini API");
      }

      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error("AI insights server-side failure:", error);
      res.status(500).json({ error: error.message || "Failed to generate insights" });
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
    // Vite builds the SPA into dist/client; the backend bundle is dist/server.cjs.
    // Serving dist/client (not dist/) means the compiled server and its source
    // map are never exposed as downloadable static files.
    const distPath = path.join(process.cwd(), "dist", "client");
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
