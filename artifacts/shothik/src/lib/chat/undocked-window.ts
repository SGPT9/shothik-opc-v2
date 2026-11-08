/**
 * Undocked Artifact Window Manager
 *
 * Facilitates multi-monitor dual-screen productivity by detaching the Shothik
 * Artifact Canvas (Slides, Spreadsheets, Docs, Code, Diagrams, Narratives)
 * into a standalone OS browser window while keeping state synchronized in real-time
 * via BroadcastChannel.
 */

export interface ArtifactSyncPayload {
  title: string;
  type: string;
  content: string;
  activeTab?: string;
  metadata?: Record<string, any>;
}

export interface ArtifactSyncMessage {
  type: "ARTIFACT_STATE_SYNC" | "ARTIFACT_TAB_CHANGE" | "ARTIFACT_CLOSE" | "POPUP_READY_PING";
  payload?: ArtifactSyncPayload;
  timestamp: number;
}

export const ARTIFACTS_CHANNEL_NAME = "shothik_artifacts_sync";

export class UndockedWindowManager {
  private channel: BroadcastChannel | null = null;
  private popupWindow: Window | null = null;
  private onMessageCallback?: (message: ArtifactSyncMessage) => void;

  constructor(onMessage?: (message: ArtifactSyncMessage) => void) {
    this.onMessageCallback = onMessage;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(ARTIFACTS_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<ArtifactSyncMessage>) => {
          this.handleChannelMessage(event.data);
        };
      } catch (err) {
        console.warn("[UndockedWindowManager] BroadcastChannel unsupported or restricted", err);
      }
    }
  }

  private handleChannelMessage(msg: ArtifactSyncMessage) {
    if (msg.type === "POPUP_READY_PING") {
      // Re-send latest active artifact state to newly opened popup
      return;
    }
    this.onMessageCallback?.(msg);
  }

  public openUndockedWindow(initialState?: ArtifactSyncPayload): boolean {
    if (typeof window === "undefined") return false;

    // Check if existing popup is still alive
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.focus();
      if (initialState) this.broadcastState(initialState);
      return true;
    }

    const width = Math.min(1200, Math.round(window.screen.availWidth * 0.55));
    const height = Math.min(900, Math.round(window.screen.availHeight * 0.85));
    const left = Math.round(window.screenX + Math.max(0, (window.outerWidth - width) / 2));
    const top = Math.round(window.screenY + 40);

    const features = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
    
    // Open targeted popout or blank window with mirrored styles
    this.popupWindow = window.open("", "shothik_undocked_artifacts", features);

    if (!this.popupWindow) {
      console.warn("[UndockedWindowManager] Pop-up blocked by browser settings");
      return false;
    }

    // Mirror stylesheets and fonts from main window into popup
    const popupDoc = this.popupWindow.document;
    popupDoc.title = initialState?.title ? `${initialState.title} - Shothik Artifact Canvas` : "Shothik Artifact Canvas";
    popupDoc.body.className = "bg-slate-950 text-slate-100 font-sans p-6 m-0 selection:bg-emerald-500/30";

    // Copy style tags
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
    styles.forEach((el) => {
      popupDoc.head.appendChild(el.cloneNode(true));
    });

    // Create container
    let container = popupDoc.getElementById("undocked-root");
    if (!container) {
      container = popupDoc.createElement("div");
      container.id = "undocked-root";
      popupDoc.body.appendChild(container);
    }

    this.renderIntoPopup(initialState);
    return true;
  }

  public renderIntoPopup(payload?: ArtifactSyncPayload) {
    if (!this.popupWindow || this.popupWindow.closed) return;
    const popupDoc = this.popupWindow.document;
    const container = popupDoc.getElementById("undocked-root");
    if (!container) return;

    if (!payload || !payload.content) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;color:#94a3b8;font-family:sans-serif;text-align:center;">
          <h2 style="color:#f8fafc;margin-bottom:8px;">Artifact Canvas Ready</h2>
          <p style="font-size:13px;max-width:320px;">Generated documents, slides, sheets, and code in Shothik Chat will stream live into this window.</p>
        </div>
      `;
      return;
    }

    popupDoc.title = `${payload.title} - Shothik Canvas`;
    container.innerHTML = `
      <div style="max-width:960px;margin:0 auto;font-family:sans-serif;">
        <header style="display:flex;align-items:center;justify-content:between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;margin-bottom:20px;">
          <div>
            <span style="font-size:11px;font-family:monospace;text-transform:uppercase;color:#34d399;font-weight:700;">${payload.type || "Document"}</span>
            <h1 style="font-size:20px;font-weight:700;color:#ffffff;margin:4px 0 0 0;">${payload.title}</h1>
          </div>
        </header>
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;line-height:1.6;font-size:14px;color:#e2e8f0;white-space:pre-wrap;">${payload.content}</div>
      </div>
    `;
  }

  public broadcastState(payload: ArtifactSyncPayload) {
    if (this.channel) {
      this.channel.postMessage({
        type: "ARTIFACT_STATE_SYNC",
        payload,
        timestamp: Date.now(),
      });
    }
    if (this.popupWindow && !this.popupWindow.closed) {
      this.renderIntoPopup(payload);
    }
  }

  public isWindowOpen(): boolean {
    return Boolean(this.popupWindow && !this.popupWindow.closed);
  }

  public closeWindow() {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
      this.popupWindow = null;
    }
    if (this.channel) {
      this.channel.postMessage({
        type: "ARTIFACT_CLOSE",
        timestamp: Date.now(),
      });
    }
  }

  public destroy() {
    this.closeWindow();
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
