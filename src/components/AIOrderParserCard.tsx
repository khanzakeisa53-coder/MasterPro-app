import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Copy,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { parseOrderWithAI, SAMPLE_CHAT_TEMPLATES, ParsedOrderData } from '../lib/orderParser';

interface AIOrderParserCardProps {
  onParsedDataApplied: (data: ParsedOrderData) => void;
}

export const AIOrderParserCard: React.FC<AIOrderParserCardProps> = ({ onParsedDataApplied }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  const handleApplyTemplate = (text: string) => {
    setRawText(text);
    setStatusMessage(null);
    setIsOpen(true);
  };

  const handleParse = async () => {
    if (!rawText.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Silakan tempel teks chat WhatsApp pesanan terlebih dahulu.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await parseOrderWithAI(rawText);
      const { data, source } = result;

      if (!data.items || data.items.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'AI tidak menemukan daftar barang dalam chat ini. Pastikan format ada nama barang atau jumlahnya.',
        });
        setIsLoading(false);
        return;
      }

      // Apply to form
      onParsedDataApplied(data);

      const sourceLabel =
        source === 'gemini'
          ? 'Gemini 2.5 Flash'
          : 'Smart Parser Heuristik Otomatis';

      setStatusMessage({
        type: 'success',
        text: `Sukses! ${data.items.length} barang, data pelanggan, dan catatan berhasil dipetakan ke Draft Faktur.`,
        details: `Diproses via ${sourceLabel}.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kendala saat memproses teks. Silakan coba lagi atau isi manual.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRawText('');
    setStatusMessage(null);
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#FFFDF9] via-[#F5F0E8] to-[#FFFDF9] dark:from-[#241A14] dark:via-[#1D140F] dark:to-[#241A14] border border-[#1565C0]/30 dark:border-[#1565C0]/50 p-2.5 sm:px-4 shadow-2xs transition-all">
      {/* 1-Line Compact Horizontal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0D47A1] to-[#1E88E5] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles size={13} className="animate-pulse" />
          </div>
          <span className="text-xs font-bold text-[#2D2119] dark:text-[#F7F2EC] flex items-center gap-1.5">
            <span>AI Order Parser</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E65100]/15 text-[#E65100] dark:text-[#FFB74D]">
              WA
            </span>
          </span>
        </div>

        {/* Quick Example Template Chips */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[10px] text-[#7D6E63] dark:text-[#A89B8F]">Coba Contoh:</span>
          {SAMPLE_CHAT_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl.text)}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-[#2A1F18] hover:bg-[#EADFD1] dark:hover:bg-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] border border-[#EADFD1] dark:border-[#382C24] cursor-pointer"
            >
              {tmpl.title}
            </button>
          ))}
        </div>

        {/* Toggle Drawer Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isOpen
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white dark:bg-[#2A1F18] text-[#1565C0] dark:text-[#90CAF9] border border-[#1565C0]/40 hover:bg-[#0D47A1]/10'
          }`}
        >
          <Wand2 size={13} />
          <span>{isOpen ? 'Tutup Panel Parser' : 'Tempel Chat WA (Auto-Fill)'}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Collapsible Drawer */}
      {isOpen && (
        <div className="space-y-2.5 pt-3 mt-2 border-t border-[#EADFD1] dark:border-[#382C24] animate-in fade-in duration-150">
          <div className="relative">
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Tempel teks chat WhatsApp pesanan dari pelanggan di sini...\nContoh: "Halo min, saya Budi dari PT Maju Bersama (08123456789). Mau pesan 3 roll Kabel Tembaga @ 450.000. Kirim ke Gudang Bintaro via Dakota Cargo ya."`}
              className="w-full p-2.5 text-xs font-mono rounded-lg bg-white dark:bg-[#1A130F] border border-[#D8CBBC] dark:border-[#382C24] text-[#2D2119] dark:text-[#F7F2EC] placeholder:text-[#A89B8F] dark:placeholder:text-[#6E6054] focus:outline-none focus:ring-1 focus:ring-[#1565C0] resize-y"
            />
            {rawText && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F0E8] dark:bg-[#2C211A] text-[#7D6E63] dark:text-[#A89B8F] hover:text-rose-600"
              >
                Hapus
              </button>
            )}
          </div>

          {statusMessage && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={14} className="shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <div className="flex-1 text-[11px] font-medium">
                {statusMessage.text} {statusMessage.details}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleParse}
              disabled={isLoading || !rawText.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D47A1] to-[#1E88E5] hover:from-[#1565C0] hover:to-[#2196F3] shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Wand2 size={13} />
                  <span>Ekstrak & Isi Otomatis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
