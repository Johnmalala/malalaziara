import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Buffer } from 'https://deno.land/std@0.168.0/io/buffer.ts'

// Helper to get Daraja Auth Token
async function getAuthToken(consumerKey: string, consumerSecret: string) {
  const auth = new Buffer(consumerKey + ':' + consumerSecret).toString('base64')
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.errorMessage || 'Failed to get auth token')
  }
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id, phone_number, amount } = await req.json()

    if (!booking_id || !phone_number || !amount) {
      throw new Error('Booking ID, phone number, and amount are required.')
    }

    // 1. Get secrets
    const consumerKey = Deno.env.get('DARAJA_CONSUMER_KEY') ?? ''
    const consumerSecret = Deno.env.get('DARAJA_CONSUMER_SECRET') ?? ''
    const businessShortCode = Deno.env.get('DARAJA_BUSINESS_SHORTCODE') ?? ''
    const passkey = Deno.env.get('DARAJA_PASSKEY') ?? ''
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')
    if (!supabaseUrl) throw new Error('Supabase URL not found.')
    const callbackUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/daraja-callback`

    if (!consumerKey || !consumerSecret || !businessShortCode || !passkey) {
      throw new Error('Daraja environment variables are not fully configured.')
    }

    // 2. Get Auth Token
    const token = await getAuthToken(consumerKey, consumerSecret)

    // 3. Prepare STK Push Payload
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = new Buffer(businessShortCode + passkey + timestamp).toString('base64')
    
    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline', // or 'CustomerBuyGoodsOnline'
      Amount: Math.ceil(amount), // Daraja requires an integer
      PartyA: phone_number.replace(/^0+/, '254'), // Normalize phone number
      PartyB: businessShortCode,
      PhoneNumber: phone_number.replace(/^0+/, '254'),
      CallBackURL: callbackUrl,
      AccountReference: `Ziarazetu-${booking_id.substring(0, 8)}`,
      TransactionDesc: `Payment for booking ${booking_id}`,
    }

    // 4. Initiate STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const stkData = await stkResponse.json()

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      throw new Error(stkData.errorMessage || stkData.ResponseDescription || 'Failed to initiate STK push.')
    }

    // 5. Store CheckoutRequestID in the booking table
    const supabaseAdmin = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ daraja_checkout_request_id: stkData.CheckoutRequestID })
      .eq('id', booking_id)

    if (updateError) {
      throw new Error(`Failed to store CheckoutRequestID: ${updateError.message}`)
    }

    return new Response(JSON.stringify({ message: 'STK push initiated. Please check your phone.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in initiate-daraja-payment function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
