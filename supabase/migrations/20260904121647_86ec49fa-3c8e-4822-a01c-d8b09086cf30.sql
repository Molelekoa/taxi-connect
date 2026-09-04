-- 1) Revoke EXECUTE from anon on ALL security definer functions
REVOKE EXECUTE ON FUNCTION public.audit_match_status_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.audit_parcel_status_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.audit_traveler_status_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.browse_pending_parcels() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_profile_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_metric(text, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_claim_completed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_delivery_verified() FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_match_created() FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_parcel_created() FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_payment_completed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.metric_signup_completed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_parcel() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_trip() FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_traveler_profile(uuid) FROM anon;

-- 2) Revoke EXECUTE from authenticated on internal trigger/metric functions
-- (never invoked by clients; they fire via triggers which do not require EXECUTE)
REVOKE EXECUTE ON FUNCTION public.audit_match_status_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_parcel_status_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_traveler_status_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_metric(text, numeric) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_claim_completed() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_delivery_verified() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_match_created() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_parcel_created() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_payment_completed() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_signup_completed() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_parcel() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_trip() FROM authenticated;

-- 3) quote_requests: admin-only read access (RLS already enabled, service-role writes only)
GRANT SELECT ON public.quote_requests TO authenticated;
CREATE POLICY "Admins can view quote requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));