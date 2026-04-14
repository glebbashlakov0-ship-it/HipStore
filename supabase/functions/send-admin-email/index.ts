declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EmailPayload = {
  template_type?: string;
  preview_only?: boolean;
  to_email?: string;
  to_name?: string;
  lot_title?: string;
  lot_image?: string;
  bid_amount?: string;
  invoice_number?: string;
  delivery_to?: string;
  delivery_address?: string;
  payment_type?: string;
  payment_details?: string;
  due_date?: string;
  from_name?: string;
  reply_to?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: unknown) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function normalizeTemplateType(value: unknown) {
  const templateType = String(value || "").toLowerCase();
  if (
    templateType === "win-invoice" ||
    templateType === "win-only" ||
    templateType === "invoice" ||
    templateType === "confirmation"
  ) {
    return templateType;
  }
  return "invoice";
}

function buildSubject(payload: EmailPayload, demoMode: boolean) {
  const templateType = normalizeTemplateType(payload.template_type);
  const lotTitle = String(payload.lot_title || "your lot").trim();
  const prefix = demoMode ? "[DEMO] " : "";

  if (templateType === "win-invoice") {
    return `${prefix}Congratulations — you won ${lotTitle}`;
  }
  if (templateType === "win-only") {
    return `${prefix}Auction result confirmed — ${lotTitle}`;
  }
  if (templateType === "confirmation") {
    return `${prefix}Refund Confirmation — ${lotTitle}`;
  }
  return `${prefix}Invoice ${payload.invoice_number || ""} — ${lotTitle}`.trim();
}

function renderImage(imageUrl?: string, alt?: string) {
  if (!imageUrl) return "";
  return `
    <tr>
      <td style="padding:0;background:#ffffff;">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt || "Lot image")}" width="620" style="display:block;width:100%;max-width:620px;height:auto;border:0;outline:none;text-decoration:none;" />
      </td>
    </tr>
  `;
}

function renderDemoBanner(actualTo: string, demoTo: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#fff7d6;border:1px solid #f0df9b;margin:0 0 24px 0;">
      <tr>
        <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6d5818;">
          Demo mode is enabled. This email was routed to <strong>${escapeHtml(demoTo)}</strong> instead of <strong>${escapeHtml(actualTo)}</strong>.
        </td>
      </tr>
    </table>
  `;
}

function renderBaseLayout(options: {
  preheader: string;
  heroKicker: string;
  heroTitle: string;
  heroColor: string;
  bodyHtml: string;
  fromName: string;
}) {
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(options.preheader)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:0;padding:0;background:#f3efe9;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" style="width:620px;max-width:620px;border-collapse:collapse;background:#ffffff;">
            <tr>
              <td align="center" style="padding:14px 20px 18px 20px;background:#f3efe9;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.1;color:#111111;font-weight:700;">
                  Sotheby’s
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="background:${escapeHtml(options.heroColor)};padding:18px 28px 16px 28px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:3px;text-transform:uppercase;color:#5c4320;font-weight:700;margin:0 0 8px 0;">
                  ${escapeHtml(options.heroKicker)}
                </div>
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:46px;line-height:1.05;color:#111111;font-weight:700;margin:0;">
                  ${escapeHtml(options.heroTitle)}
                </div>
              </td>
            </tr>
            ${options.bodyHtml}
            <tr>
              <td style="background:#111111;padding:18px 20px;text-align:center;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.5;color:#b8b8b8;letter-spacing:1px;text-transform:uppercase;">
                  © 2026 ${escapeHtml(options.fromName)}. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderInvoiceEmail(payload: EmailPayload, demoBannerHtml: string) {
  return renderBaseLayout({
    preheader: `Invoice ${payload.invoice_number || ""} for ${payload.lot_title || "your lot"}`.trim(),
    heroKicker: "Payment Request",
    heroTitle: "Invoice Ready",
    heroColor: "#d8c0a0",
    fromName: payload.from_name || "Auction House",
    bodyHtml: `
      ${renderImage(payload.lot_image, payload.lot_title)}
      <tr>
        <td style="padding:30px 42px 34px 42px;">
          ${demoBannerHtml}
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#111111;font-weight:400;margin:0 0 10px 0;">
            ${escapeHtml(payload.lot_title || "Selected lot")}
          </div>

          <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.75;color:#666666;">
            Dear ${escapeHtml(payload.to_name || "Client")}, please find your invoice details below and complete the payment before the due date.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid #e9e3d9;margin:0 0 28px 0;">
            <tr>
              <td style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:11px;letter-spacing:2px;text-transform:uppercase;color:#9b8358;font-weight:700;">
                Amount Due
              </td>
              <td align="right" style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.1;color:#111111;font-weight:700;">
                ${escapeHtml(payload.bid_amount || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Invoice No.
              </td>
              <td align="right" style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.invoice_number || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Delivery to
              </td>
              <td align="right" style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.delivery_to || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Payment Due
              </td>
              <td align="right" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.due_date || "—")}
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin:0 0 14px 0;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:3px;text-transform:uppercase;color:#b89a62;font-weight:700;">
              Payment Details
            </div>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:0 0 28px 0;">
            <tr>
              <td style="padding:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:2px;text-transform:uppercase;color:#9f9f9f;font-weight:700;">
                ${escapeHtml(payload.payment_type || "Payment")}
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 18px 0;border-bottom:1px solid #ece5db;">
                <div style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.8;color:#111111;white-space:normal;">${nl2br(payload.payment_details || "—")}</div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 22px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.8;color:#4a4a4a;">
            If you have any questions, simply reply to this email and our team will assist you.
          </p>

          <div style="border-top:1px solid #ece5dc;height:1px;line-height:1px;font-size:1px;margin:0 0 28px 0;">&nbsp;</div>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f1f1f;font-weight:700;">
            ${escapeHtml(payload.from_name || "Auction House")}
          </div>
        </td>
      </tr>
    `,
  });
}

function renderWinInvoiceEmail(payload: EmailPayload, demoBannerHtml: string) {
  return renderBaseLayout({
    preheader: `You won ${payload.lot_title || "your lot"}`,
    heroKicker: `Congratulations, ${payload.to_name || "collector"}`,
    heroTitle: "You Won!",
    heroColor: "#cfa468",
    fromName: payload.from_name || "Auction House",
    bodyHtml: `
      ${renderImage(payload.lot_image, payload.lot_title)}
      <tr>
        <td style="padding:30px 42px 34px 42px;">
          ${demoBannerHtml}
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#111111;font-weight:400;margin:0 0 10px 0;">
            ${escapeHtml(payload.lot_title || "Winning lot")}
          </div>

          <p style="margin:0 0 26px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;color:#666666;">
            We are pleased to confirm that your winning bid has been accepted. Please review the payment instructions below and complete the transfer before the due date to secure your item.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid #e9e3d9;margin:0 0 28px 0;">
            <tr>
              <td style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:11px;letter-spacing:2px;text-transform:uppercase;color:#9b8358;font-weight:700;">
                Winning Bid
              </td>
              <td align="right" style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.1;color:#111111;font-weight:700;">
                ${escapeHtml(payload.bid_amount || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Payment Due
              </td>
              <td align="right" style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.due_date || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Delivery to
              </td>
              <td align="right" style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.delivery_to || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Invoice No.
              </td>
              <td align="right" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.invoice_number || "—")}
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin:0 0 14px 0;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:3px;text-transform:uppercase;color:#b89a62;font-weight:700;">
              Payment Detail
            </div>
          </div>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:0 0 28px 0;">
            <tr>
              <td style="padding:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:2px;text-transform:uppercase;color:#9f9f9f;font-weight:700;">
                ${escapeHtml(payload.payment_type || "Payment")}
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 18px 0;border-bottom:1px solid #ece5db;">
                <div style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.8;color:#111111;white-space:normal;">${nl2br(payload.payment_details || "—")}</div>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f6f1e9;margin:0 0 26px 0;">
            <tr>
              <td style="padding:18px 20px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:2px;text-transform:uppercase;color:#9b8358;font-weight:700;margin:0 0 10px 0;">
                  What Happens Next
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#444444;">
                  Our team will be in touch with you shortly with full payment and shipping instructions. Please allow up to 24 hours for us to reach out.
                </div>
              </td>
            </tr>
          </table>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f1f1f;font-weight:700;">
            ${escapeHtml(payload.from_name || "Auction House")}
          </div>
        </td>
      </tr>
    `,
  });
}

function renderWinOnlyEmail(payload: EmailPayload, demoBannerHtml: string) {
  return renderBaseLayout({
    preheader: `Auction result confirmed for ${payload.lot_title || "your lot"}`,
    heroKicker: "Auction Result",
    heroTitle: "Congratulations",
    heroColor: "#d8c0a0",
    fromName: payload.from_name || "Auction House",
    bodyHtml: `
      ${renderImage(payload.lot_image, payload.lot_title)}
      <tr>
        <td style="padding:30px 42px 34px 42px;">
          ${demoBannerHtml}
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#111111;font-weight:400;margin:0 0 10px 0;">
            ${escapeHtml(payload.lot_title || "Winning lot")}
          </div>

          <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.75;color:#666666;">
            Dear ${escapeHtml(payload.to_name || "Client")}, we are pleased to confirm that you have won this lot with a final bid of <strong>${escapeHtml(payload.bid_amount || "—")}</strong>.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid #e9e3d9;margin:0 0 28px 0;">
            <tr>
              <td style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:11px;letter-spacing:2px;text-transform:uppercase;color:#9b8358;font-weight:700;">
                Winning Bid
              </td>
              <td align="right" style="padding:18px 20px;border-bottom:1px solid #e9e3d9;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.1;color:#111111;font-weight:700;">
                ${escapeHtml(payload.bid_amount || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Delivery to
              </td>
              <td align="right" style="padding:13px 20px;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.delivery_to || "—")}
              </td>
            </tr>
            <tr>
              <td style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8a8a;">
                Delivery address
              </td>
              <td align="right" style="padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#222222;">
                ${escapeHtml(payload.delivery_address || "—")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f6f1e9;margin:0 0 26px 0;">
            <tr>
              <td style="padding:18px 20px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:10px;letter-spacing:2px;text-transform:uppercase;color:#9b8358;font-weight:700;margin:0 0 10px 0;">
                  What Happens Next
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#444444;">
                  Our team will contact you shortly with payment instructions and delivery details. Please allow up to 24 hours for us to reach out.
                </div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 22px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.8;color:#4a4a4a;">
            If you need any assistance in the meantime, simply reply to this email.
          </p>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f1f1f;font-weight:700;">
            ${escapeHtml(payload.from_name || "Auction House")}
          </div>
        </td>
      </tr>
    `,
  });
}

function renderConfirmationEmail(payload: EmailPayload, demoBannerHtml: string) {
  return renderBaseLayout({
    preheader: `Refund confirmation for ${payload.lot_title || "your lot"}`,
    heroKicker: "Refund Confirmation",
    heroTitle: payload.to_name || "Client",
    heroColor: "#4a5f93",
    fromName: payload.from_name || "Auction House",
    bodyHtml: `
      <tr>
        <td style="padding:44px 54px 24px 54px;">
          ${demoBannerHtml}
          <p style="margin:0 0 34px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#5b5b5b;">
            I hope this message finds you well.
          </p>

          <p style="margin:0 0 38px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.9;color:#3d3d3d;">
            I am writing to confirm that your payment of
            <strong style="font-weight:700;color:#111111;">${escapeHtml(payload.bid_amount || "—")}</strong>
            for the
            <strong style="font-weight:700;color:#111111;">${escapeHtml(payload.lot_title || "your lot")}</strong>
            has been successfully refunded. The funds have been sent back to your originating bank account.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border:1px solid #e7e1d8;border-collapse:collapse;margin:0 0 42px 0;">
            <tr>
              <td style="padding:26px 28px;border-bottom:1px solid #e7e1d8;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:12px;letter-spacing:3px;text-transform:uppercase;color:#4e618c;font-weight:700;">
                      Amount Refunded
                    </td>
                    <td valign="middle" align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:#111111;font-weight:700;">
                      ${escapeHtml(payload.bid_amount || "—")}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="width:28%;padding:18px 0;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#a5a5a5;">
                      Lot
                    </td>
                    <td align="right" style="padding:18px 0;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#202020;font-weight:500;">
                      ${escapeHtml(payload.lot_title || "—")}
                    </td>
                  </tr>
                  <tr>
                    <td style="width:28%;padding:18px 0;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#a5a5a5;">
                      Status
                    </td>
                    <td align="right" style="padding:18px 0;border-bottom:1px solid #eee8df;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#3f517c;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      Processing
                    </td>
                  </tr>
                  <tr>
                    <td style="width:28%;padding:18px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#a5a5a5;">
                      Processing Time
                    </td>
                    <td align="right" style="padding:18px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#202020;font-weight:600;">
                      2-4 business days
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f6f2ec;margin:0 0 44px 0;">
            <tr>
              <td style="padding:28px 30px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:12px;letter-spacing:3px;text-transform:uppercase;color:#b79a55;font-weight:700;margin:0 0 14px 0;">
                  Please Note
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#5b5b5b;">
                  Please allow <strong style="font-weight:700;color:#222222;">2-4 business working days</strong> for the refund to reflect in your account, depending on your bank's processing time.
                </div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.85;color:#4b4b4b;">
            We sincerely apologize for any inconvenience this may have caused and appreciate your understanding.
          </p>

          <p style="margin:0 0 34px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.85;color:#4b4b4b;">
            If you have any further questions or need assistance, please do not hesitate to contact us.
          </p>

          <div style="border-top:1px solid #ece5dc;height:1px;line-height:1px;font-size:1px;margin:0 0 36px 0;">
            &nbsp;
          </div>

          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f1f1f;font-weight:700;">
            Chris Matthews
          </div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#8d8d8d;">
            Manager, Sotheby's Europe
          </div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#8d8d8d;">
            +44 20 7293 5000
          </div>
        </td>
      </tr>
    `,
  });
}

function renderEmailHtml(payload: EmailPayload, demoBannerHtml: string) {
  const templateType = normalizeTemplateType(payload.template_type);
  if (templateType === "win-invoice") return renderWinInvoiceEmail(payload, demoBannerHtml);
  if (templateType === "win-only") return renderWinOnlyEmail(payload, demoBannerHtml);
  if (templateType === "confirmation") return renderConfirmationEmail(payload, demoBannerHtml);
  return renderInvoiceEmail(payload, demoBannerHtml);
}

function renderText(payload: EmailPayload, demoMode: boolean, actualTo: string, demoTo: string) {
  const lines = [];

  if (demoMode) {
    lines.push(`DEMO MODE: routed to ${demoTo} instead of ${actualTo}`);
    lines.push("");
  }

  lines.push(buildSubject(payload, demoMode));
  lines.push("");
  lines.push(`Client: ${payload.to_name || "Client"}`);
  lines.push(`Lot: ${payload.lot_title || "—"}`);
  lines.push(`Amount: ${payload.bid_amount || "—"}`);

  if (payload.invoice_number) lines.push(`Invoice: ${payload.invoice_number}`);
  if (payload.due_date) lines.push(`Due date: ${payload.due_date}`);
  if (payload.delivery_to) lines.push(`Delivery to: ${payload.delivery_to}`);
  if (payload.delivery_address) lines.push(`Delivery address: ${payload.delivery_address}`);
  if (payload.payment_type) lines.push(`Payment type: ${payload.payment_type}`);

  if (payload.payment_details) {
    lines.push("");
    lines.push("Payment details:");
    lines.push(String(payload.payment_details));
  }

  lines.push("");
  lines.push(`Best regards, ${payload.from_name || "Auction House"}`);
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const requestedTo = String(payload.to_email || "").trim();
  if (!requestedTo) {
    return jsonResponse({ error: "Recipient email is required." }, 400);
  }

  const previewOnly = payload.preview_only === true || String(payload.preview_only || "").toLowerCase() === "true";
  const demoTo = String(Deno.env.get("RESEND_DEMO_TO") || "").trim();
  const fromEmail = String(Deno.env.get("RESEND_FROM") || "").trim() || "onboarding@resend.dev";
  const fromName = String(payload.from_name || "").trim() || "Auction House";
  const replyTo = String(payload.reply_to || "").trim();

  if (previewOnly) {
    const subject = buildSubject(payload, false);
    const html = renderEmailHtml(payload, "");
    const text = renderText(payload, false, requestedTo, requestedTo);
    return jsonResponse({
      success: true,
      preview: true,
      to: requestedTo,
      from: `${fromName} <${fromEmail}>`,
      reply_to: replyTo || null,
      subject,
      html,
      text,
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return jsonResponse({ error: "RESEND_API_KEY is not configured." }, 500);
  }

  const toEmail = demoTo || requestedTo;
  const subject = buildSubject(payload, Boolean(demoTo));
  const demoBannerHtml = demoTo ? renderDemoBanner(requestedTo, demoTo) : "";
  const html = renderEmailHtml(payload, demoBannerHtml);
  const text = renderText(payload, Boolean(demoTo), requestedTo, toEmail);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      subject,
      html,
      text,
      reply_to: replyTo || undefined,
    }),
  });

  const resendData = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    return jsonResponse({
      error: resendData?.message || resendData?.error || "Resend request failed.",
      details: resendData,
    }, resendResponse.status >= 400 && resendResponse.status < 600 ? resendResponse.status : 500);
  }

  return jsonResponse({
    success: true,
    id: resendData.id || null,
    to: toEmail,
    demo: Boolean(demoTo),
  });
});
