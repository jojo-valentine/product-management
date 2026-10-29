type N8nPayload = Record<string, unknown>;

export async function sendN8nWebhook(
  url: string | undefined,
  payload: N8nPayload,
): Promise<void> {
  if (!url) {
    console.warn("n8n webhook URL is not configured");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.error("n8n webhook failed:", response.status);
    }
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    // แจ้งเตือนล้มเหลวได้ แต่ไม่ควรทำให้ Order ที่สำเร็จแล้วล้มเหลว
    console.error("Cannot send n8n notification:", error);
  }
}
