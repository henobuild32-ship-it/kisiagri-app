import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const CONTRACT_TYPES = [
  { value: 'vente_agricole', label: 'Vente agricole' },
  { value: 'achat', label: 'Achat' },
  { value: 'fourniture', label: 'Fourniture' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'personnalise', label: 'Personnalisé' },
];

function fmt(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : ''; }

function buildHTML(contract) {
  const typeLabel = (CONTRACT_TYPES.find(t => t.value === contract.type) || {}).label || 'Contrat';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.5;color:#1f2937;margin:40px}
  .header{text-align:center;border-bottom:3px solid #16a34a;padding-bottom:15px;margin-bottom:25px}
  .logo{font-size:28pt;font-weight:bold;color:#16a34a}
  .subtitle{font-size:10pt;color:#6b7280;margin-top:2px}
  .ref{text-align:right;font-size:9pt;color:#6b7280;margin-bottom:15px}
  h1{font-size:16pt;text-align:center;color:#1f2937;margin:5px 0}
  h2{font-size:12pt;color:#15803d;border-bottom:1px solid #e5e7eb;padding-bottom:3px;margin-top:20px}
  .parties{width:100%;margin:10px 0}
  .party{width:48%;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;vertical-align:top}
  .party-label{font-weight:bold;font-size:9pt;margin-bottom:5px}
  .amount-box{text-align:center;background:#f0fdf4;border:1.5px solid #16a34a;padding:12px;margin:10px 0;border-radius:6px}
  .amount{font-size:16pt;font-weight:bold;color:#16a34a}
  .signatures{width:100%;margin-top:40px}
  .sig{width:48%;text-align:center;padding:20px 10px;border:1px solid #e5e7eb;vertical-align:top}
  .footer{text-align:center;margin-top:40px;font-size:8pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px}
  .content{white-space:pre-wrap;text-align:justify}
  </style></head><body>
  <div class="header"><div class="logo">&#127793; KisiAgri</div><div class="subtitle">Plateforme Agricole Numerique</div><div class="subtitle">Cree par HenoBuild Entreprise</div></div>
  <div class="ref">Ref: ${(contract.id || '').substring(0, 8).toUpperCase()}<br>Emis le: ${new Date().toLocaleDateString('fr-FR')}</div>
  <h1>${contract.title || 'Contrat'}</h1><p style="text-align:center;color:#6b7280">${typeLabel}</p>
  <h2>Entre les soussignes</h2>
  <table class="parties"><tr>
  <td class="party"><div class="party-label" style="color:#16a34a">PARTIE A</div><p><strong>${contract.party_a_name || ''}</strong></p>${contract.party_a_phone ? `<p>Tel: ${contract.party_a_phone}</p>` : ''}${contract.party_a_email ? `<p>Email: ${contract.party_a_email}</p>` : ''}${contract.party_a_address ? `<p>Adresse: ${contract.party_a_address}</p>` : ''}</td>
  <td class="party" style="padding-left:15px"><div class="party-label" style="color:#f97316">PARTIE B</div><p><strong>${contract.party_b_name || ''}</strong></p>${contract.party_b_phone ? `<p>Tel: ${contract.party_b_phone}</p>` : ''}${contract.party_b_email ? `<p>Email: ${contract.party_b_email}</p>` : ''}${contract.party_b_address ? `<p>Adresse: ${contract.party_b_address}</p>` : ''}</td>
  </tr></table>
  <h2>Objet du contrat</h2><p>${contract.subject || ''}</p>
  ${contract.amount > 0 ? `<h2>Dispositions financieres</h2><div class="amount-box"><div class="amount">${Number(contract.amount).toLocaleString('fr-FR')} ${contract.currency || 'CDF'}</div></div>` : ''}
  ${(contract.start_date || contract.end_date) ? `<h2>Duree du contrat</h2>${contract.start_date ? `<p>Date de debut: ${fmt(contract.start_date)}</p>` : ''}${contract.end_date ? `<p>Date de fin: ${fmt(contract.end_date)}</p>` : ''}` : ''}
  ${contract.content || contract.clauses ? `<h2>Clauses et conditions</h2><div class="content">${contract.content || contract.clauses}</div>` : ''}
  <h2>Signatures</h2>
  <table class="signatures"><tr>
  <td class="sig"><p><strong>${contract.party_a_name || 'Partie A'}</strong></p><p>______________________</p></td>
  <td class="sig" style="padding-left:15px"><p><strong>${contract.party_b_name || 'Partie B'}</strong></p><p>______________________</p></td>
  </tr></table>
  <div class="footer">KisiAgri - Plateforme Agricole Numerique &middot; Cree par HenoBuild Entreprise &middot; Fondateur: Henock Aduma</div>
  </body></html>`;
}

export async function exportContractPDF(contract) {
  try {
    const html = buildHTML(contract);
    const { uri } = await Print.printToFileAsync({ html });
    const fileName = `${(contract.title || 'contrat').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.moveAsync({ from: uri, to: newPath });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, { mimeType: 'application/pdf', dialogTitle: 'Contrat KisiAgri' });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}