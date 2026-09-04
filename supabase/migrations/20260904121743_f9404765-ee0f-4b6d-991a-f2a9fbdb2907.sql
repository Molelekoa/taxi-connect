-- Remove the default PUBLIC EXECUTE grant from all security definer functions
REVOKE EXECUTE ON FUNCTION public.audit_match_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_parcel_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_traveler_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.browse_pending_parcels() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_profile_id(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_metric(text, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_claim_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_delivery_verified() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_match_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_parcel_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_payment_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.metric_signup_completed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_parcel() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_trip() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_profile(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_traveler_profile(uuid) FROM PUBLIC;

-- Re-grant EXECUTE to authenticated ONLY for the functions the app calls via RPC
-- or that RLS policies evaluate as the invoking user
GRANT EXECUTE ON FUNCTION public.get_profile_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.browse_pending_parcels() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_traveler_profile(uuid) TO authenticated;

-- Ensure the service role (edge functions, triggers via owner context) retains access
GRANT EXECUTE ON FUNCTION public.audit_match_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_parcel_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_traveler_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.browse_pending_parcels() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_profile_id(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_metric(text, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_claim_completed() TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_delivery_verified() TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_match_created() TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_parcel_created() TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_payment_completed() TO service_role;
GRANT EXECUTE ON FUNCTION public.metric_signup_completed() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_new_parcel() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_new_trip() TO service_role;
GRANT EXECUTE ON FUNCTION public.owns_profile(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.owns_traveler_profile(uuid) TO service_role;