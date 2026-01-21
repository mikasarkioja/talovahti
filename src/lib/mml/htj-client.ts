/**
 * HTJ2 Integration Client
 *
 * Handles mTLS (Mutual TLS) authentication with MML production APIs.
 * Uses Node.js https and tls modules for client certificate authentication.
 */

import https from "https";
import tls from "tls";
import fs from "fs";

interface MMLClientConfig {
  baseUrl?: string;
  clientCertPath?: string;
  clientKeyPath?: string;
  caCertPath?: string;
  timeout?: number;
}

interface MMLRequestOptions {
  method?: "GET" | "POST" | "PUT";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface MMLResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export class HTJ2Client {
  private config: Required<MMLClientConfig>;
  private agent: https.Agent | null = null;

  constructor(config: MMLClientConfig) {
    // Default to production MML API
    const baseUrl =
      config.baseUrl ||
      process.env.MML_API_BASE_URL ||
      "https://api.maanmittauslaitos.fi/htj2";
    const clientCertPath =
      config.clientCertPath || process.env.MML_CLIENT_CERT_PATH || "";
    const clientKeyPath =
      config.clientKeyPath || process.env.MML_CLIENT_KEY_PATH || "";
    const caCertPath = config.caCertPath || process.env.MML_CA_CERT_PATH || "";
    const timeout = config.timeout || 30000;

    this.config = {
      baseUrl,
      clientCertPath,
      clientKeyPath,
      caCertPath,
      timeout,
    };

    // Initialize HTTPS agent with mTLS if certificates are provided
    if (
      this.config.clientCertPath &&
      this.config.clientKeyPath &&
      this.config.clientCertPath !== "" &&
      this.config.clientKeyPath !== ""
    ) {
      this.initializeAgent();
    }
  }

  private initializeAgent() {
    try {
      const cert = fs.readFileSync(this.config.clientCertPath, "utf8");
      const key = fs.readFileSync(this.config.clientKeyPath, "utf8");
      const ca = this.config.caCertPath
        ? fs.readFileSync(this.config.caCertPath, "utf8")
        : undefined;

      // Create TLS context for mTLS
      const tlsContext = tls.createSecureContext({
        cert,
        key,
        ca: ca ? [ca] : undefined,
      });

      // Create HTTPS agent with mTLS
      this.agent = new https.Agent({
        secureContext: tlsContext,
        rejectUnauthorized: true,
        keepAlive: true,
        timeout: this.config.timeout,
      });
    } catch (error) {
      console.error("[HTJ2Client] Failed to initialize mTLS agent:", error);
      throw new Error(
        "Failed to initialize mTLS client. Check certificate paths and permissions.",
      );
    }
  }

  /**
   * Make an authenticated request to MML HTJ2 API
   */
  async request<T = unknown>(
    options: MMLRequestOptions,
  ): Promise<MMLResponse<T>> {
    const url = new URL(options.path, this.config.baseUrl);
    const method = options.method || "GET";

    return new Promise((resolve, reject) => {
      const requestOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        agent: this.agent || undefined,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Talovahti/1.0",
          ...options.headers,
        },
        timeout: this.config.timeout,
      };

      const req = https.request(requestOptions, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;

            resolve({
              status: res.statusCode || 200,
              data: parsedData as T,
              headers: res.headers as Record<string, string>,
            });
          } catch (error) {
            reject(
              new Error(
                `Failed to parse response: ${error instanceof Error ? error.message : "Unknown error"}`,
              ),
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`HTJ2 API request failed: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("HTJ2 API request timeout"));
      });

      // Send request body if provided
      if (options.body && (method === "POST" || method === "PUT")) {
        const bodyString = JSON.stringify(options.body);
        requestOptions.headers = {
          ...requestOptions.headers,
          "Content-Length": Buffer.byteLength(bodyString).toString(),
        };
        req.write(bodyString);
      }

      req.end();
    });
  }

  /**
   * Fetch housing company data from /yhtiot/ endpoint
   */
  async fetchYhtio(businessId: string): Promise<unknown> {
    const response = await this.request<unknown>({
      method: "GET",
      path: `/yhtiot/${businessId}`,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch yhtio: HTTP ${response.status}`);
    }

    return response.data;
  }

  /**
   * Fetch apartment groups (osakeryhmat) from /osakeryhmat/ endpoint
   */
  async fetchOsakeryhmat(businessId: string): Promise<unknown> {
    const response = await this.request<unknown>({
      method: "GET",
      path: `/osakeryhmat?yhtio=${businessId}`,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch osakeryhmat: HTTP ${response.status}`);
    }

    return response.data;
  }

  /**
   * Submit renovation notification to /ilmoitukset/kunnossapito endpoint
   */
  async submitRenovation(
    businessId: string,
    renovationData: {
      component: string;
      yearDone?: number;
      plannedYear?: number;
      cost: number;
      description?: string;
    },
  ): Promise<unknown> {
    const response = await this.request<unknown>({
      method: "POST",
      path: `/ilmoitukset/kunnossapito`,
      body: {
        yhtio: businessId,
        ...renovationData,
      },
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to submit renovation: HTTP ${response.status}`);
    }

    return response.data;
  }
}

/**
 * Get or create MML client instance
 * Uses singleton pattern to reuse HTTPS agent
 */
let clientInstance: HTJ2Client | null = null;

export function getMMLClient(): HTJ2Client {
  if (!clientInstance) {
    clientInstance = new HTJ2Client({
      baseUrl:
        process.env.MML_API_BASE_URL || "https://api.maanmittauslaitos.fi/htj2",
    });
  }
  return clientInstance;
}
