import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const stkCallback = body.Body.stkCallback

    if (!stkCallback) {
      throw new Error('Invalid callback format')
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode
    
    const supabaseAdmin = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the booking using the CheckoutRequestID
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, amount, total_paid')
      .eq('daraja_checkout_request_id', checkoutRequestId)
      .single()

    if (fetchError || !booking) {
      throw new Error(`Booking not found for CheckoutRequestID: ${checkoutRequestId}`)
    }

    if (resultCode === 0) {
      // Payment was successful
      const metadata = stkCallback.CallbackMetadata.Item
      const amountPaid = metadata.find((item: any) => item.Name === 'Amount')?.Value
      const mpesaReceipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value

      const newTotalPaid = (booking.total_paid || 0) + parseFloat(amountPaid)
      const isFullyPaid = newTotalPaid >= booking.amount

      // 1. Record the payment
      const { error: paymentInsertError } = await supabaseAdmin
        .from('booking_payments')
        .insert({
          booking_id: booking.id,
          amount: parseFloat(amountPaid),
          payment_date: new Date().toISOString(),
          daraja_mpesa_receipt: mpesaReceipt,
          payment_reference: checkoutRequestId,
        })
      if (paymentInsertError) throw paymentInsertError

      // 2. Update the booking status
      const { error: bookingUpdateError } = await supabaseAdmin
        .from('bookings')
        .update({
          total_paid: newTotalPaid,
          payment_status: isFullyPaid ? 'confirmed' : 'partially_paid',
          status: isFullyPaid ? 'active' : 'pending_confirmation',
          payment_reference: mpesaReceipt,
        })
        .eq('id', booking.id)
      if (bookingUpdateError) throw bookingUpdateError

    } else {
      // Payment failed or was cancelled
      const resultDesc = stkCallback.ResultDesc
      // Optionally, update the booking to 'failed' status
      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id)
      console.error(`Daraja payment failed for ${checkoutRequestId}: ${resultDesc}`)
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Daraja callback error:', error.message)
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: 'Failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
