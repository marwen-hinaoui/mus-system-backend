const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "marwenhinaouii@gmail.com",
    pass: "fuwz czxt xlok skrk",
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"MUS" <mus@lear.com>`,
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
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:Arial, sans-serif;font-size:14px;">
        <thead style="background:#f2f2f2;">
          <tr>
            <th align="left">Part Number</th>
            <th align="left">Pattern N°</th>
            <th align="left">Quantité demandée</th>
            <th align="left">Quantité disponible</th>
            <th align="left">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${subs
            .map(
              (s) => `
            <tr>
              <td>${s.partNumber || "-"}</td>
              <td>${s.patternNumb || "-"}</td>
              <td>${s.quantite || 0}</td>
              <td>${s.quantiteDisponible ?? "-"}</td>
              <td>${s.statusSubDemande || "-"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

module.exports = { sendEmail, buildTable };
