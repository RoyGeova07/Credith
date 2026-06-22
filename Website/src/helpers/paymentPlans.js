import { Get, Post } from "./fetcher"

export async function getPendingPayments() {
  const response = await Get("/api/payment-plan/pending-payments")
  if (response.status >= 400)
    throw new Error(response.json.message)
  return response.json
}

export async function getPaymentPlan(dni) {
  const response = await Get(`/api/payment-plan/${encodeURIComponent(dni)}`)
  if (response.status >= 400)
    throw new Error(response.json.message)
  return response.json
}

export async function payPlan(planId, amount, month) {
  const response = await Post(`/api/payment-plan/${encodeURIComponent(planId)}/pay`, { amount, month })
  if (response.status >= 400)
    throw new Error(response.json.message)
  return response.json
}
