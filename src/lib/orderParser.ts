export interface ParsedOrderItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface ParsedOrderData {
  customerName?: string;
  customerPhone?: string;
  customerCompany?: string;
  destinationTag?: string;
  customerNpwp?: string;
  courier?: string;
  notes?: string;
  applyTax?: boolean;
  taxRate?: number;
  items: ParsedOrderItem[];
}

/**
 * Clean Rupiah numbers from text like "Rp 450.000", "450k", "1.2jt", "125000"
 */
function parsePrice(text: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase().trim();

  // e.g. 1.2jt or 2jt
  const jtMatch = lower.match(/([0-9]+(?:[.,][0-9]+)?)\s*jt/);
  if (jtMatch) {
    const num = parseFloat(jtMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // e.g. 450k or 450 k
  const kMatch = lower.match(/([0-9]+(?:[.,][0-9]+)?)\s*k/);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // Remove non-digits
  const cleanDigits = lower.replace(/[^0-9]/g, '');
  if (!cleanDigits) return 0;
  return parseInt(cleanDigits, 10) || 0;
}

/**
 * Intelligent Client-Side Indonesian WhatsApp Chat Order Parser
 */
export function smartParseOrderChat(rawText: string): ParsedOrderData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: ParsedOrderData = {
    items: [],
  };

  // 1. Extract Phone / WhatsApp
  const phoneMatch = rawText.match(/(?:08|\+?628)[0-9\s-]{8,15}/);
  if (phoneMatch) {
    const cleanP = phoneMatch[0].replace(/[^0-9]/g, '');
    result.customerPhone = cleanP.startsWith('62') ? cleanP.substring(2) : cleanP.startsWith('0') ? cleanP.substring(1) : cleanP;
  }

  // 2. Extract Company
  const companyMatch = rawText.match(/\b(PT|CV|UD|Toko|UD\.|CV\.|PT\.)\s+([A-Za-z0-9&.\s]+?)(?=[,\n;()]|$)/i);
  if (companyMatch) {
    result.customerCompany = `${companyMatch[1].toUpperCase()} ${companyMatch[2].trim()}`;
  }

  // 3. Extract Customer Name
  const namePatterns = [
    /(?:nama\s*saya|nama\s*pelanggan|nama\s*pemesan|nama\s*:|atas\s*nama|a\/n)\s*:?\s*([A-Za-z\s'.]{3,35})/i,
    /(?:halo\s*admin,\s*saya|halo\s*min,\s*saya|saya)\s+([A-Za-z\s'.]{3,30})(?=[,(]|\s+dari|\s+mau|\s+pesan)/i,
    /(?:order\s*dari|pesanan\s*dari)\s*:?\s*([A-Za-z\s'.]{3,35})/i,
  ];

  for (const pat of namePatterns) {
    const match = rawText.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure not a common word
      if (!/^(mau|tolong|mohon|admin|pesan|kirim|ini)$/i.test(candidate)) {
        result.customerName = candidate;
        break;
      }
    }
  }

  // If still no name, check first line if it looks like a greeting with a name
  if (!result.customerName && lines.length > 0) {
    const firstLine = lines[0];
    const m = firstLine.match(/(?:saya|a\/n|bapak|ibu|pak|bu)\s+([A-Za-z\s]{3,25})/i);
    if (m && m[1]) {
      result.customerName = m[1].trim();
    }
  }

  // 4. Extract Destination / Address
  const destPatterns = [
    /(?:kirim\s*ke|alamat\s*:|tujuan\s*:|destinasi\s*:|alamat\s*pengiriman\s*:)\s*:?\s*([^\n,]+(?:,\s*[^\n,]+)*)/i,
    /(?:gudang\s+[^\n]+)/i,
  ];
  for (const pat of destPatterns) {
    const match = rawText.match(pat);
    if (match && match[1]) {
      result.destinationTag = match[1].trim();
      break;
    } else if (match && match[0]) {
      result.destinationTag = match[0].trim();
      break;
    }
  }

  // 5. Extract NPWP / NIK
  const npwpMatch = rawText.match(/(?:npwp|nik)\s*:?\s*([0-9.\s-]{12,25})/i);
  if (npwpMatch && npwpMatch[1]) {
    result.customerNpwp = npwpMatch[1].trim();
    result.applyTax = true;
    result.taxRate = 11;
  }

  // Check Tax keywords
  if (/ppn|faktur\s*pajak|kenakan\s*pajak/i.test(rawText)) {
    result.applyTax = true;
    result.taxRate = /12%/i.test(rawText) ? 12 : 11;
  }

  // 6. Extract Courier
  const courierKeywords = [
    { name: 'Dakota Cargo', regex: /dakota/i },
    { name: 'JNE Trucking (JTR)', regex: /jne|jtr/i },
    { name: 'J&T Cargo', regex: /j&t|jnt/i },
    { name: 'SiCepat Cargo', regex: /sicepat/i },
    { name: 'Anteraja', regex: /anteraja/i },
    { name: 'Lalamove', regex: /lalamove/i },
  ];
  for (const c of courierKeywords) {
    if (c.regex.test(rawText)) {
      result.courier = c.name;
      break;
    }
  }

  // 7. Extract Notes
  const notePatterns = [
    /(?:catatan|note|notes|pesan\s*khusus|nb)\s*:?\s*([^\n]+)/i,
    /(?:tolong\s+[^\n.]+)/i,
    /(?:packing\s+[^\n.]+)/i,
  ];
  for (const pat of notePatterns) {
    const match = rawText.match(pat);
    if (match) {
      result.notes = (match[1] || match[0]).trim();
      break;
    }
  }

  // 8. Extract Item List
  // Look for lines that look like items
  for (const line of lines) {
    // Ignore lines that are strictly greeting, address, or phone
    if (/^(halo|selamat|kirim ke|alamat|no hp|wa|telp|catatan|terima kasih|mohon|nb:)/i.test(line)) {
      continue;
    }

    // Pattern 1: "- 5 roll Kabel Tembaga Industri @ 450000" or "1. 2 set Pipa Galvanis @ 125k"
    const itemPattern1 = /^[-*•\d.)\s]*(\d+)\s*(?:roll|pcs|pc|set|dus|karton|btg|sak|buah|box|unit|x)?\s+(.+?)(?:@|harga|rp|sebesar)\s*([0-9.,kjt]+)?$/i;
    const match1 = line.match(itemPattern1);
    if (match1) {
      const qty = parseInt(match1[1], 10) || 1;
      const name = match1[2].replace(/[-*•]/g, '').trim();
      const price = parsePrice(match1[3] || '0');
      if (name.length > 1) {
        result.items.push({ name, qty, unitPrice: price });
        continue;
      }
    }

    // Pattern 2: "- Kabel Tembaga Industri 50m Roll (5x) @ 450.000"
    const itemPattern2 = /^[-*•\d.)\s]*(.+?)\s*\(?(\d+)\s*(?:roll|pcs|pc|set|dus|karton|btg|sak|buah|box|unit|x)\)?(?:\s*@|\s*rp|\s*sebesar|\s*harga)?\s*([0-9.,kjt]+)?$/i;
    const match2 = line.match(itemPattern2);
    if (match2) {
      const name = match2[1].replace(/[-*•]/g, '').trim();
      const qty = parseInt(match2[2], 10) || 1;
      const price = parsePrice(match2[3] || '0');
      if (name.length > 2 && !/^(halo|alamat|telepon|catatan)$/i.test(name)) {
        result.items.push({ name, qty, unitPrice: price });
        continue;
      }
    }

    // Pattern 3: Simple bullet point with product and price: "- Semen Tiga Roda 40kg 10 sak"
    const itemPattern3 = /^[-*•]\s*([A-Za-z0-9\s/.,()-]+?)\s+(\d+)\s*(?:roll|pcs|pc|set|dus|karton|btg|sak|buah|box|unit)?$/i;
    const match3 = line.match(itemPattern3);
    if (match3) {
      const name = match3[1].trim();
      const qty = parseInt(match3[2], 10) || 1;
      if (name.length > 2) {
        result.items.push({ name, qty, unitPrice: 0 });
        continue;
      }
    }
  }

  // Fallback if no items detected: create a single item from the first relevant non-empty line
  if (result.items.length === 0) {
    const itemLine = lines.find(
      (l) =>
        !/^(halo|selamat|kirim|alamat|no|wa|telp|catatan|terima kasih|budi|pt|cv)/i.test(l) &&
        l.length > 3
    );
    if (itemLine) {
      result.items.push({
        name: itemLine.replace(/^[-*•\d.)\s]+/, '').trim(),
        qty: 1,
        unitPrice: 0,
      });
    }
  }

  return result;
}

/**
 * Calls Gemini Server Endpoint with Fallback to Local Smart Parser
 */
export async function parseOrderWithAI(rawText: string): Promise<{
  data: ParsedOrderData;
  source: 'gemini' | 'client_heuristic';
}> {
  try {
    const response = await fetch('/api/ai/parse-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          data: {
            customerName: json.data.customerName || undefined,
            customerPhone: json.data.customerPhone || undefined,
            customerCompany: json.data.customerCompany || undefined,
            destinationTag: json.data.destinationTag || undefined,
            customerNpwp: json.data.customerNpwp || undefined,
            courier: json.data.courier || undefined,
            notes: json.data.notes || undefined,
            applyTax: json.data.applyTax ?? undefined,
            taxRate: json.data.taxRate ?? undefined,
            items: Array.isArray(json.data.items) && json.data.items.length > 0
              ? json.data.items.map((it: any) => ({
                  name: String(it.name || 'Produk Baru'),
                  qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
                  unitPrice: Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : 0,
                }))
              : [],
          },
          source: 'gemini',
        };
      }
    }
  } catch (err) {
    console.warn('AI Server parse failed or offline, falling back to smart regex parser:', err);
  }

  // Fallback to client-side smart parser
  const clientParsed = smartParseOrderChat(rawText);
  return {
    data: clientParsed,
    source: 'client_heuristic',
  };
}

/**
 * Pre-filled Chat Templates for Quick Testing by Cashiers
 */
export const SAMPLE_CHAT_TEMPLATES = [
  {
    title: '💬 Chat WA Retail Elektrik',
    text: `Halo admin Pesanan Master, saya Hendra Wijaya (081288992233).
Mau pesan barang berikut untuk proyek renovasi rumah:
- 3 roll Kabel Tembaga Industri 50m Roll @ 450.000
- 4 set Stop Kontak Arde Panasonic @ 65.000
Kirim ke Gudang Bintaro Sektor 9, Tangerang Selatan via Dakota Cargo.
Tolong kirim sebelum jam 3 sore ya min, packing aman. Terima kasih!`,
  },
  {
    title: '🏢 Purchase Order B2B (PT)',
    text: `Yth. Bagian Penjualan,
Pesanan Resmi dari PT Konstruksi Nusantara Prima
PIC: Ir. Bambang Hermanto
No. HP: 08119876543
NPWP: 01.345.678.9-012.000
Kenakan Faktur Pajak PPN 11%.

Daftar Pemesanan Material:
1. 10 roll Kabel Tembaga Industri 50m Roll @ 450.000
2. 20 btg Pipa Besi Galvanis 2 Inch @ 175.000
Alamat Kirim: Proyek Bendungan Cikarang Blok C4.
Kurir Rekomendasi: Dakota Cargo (Armada Truk).
Catatan: Sertakan surat jalan 3 rangkap.`,
  },
  {
    title: '⚡ Chat Grosir Cepat',
    text: `Mas pesan cepat ya a/n Toko Berkah Jaya (085711223344):
- Pipa PVC 3 Inch Wavin 8 btg @ 85k
- Fitting Sambungan Tee 15 pcs @ 12k
Kirim ke Jl. Raya Pasar Minggu No. 45 Jaksel. Kurir Lalamove. Makasih`,
  },
];
