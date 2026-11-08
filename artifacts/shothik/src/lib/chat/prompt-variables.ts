/**
 * Prompt Template Variable Detection and Interpolation utilities
 * Adapted from LibreChat prompt templating architecture.
 */

const SPECIAL_VARIABLES = new Set(["date", "time", "datetime", "user", "model"]);

/**
 * Detects if the prompt contains template variables in {{variable_name}} syntax.
 */
export function detectVariables(text: string): boolean {
  if (!text) return false;
  const regex = /{{([^{}]+?)}}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim().toLowerCase();
    if (!SPECIAL_VARIABLES.has(varName)) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts unique user variables from prompt template.
 */
export function extractTemplateVariables(text: string): string[] {
  if (!text) return [];
  const regex = /{{([^{}]+?)}}/g;
  const vars = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!SPECIAL_VARIABLES.has(varName.toLowerCase())) {
      vars.add(varName);
    }
  }
  return Array.from(vars);
}

/**
 * Interpolates variables into template string, automatically resolving special variables
 * like current date/time if present.
 */
export function interpolateVariables(template: string, values: Record<string, string>): string {
  if (!template) return "";
  const now = new Date();

  return template.replace(/{{([^{}]+?)}}/g, (match, rawName) => {
    const name = rawName.trim();
    const lower = name.toLowerCase();

    // Auto-resolve special variables
    if (lower === "date") return now.toLocaleDateString();
    if (lower === "time") return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (lower === "datetime") return now.toLocaleString();

    // User variable values
    if (values[name] !== undefined && values[name].trim().length > 0) {
      return values[name].trim();
    }
    return match;
  });
}
