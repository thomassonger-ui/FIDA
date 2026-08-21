-- it_tickets was created without RLS, leaving it readable/writable by anyone
-- holding the anon key. All app access goes through the service-role client
-- in app/api/admin/it-tickets/route.ts (which bypasses RLS), so enabling RLS
-- with no policies simply closes the anon/authenticated door.
alter table public.it_tickets enable row level security;

-- Pin search_path on trigger functions flagged by the Supabase linter
-- (function_search_path_mutable).
alter function public.touch_ticket_on_message() set search_path = public;
alter function public.tickets_autolink_student() set search_path = public;
alter function public.touch_students_updated() set search_path = public;
alter function public.prevent_locked_doc_changes() set search_path = public;
