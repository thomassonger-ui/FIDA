-- Pipeline board: two new stages between applied and registered.
-- Labels only changed for registered (Closed Won) and lost (Passed) — keys stay.
alter table public.prospects drop constraint prospects_stage_chk;
alter table public.prospects add constraint prospects_stage_chk check (
  stage = any (array['identified','nurture','applied','meeting_set','proposal','registered','enrolled','graduated','lost'])
);
