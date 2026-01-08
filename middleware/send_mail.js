const nodemailer = require("nodemailer");
const { renderHpglToSvg } = require("./renderHpglToSvg");
const { getPatternPN } = require("./getPatternPN");

const transporter = nodemailer.createTransport({
  host: "eu.smtp.lear.com",
  port: 25,
  secure: false,
  ignoreTLS: true,
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"MUS" <gmbx-bzt01@lear.com>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", subject);
  } catch (err) {
    console.error("Email error:", err);
  }
};

const buildTable = (subs) => `
<div style="margin-bottom:10px">
<table border="0" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:separate;border-spacing:0;font-family:Arial, sans-serif; font-size:14px;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
  <thead>
    <tr style="background:#FAFAFA;">
    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Part Number</th>
    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Pattern N°</th>
    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Quantité demandée</th>
    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Quantité disponible</th>
    <th align="left" style="padding:10px;border-bottom:1px solid #ddd;">Statut</th>
    </tr>
  </thead>
  <tbody>
            ${subs
              .map(
                (s, i) => `
              <tr style="background:${i % 2 === 0 ? "#ffffff" : "#fefefe"};">
              <td style="padding:8px;border-top:1px solid #eee;">${
                s.partNumber || "-"
              }</td>
              <td style="padding:8px;border-top:1px solid #eee;">${
                s.patternNumb || "-"
              }</td>
              <td style="padding:8px;border-top:1px solid #eee;">${
                s.quantite || 0
              }</td>
              <td style="padding:8px;border-top:1px solid #eee;">${
                s.quantiteDisponible ?? "-"
              }</td>
              <td style="padding:8px;border-top:1px solid #eee;font-weight:bold;">
              ${s.statusSubDemande || "-"}
              </td>
              </tr>`
              )
              .join("")}
  </tbody>
</table>
</div>
<div>
${subs.map(async (s) => {
  const patternPN = await getPatternPN(s.partNumber, s.patternNumb);
  const svgContent = renderHpglToSvg(patternPN);

  // Return a standard string, not JSX
  return `
        <div style="border-radius:4px; padding:15px; margin-right:5px; margin-bottom:5px; border:1px solid #eee; display:inline-block;">
          ${svgContent}
          <p style="margin:5px 0 0 0;">PN: ${s.partNumber || "-"}</p>
          <p style="margin:2px 0 0 0;">Pattern: ${s.patternNumb || "-"}</p>
        </div>`;
})}
</div>

`;

module.exports = { sendEmail, buildTable };
