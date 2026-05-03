import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import nodemailer from "nodemailer"

// ---------------------------------------------------------------------------
// Google Sheets auth — サービスアカウント（Sheets のみ）
// ---------------------------------------------------------------------------

function getSheetsAuth() {
  const raw = process.env.GOOGLE_SA_PRIVATE_KEY ?? ""
  const privateKey = raw.replace(/\\n/g, "\n")

  return new google.auth.JWT({
    email: process.env.GOOGLE_SA_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

async function appendToSheet(data: Record<string, string>) {
  const auth = getSheetsAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const sheetId = process.env.GOOGLE_SHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? "contactform"

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })

  const row = [
    now,           // A: 受付日時
    data.type,     // B: お問い合わせ種別
    data.companyName ?? "",  // C: 貴社名
    data.name,     // D: お名前
    data.department ?? "",   // E: 部署名・役職名
    data.email,    // F: メールアドレス
    data.phone,    // G: 電話番号
    data.companyUrl ?? "",   // H: 会社URL（新規追加）
    data.experience,  // I: ご利用経験
    data.area,        // J: 出店希望エリア
    data.landStatus,  // K: 土地の所有状況
    data.tsubo ?? "", // L: 坪数
    data.steps,       // M: ご希望の検討ステップ
    data.message ?? "", // N: ご質問・ご要望
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  })
}

// ---------------------------------------------------------------------------
// Nodemailer transporter — Gmail SMTP + アプリパスワード
// ---------------------------------------------------------------------------

function getTransporter() {
  // SMTP認証には実アカウント（GMAIL_SMTP_USER）を使用
  // 表示上の from は sendReplyEmail 内で info@ に設定
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// ---------------------------------------------------------------------------
// メール本文
// ---------------------------------------------------------------------------

function buildHtml(data: Record<string, string>): string {
  // 「資料を詳しく見て検討したい」のみかどうか判定
  const steps = data.steps ?? ""
  const MATERIAL_ONLY = "資料を詳しく見て検討したい"
  const isMaterialOnly =
    steps.trim() === MATERIAL_ONLY ||
    (steps.includes(MATERIAL_ONLY) && steps.replace(MATERIAL_ONLY, "").replace(/[、,，\s]/g, "") === "")

  const bodyText = isMaterialOnly
    ? `この度はスプラッシュンゴーのフランチャイズ加盟にご興味をお持ちいただき、<br>
              誠にありがとうございます。<br><br>
              ご請求いただいた事業説明資料を下記よりご確認いただけます。<br>
              ご不明な点がございましたら、お気軽にお問い合わせください。`
    : `この度はスプラッシュンゴーのフランチャイズ加盟にご興味をお持ちいただき、<br>
              誠にありがとうございます。<br><br>
              お問い合わせ内容を確認のうえ、担当者よりあらためてご連絡いたします。<br>
              今しばらくお待ちくださいますよう、よろしくお願い申し上げます。`

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;color:#1a1a2e;background:#f5f7fb;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- header -->
        <tr>
          <td style="background:#004d9c;padding:28px 40px;">
            <p style="margin:0;color:rgba(255,255,255,.7);font-size:10px;letter-spacing:.2em;text-transform:uppercase;">
              Franchise Contact
            </p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:.05em;">
              SPLASH&#39;N&#39;GO!
            </h1>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:15px;font-weight:600;">${data.name} 様</p>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.9;">
              ${bodyText}
            </p>

            <!-- 資料リンク ボタン型 -->
            <table cellpadding="0" cellspacing="0" style="margin:8px 0 28px;width:100%;">
              <tr>
                <td style="background:#eef1f8;border-radius:8px;padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:11px;color:#6b7280;font-weight:600;letter-spacing:.1em;text-transform:uppercase;">
                    事業説明資料
                  </p>
                  <a href="https://drive.google.com/file/d/1-LkZrzeg5eBFyZFMVBXJL1eTzUx1u1pK/view?usp=sharing"
                     style="display:inline-block;background:#004d9c;color:#ffffff;font-size:14px;font-weight:700;
                            text-decoration:none;padding:12px 24px;border-radius:6px;letter-spacing:.03em;">
                    PDF資料はこちら &rarr;
                  </a>
                  <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">
                    スプラッシュンゴー事業説明資料
                  </p>
                </td>
              </tr>
            </table>

            <!-- 受付内容 -->
            <p style="margin:28px 0 12px;font-size:11px;color:#004d9c;font-weight:700;letter-spacing:.15em;
                      text-transform:uppercase;border-bottom:2px solid #eef1f8;padding-bottom:8px;">
              お問い合わせ受付内容
            </p>
            <table cellpadding="6" cellspacing="0" style="width:100%;font-size:13px;line-height:1.8;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;width:160px;vertical-align:top;padding:8px 4px;">お問い合わせ種別</td>
                <td style="font-weight:600;padding:8px 4px;">${data.type}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">お名前</td>
                <td style="font-weight:600;padding:8px 4px;">${data.name}</td>
              </tr>
              ${data.companyName ? `
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">貴社名</td>
                <td style="font-weight:600;padding:8px 4px;">${data.companyName}</td>
              </tr>` : ""}
              ${data.department ? `
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">部署名・役職名</td>
                <td style="font-weight:600;padding:8px 4px;">${data.department}</td>
              </tr>` : ""}
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">メールアドレス</td>
                <td style="font-weight:600;padding:8px 4px;">${data.email}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">電話番号</td>
                <td style="font-weight:600;padding:8px 4px;">${data.phone}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">ご利用経験</td>
                <td style="font-weight:600;padding:8px 4px;">${data.experience}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">出店希望エリア</td>
                <td style="font-weight:600;padding:8px 4px;">${data.area}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">土地の状況</td>
                <td style="font-weight:600;padding:8px 4px;">${data.landStatus}${data.tsubo ? `（${data.tsubo}坪）` : ""}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">ご希望の検討ステップ</td>
                <td style="font-weight:600;padding:8px 4px;">${data.steps}</td>
              </tr>
              ${data.message ? `
              <tr>
                <td style="color:#6b7280;vertical-align:top;padding:8px 4px;">ご質問・ご要望</td>
                <td style="font-weight:600;padding:8px 4px;">${data.message}</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#004d9c;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,.7);font-size:12px;">
              &copy; SPLASH&#39;N&#39;GO! All Rights Reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim()
}

function buildText(data: Record<string, string>): string {
  const steps = data.steps ?? ""
  const MATERIAL_ONLY = "資料を詳しく見て検討したい"
  const isMaterialOnly =
    steps.trim() === MATERIAL_ONLY ||
    (steps.includes(MATERIAL_ONLY) && steps.replace(MATERIAL_ONLY, "").replace(/[、,，\s]/g, "") === "")

  const bodyText = isMaterialOnly
    ? `ご請求いただいた事業説明資料を下記よりご確認いただけます。\nご不明な点がございましたら、お気軽にお問い合わせください。`
    : `お問い合わせ内容を確認のうえ、担当者よりあらためてご連絡いたします。\n今しばらくお待ちくださいますよう、よろしくお願い申し上げます。`

  return `
${data.name} 様

この度はスプラッシュンゴーのフランチャイズ加盟にご興味をお持ちいただき、
誠にありがとうございます。

${bodyText}

【事業説明資料】
PDF資料はこちら → スプラッシュンゴー事業説明資料
https://drive.google.com/file/d/1-LkZrzeg5eBFyZFMVBXJL1eTzUx1u1pK/view?usp=sharing

━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ受付内容】
お問い合わせ種別 : ${data.type}
お名前           : ${data.name}
${data.companyName ? `貴社名           : ${data.companyName}\n` : ""}${data.department ? `部署名・役職名   : ${data.department}\n` : ""}メールアドレス   : ${data.email}
電話番号         : ${data.phone}
ご利用経験       : ${data.experience}
出店希望エリア   : ${data.area}
土地の状況       : ${data.landStatus}${data.tsubo ? `（${data.tsubo}坪）` : ""}
ご希望の検討ステップ : ${data.steps}
${data.message ? `ご質問・ご要望   : ${data.message}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━
SPLASH'N'GO! フランチャイズ加盟担当
`.trim()
}

async function sendReplyEmail(data: Record<string, string>) {
  const transporter = getTransporter()
  const infoAddress = "info@splashbrothers.co.jp"

  await transporter.sendMail({
    from: `"SPLASH'N'GO! フランチャイズ担当" <${infoAddress}>`,
    replyTo: infoAddress,
    to: data.email,
    subject: "【お問い合わせ受付】スプラッシュンゴー フランチャイズ加盟お問い合わせを受け付けました",
    text: buildText(data),
    html: buildHtml(data),
  })
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const data: Record<string, string> = await req.json()

    if (!data.email || !data.name) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    await Promise.all([
      appendToSheet(data),
      sendReplyEmail(data),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[submit] Error:", err)
    return NextResponse.json(
      { error: "送信中にエラーが発生しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    )
  }
}
