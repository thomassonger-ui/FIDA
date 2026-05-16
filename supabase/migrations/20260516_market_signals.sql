-- Market Signals — Jacksonville dental labor + demographic KPIs for Atticus™M

create table if not exists market_signals (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'labor_demand','workforce_supply','addressable_market',
    'education_landscape','demographics'
  )),
  metric_key text not null unique,
  label text not null,
  value numeric,
  unit text,
  display_format text not null default 'number'
    check (display_format in ('number','currency','percent','count')),
  source_name text,
  source_url text,
  as_of_date date,
  notes text,
  needs_review boolean not null default false,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists market_signals_category_idx
  on market_signals (category, display_order);

alter table market_signals enable row level security;

-- ============================================================================
-- Seed data (researched 2026-05-16; values flagged needs_review where the
-- agent had to estimate, infer, or use a national/state proxy)
-- ============================================================================

insert into market_signals
  (category, metric_key, label, value, unit, display_format, source_name, source_url, as_of_date, notes, needs_review, display_order)
values
-- LABOR DEMAND -----------------------------------------------------------
('labor_demand', 'da_open_postings_duval',
 'Open dental assistant postings (Duval)',
 110, 'postings', 'count',
 'Indeed.com job search',
 'https://www.indeed.com/q-dental-assistants-l-jacksonville,-fl-jobs.html',
 '2026-05-16',
 'Indeed search "dental assistants" Jacksonville, FL. Totals fluctuate daily and include some MSA-wide listings.',
 true, 10),

('labor_demand', 'efda_open_postings_duval',
 'Open EFDA postings (Jax MSA)',
 53, 'postings', 'count',
 'Indeed.com job search',
 'https://www.indeed.com/q-dental-assistant-expanded-function-l-jacksonville,-fl-jobs.html',
 '2026-05-16',
 'Indeed search "dental assistant expanded function" Jacksonville, FL.',
 true, 20),

('labor_demand', 'hygienist_open_postings_duval',
 'Open dental hygienist postings (Jax MSA)',
 94, 'postings', 'count',
 'Indeed.com job search',
 'https://www.indeed.com/q-dental-hygiene-l-jacksonville,-fl-jobs.html',
 '2026-05-16',
 'Office-demand proxy. Broader "dental hygiene" search; narrower "dental hygienist" returns ~34.',
 true, 30),

('labor_demand', 'da_median_wage_jax_msa',
 'Median annual wage — dental assistant',
 45960, '$/year', 'currency',
 'BLS OEWS Jacksonville FL MSA',
 'https://www.bls.gov/oes/2023/may/oes_27260.htm',
 '2023-05-31',
 'Mean annual wage, SOC 31-9091, Jacksonville FL MSA (area code 27260). May 2024 figure pending publication.',
 true, 40),

('labor_demand', 'hygienist_median_wage_jax_msa',
 'Median annual wage — dental hygienist',
 81224, '$/year', 'currency',
 'ZipRecruiter Jacksonville FL',
 'https://www.ziprecruiter.com/Jobs/Dental-Hygienist/-in-Jacksonville,FL',
 '2026-04-27',
 'Computed from median hourly $39.05 × 2080 hrs. Career-ceiling proxy. FL state BLS median is ~$74,000.',
 true, 50),

('labor_demand', 'da_projected_growth_10yr_fl',
 'FL 10-year projected employment growth (DA)',
 6.4, '%', 'percent',
 'FL Dept of Commerce / Projections Central',
 'https://projectionscentral.org/longterm',
 '2024-06-30',
 'Florida 2022-2032 long-term projection for SOC 31-9091, dental assistants.',
 true, 60),

-- WORKFORCE SUPPLY -------------------------------------------------------
('workforce_supply', 'da_employed_jax_msa',
 'Total employed dental assistants (Jax MSA)',
 2670, 'jobs', 'count',
 'BLS OEWS Jacksonville FL MSA',
 'https://www.bls.gov/oes/2023/may/oes_27260.htm',
 '2023-05-31',
 'Total employment for SOC 31-9091, Jacksonville FL MSA, May 2023.',
 true, 10),

('workforce_supply', 'licensed_dentists_duval',
 'Active FL-licensed dentists (Duval)',
 619, 'dentists', 'count',
 'FL Dept of Health Workforce Survey 2021-2022',
 'https://www.floridahealth.gov/programs-and-services/dental-health/reports/_documents/FloridaWorkforceSurveyReportofDentist2021-2022.pdf',
 '2022-12-31',
 'Estimate. Top-5 FL counties published; Duval falls ~6th-8th. Radiography certification addressable market.',
 true, 20),

('workforce_supply', 'dental_offices_duval',
 'Dental practice locations (Duval)',
 450, 'establishments', 'count',
 'U.S. Census County Business Patterns 2022, NAICS 621210',
 'https://data.census.gov/map/010XX00US/CBP2022/CB2200CBP?codeset=naics~621210',
 '2022-03-12',
 'Estimate inferred from CBP ratio; direct Duval cell requires interactive map query.',
 true, 30),

('workforce_supply', 'da_avg_tenure_national',
 'Avg DA tenure (national proxy)',
 2.8, 'years', 'number',
 'BLS Employee Tenure Summary, Jan 2024',
 'https://www.bls.gov/news.release/tenure.t06.htm',
 '2024-01-31',
 'National median tenure for healthcare support; BLS does not break out dental assistants specifically. ADAA cites ~24% annual non-certified turnover.',
 true, 40),

-- ADDRESSABLE MARKET -----------------------------------------------------
('addressable_market', 'pop_18_to_40_duval',
 'Population age 18–40 (Duval)',
 326000, 'people', 'count',
 'U.S. Census ACS 5-year 2019-2023',
 'https://censusreporter.org/profiles/05000US12031-duval-county-fl/',
 '2023-12-31',
 '~32% of ~1.007M total Duval population. Largest 5-yr cohort: 30-34 at 82,222.',
 true, 10),

('addressable_market', 'cna_workforce_jax_msa',
 'Nursing assistant / CNA workforce (Jax MSA)',
 8730, 'jobs', 'count',
 'BLS OEWS Jacksonville FL MSA',
 'https://www.bls.gov/oes/2023/may/oes_27260.htm',
 '2023-05-31',
 'SOC 31-1131, May 2023. Highest-converting career-changer pool for evening dental programs.',
 true, 20),

('addressable_market', 'retail_workforce_jax_msa',
 'Retail trade workforce (Jax MSA)',
 95800, 'jobs', 'count',
 'BLS Jacksonville MSA Economy at a Glance',
 'https://www.bls.gov/eag/eag.fl_jacksonville_msa.htm',
 '2024-12-31',
 'NAICS 44-45, 2024 annual average. Estimated from CES historical pattern.',
 true, 30),

('addressable_market', 'hospitality_workforce_jax_msa',
 'Leisure + hospitality workforce (Jax MSA)',
 92300, 'jobs', 'count',
 'CareerSource NE FL (BLS CES)',
 'https://lmsresources.labormarketinfo.com/library/releases/arearelease_region8.pdf',
 '2024-12-31',
 'Supersector includes NAICS 71 + 72. NAICS 72 alone is ~80-85k.',
 true, 40),

('addressable_market', 'warn_layoffs_ne_fl_12mo',
 'WARN-act layoffs (NE FL, trailing 12 mo)',
 1100, 'workers', 'count',
 'FloridaCommerce REACT WARN List',
 'https://reactwarn.floridajobs.org/WarnList/Records?year=2025',
 '2026-05-16',
 'Trailing-12-mo workers affected in Duval + neighboring counties. Aug 2025 alone showed 209 Duval workers.',
 true, 50),

('addressable_market', 'top_zip_18_40_density_duval',
 'Top ZIP by 18–40 count (32218, North Jax)',
 21000, 'people', 'count',
 'U.S. Census ACS 5-yr 2019-2023 / city-data.com',
 'https://www.city-data.com/zips/32218.html',
 '2023-12-31',
 'ZIP 32218 (North Jacksonville) — ~38% of 55,200 total population. Runners-up: 32246 (Southside), 32256 (Baymeadows).',
 true, 60),

-- EDUCATION LANDSCAPE ----------------------------------------------------
('education_landscape', 'competing_programs_jax',
 'Competing dental-assisting programs (Duval + adjacent)',
 7, 'programs', 'count',
 'Multi-source web inventory',
 'https://research.com/rankings/trade-schools/dental-assistant/most-affordable-dental-assistant-trade-schools-in-jacksonville-fl',
 '2026-05-16',
 'FSCJ, FIDA, Jacksonville Dental Assistant School, Jax Beaches Dental Assisting, Bartram Dental Assisting, Concorde Career Institute, Fortis College Orange Park.',
 false, 10),

('education_landscape', 'competitor_avg_tuition',
 'Avg competitor tuition',
 4400, '$', 'currency',
 'Composite of published tuition pages',
 'https://jacksonvilledentalassistantschool.com/tuition/',
 '2026-05-16',
 'Mean of: JAX DA School $3,250; Jax Beaches $2,500; FSCJ ~$2,878; FIDA $9,850; Bartram ~$3,500. Excludes Concorde/Fortis (not publicly listed).',
 true, 20),

('education_landscape', 'competitor_avg_length_weeks',
 'Avg competitor program length',
 22, 'weeks', 'number',
 'Composite of program length disclosures',
 'https://research.com/rankings/trade-schools/dental-assistant/most-affordable-dental-assistant-trade-schools-in-jacksonville-fl',
 '2026-05-16',
 'JAX DA 12wk, Jax Beaches 12wk, FIDA 26wk, Bartram 10wk, FSCJ 43wk, Concorde 39wk.',
 false, 30),

('education_landscape', 'largest_competitor_name',
 'Largest competitor (FSCJ)',
 null, 'students/yr', 'count',
 'FSCJ program page',
 'https://catalog.fscj.edu/programs/5649',
 '2026-05-16',
 'Florida State College at Jacksonville — only ADA-CODA accredited program in Duval, admits one cohort each August. Seat count not publicly disclosed (~24-30 est).',
 true, 40),

-- DEMOGRAPHICS -----------------------------------------------------------
('demographics', 'median_hh_income_duval',
 'Median household income (Duval)',
 68447, '$', 'currency',
 'U.S. Census ACS 5-year 2019-2023',
 'https://www.census.gov/quickfacts/fact/table/duvalcountyflorida/PST045223',
 '2023-12-31',
 'In 2023 inflation-adjusted dollars. ~87% of US median.',
 false, 10),

('demographics', 'pct_no_bachelor_duval',
 '% adults 25+ without bachelor''s degree',
 64.4, '%', 'percent',
 'U.S. Census ACS 5-year via Census Reporter',
 'https://censusreporter.org/profiles/05000US12031-duval-county-fl/',
 '2023-12-31',
 'Direct TAM proxy — addressable workforce for credentialing programs.',
 false, 20),

('demographics', 'pct_hispanic_duval',
 '% Hispanic or Latino population',
 12.4, '%', 'percent',
 'U.S. Census QuickFacts Duval County',
 'https://www.census.gov/quickfacts/fact/table/duvalcountyflorida/PST045223',
 '2023-07-01',
 'Channel-decision input.',
 false, 30),

('demographics', 'pct_black_duval',
 '% Black or African American population',
 28.2, '%', 'percent',
 'U.S. Census QuickFacts Duval County',
 'https://www.census.gov/quickfacts/fact/table/duvalcountyflorida/PST045223',
 '2023-07-01',
 'Black alone, all ages, Duval County.',
 false, 40),

('demographics', 'female_labor_force_participation_duval',
 'Female labor force participation (Duval)',
 60.4, '%', 'percent',
 'FL Office of Economic & Demographic Research',
 'https://edr.state.fl.us/content/area-profiles/county/duval.pdf',
 '2023-12-31',
 '~90% of dental assistants nationally are female; LFP is a key TAM gate.',
 false, 50)

on conflict (metric_key) do nothing;
