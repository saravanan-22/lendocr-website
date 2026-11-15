// Typed access to demo.json (real API responses, refreshed by scripts/export-demo.py).
import raw from "./demo.json";

export interface DemoField {
  value: string;
  confidence: number;
}

export interface DemoSample {
  id: string;
  title: string;
  image: string;
  width: number;
  height: number;
  response: {
    document_type: string;
    fields: Record<string, DemoField>;
    checks: Record<string, boolean>;
    needs_review: boolean;
    warnings: string[];
    pages: number;
    processing_ms: number;
    data?: Record<string, unknown>;
  };
}

export const DEMO = raw as unknown as DemoSample[];
