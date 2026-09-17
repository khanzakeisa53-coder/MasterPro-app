export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return dateString;
  }
}

export function calculateDaysRemaining(dueDateString: string): number {
  if (!dueDateString) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getAgingCategory(dueDateString: string, status: string): 'belum_jatuh_tempo' | 'mendekati' | 'overdue' {
  if (status === 'lunas') return 'belum_jatuh_tempo';
  const days = calculateDaysRemaining(dueDateString);
  if (days < 0) return 'overdue';
  if (days <= 7) return 'mendekati';
  return 'belum_jatuh_tempo';
}
