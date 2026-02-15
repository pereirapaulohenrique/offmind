export function getWaitlistWelcomeEmail(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to OffMind</title>
</head>
<body style="margin:0; padding:0; background-color:#1a1614; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1614; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%;">
          
          <!-- Logo area -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="font-size: 28px; font-weight: 700; color: #f5efe8; letter-spacing: -0.5px;">OffMind</span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #252220; border-radius: 16px; padding: 40px 36px;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #f5efe8; line-height: 1.3;">
                You're in. 🎉
              </h1>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #c4b8ab;">
                Thanks for joining the OffMind waitlist. You're among the first to believe that great ideas deserve better than a crowded mind.
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #c4b8ab;">
                Here's what OffMind will do for you:
              </p>

              <!-- Benefits -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #1a1614; border-radius: 10px; margin-bottom: 8px;">
                    <p style="margin: 0; font-size: 15px; color: #f5efe8;">
                      <span style="color: #22b8cf; font-weight: 600;">Capture</span>
                      <span style="color: #7a7068;"> — </span>
                      <span style="color: #c4b8ab;">Dump every thought in 2 seconds. Voice, text, email.</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #1a1614; border-radius: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #f5efe8;">
                      <span style="color: #b07040; font-weight: 600;">Organize</span>
                      <span style="color: #7a7068;"> — </span>
                      <span style="color: #c4b8ab;">AI suggests where each thought belongs. You approve.</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #1a1614; border-radius: 10px;">
                    <p style="margin: 0; font-size: 15px; color: #f5efe8;">
                      <span style="color: #ea580c; font-weight: 600;">Focus</span>
                      <span style="color: #7a7068;"> — </span>
                      <span style="color: #c4b8ab;">See only what you committed to today. Nothing else.</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #3a3530; margin: 28px 0;" />

              <!-- Early bird -->
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #ea580c;">
                🔑 Early Supporter Perk
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #c4b8ab;">
                As a waitlist member, you'll get access to an exclusive lifetime deal when we launch. No subscription forever — just a one-time payment.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #5a524a;">
                Built with care by an indie developer.
              </p>
              <p style="margin: 0; font-size: 13px; color: #5a524a;">
                <a href="https://getoffmind.com" style="color: #ea580c; text-decoration: none;">getoffmind.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
