type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      data,
      service: "crowdsense-api",
    };

    if (this.isProd) {
      // In production, this would go to Google Cloud Logging / Winston / Axiom
      // Using standard console for now but structured for machine reading
      console[level === "debug" ? "log" : level](JSON.stringify(entry));
    } else {
      console[level === "debug" ? "log" : level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || "");
    }
  }

  info(message: string, data?: any) { this.log("info", message, data); }
  warn(message: string, data?: any) { this.log("warn", message, data); }
  error(message: string, data?: any) { this.log("error", message, data); }
  debug(message: string, data?: any) { this.log("debug", message, data); }
}

export const logger = new Logger();
