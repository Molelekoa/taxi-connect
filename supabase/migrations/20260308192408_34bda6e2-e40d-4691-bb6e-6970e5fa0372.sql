-- Track payment completions
CREATE OR REPLACE FUNCTION public.metric_payment_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
    PERFORM public.log_metric('payment_completed');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS metric_on_payment_completed ON public.payment_records;
CREATE TRIGGER metric_on_payment_completed
  AFTER UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_payment_completed();

-- Track new user signups (profile creation = signup)
CREATE OR REPLACE FUNCTION public.metric_signup_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.log_metric('signup_completed');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS metric_on_signup ON public.profiles;
CREATE TRIGGER metric_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_signup_completed();

-- Track delivery completions (parcel verified)
CREATE OR REPLACE FUNCTION public.metric_delivery_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'delivered_verified' THEN
    PERFORM public.log_metric('delivery_verified');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS metric_on_delivery_verified ON public.parcels;
CREATE TRIGGER metric_on_delivery_verified
  AFTER UPDATE ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_delivery_verified();