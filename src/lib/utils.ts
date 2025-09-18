import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function getCurrentWeek(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const week = Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1
  return `S${week.toString().padStart(2, '0')}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR').format(date)
}