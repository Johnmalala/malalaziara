/*
          # [Operation Name]
          Update payment_status Enum

          ## Query Description: [This operation adds new values ('pending_confirmation', 'partially_paid') to the 'payment_status' enum type. This is necessary to support the new payment flows where a booking is created before payment is confirmed or when partial payments are made.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [false]
          
          ## Structure Details:
          - Type: payment_status
          
          ## Security Implications:
          - RLS Status: [N/A]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [N/A]
          - Triggers: [N/A]
          - Estimated Impact: [None]
          */
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'pending_confirmation';
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'partially_paid';
