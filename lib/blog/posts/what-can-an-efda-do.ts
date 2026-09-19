import type { Post } from "../types";

export const whatCanAnEfdaDo: Post = {
  slug: "what-can-an-efda-do-in-florida",
  title: "What Can an Expanded Functions Dental Assistant Do in Florida?",
  seoTitle: "What Can an EFDA Do in Florida? Duties, Supervision and Limits",
  description:
    "Task-by-task guide to Florida Rule 64B5-16.005: duties a dental assistant may perform, the training and supervision each needs, and what can't be delegated.",
  eyebrow: "Expanded Functions · Reference",
  tags: ["efda", "florida-dental-regulations", "for-dentists"],
  published: "2026-09-18",
  reviewed: "2026-09-18",
  summary:
    "Florida answers this question with unusual precision. Rule 64B5-16.005 names the tasks a dentist may delegate to a dental assistant and attaches two conditions to every one of them: the kind of training the assistant must have, and how closely the dentist must supervise. This page organizes the rule the way an office actually uses it.",
  keyTakeaways: [
    "Every delegable task in Florida carries two conditions: a training type (formal or on-the-job) and a supervision level (direct, indirect or general).",
    "Formal training unlocks the expanded duties: sealants, fluoride, polishing, rubber dams, matrices, liners, temporaries, retraction cord, dressings, suture removal and most impressions.",
    "Nothing irreversible is delegable. Diagnosis, treatment planning, prescribing, and cutting hard or soft tissue stay with the dentist; scaling and root planing stay with the hygienist.",
    "Rule 64B5-16.005 was amended effective April 26, 2026. Always confirm the current text before relying on a list.",
  ],
  body: [
    { type: "h2", id: "how-to-read-the-rule", text: "How Florida's rule is built" },
    {
      type: "p",
      text: "Section 466.024 of the Florida Statutes lets a dentist delegate *remediable* tasks and leaves the detail to the Board of Dentistry.{{stat-466024}} The Board defines a remediable task as an intraoral task that does not create unalterable changes in the oral cavity or contiguous structures, is reversible, and does not expose the patient to increased risk.{{rule-16001}} Rule 64B5-16.005 then sorts the permitted tasks into groups, each defined by a training requirement and a supervision level.{{rule-16005}}",
    },
    {
      type: "table",
      caption: "Supervision levels defined in Rule 64B5-16.001, F.A.C.",
      head: ["Level", "What the dentist must do"],
      rows: [
        ["Direct", "Examine the patient, diagnose, authorize the procedure, be on the premises while it is performed, and approve the work before the patient leaves"],
        ["Indirect", "Examine the patient, diagnose, authorize the procedure, and be on the premises while it is performed"],
        ["General", "Authorize the procedure; need not be present. The authorization is valid for a limited period"],
      ],
    },
    {
      type: "p",
      text: "The two training types are defined in Rule 64B5-16.002. On-the-job training is given by a licensed dentist who assumes full responsibility for it. Formal training is an expanded-duty course at a CODA-accredited school or a program approved by the Board.{{rule-16002}} An “EFDA,” in Florida terms, is an assistant with that formal training — see [EFDA in Florida: requirements and duties explained](/blog/efda-certification-florida).",
    },

    { type: "h2", id: "formal-direct", text: "Formal training, direct supervision" },
    {
      type: "p",
      text: "These are the duties where the dentist checks the result before the patient leaves. They make up the core of restorative and prosthodontic assisting.{{rule-16005}}",
    },
    {
      type: "ul",
      items: [
        "Placing or removing **temporary restorations**, with non-mechanical hand instruments only",
        "**Polishing dental restorations** and **polishing clinical crowns**, when not for the purpose of changing the existing contour of the tooth",
        "**Removing excess cement** from restorations and appliances with non-mechanical hand instruments",
        "**Cementing temporary crowns and bridges** with temporary cement",
        "**Fabricating temporary crowns or bridges intraorally**, without adjusting the occlusion",
        "**Packing and removing retraction cord**, provided it contains no vasoactive chemicals",
        "**Monitoring nitrous-oxide–oxygen** administration, within the limits the rule sets",
        "Inserting or removing **dressings from alveolar sockets** in post-operative osteitis",
        "Impressions for **orthodontic retainers, bleaching trays, passive appliances and mouth guards**",
        "Orthodontic support: selecting and pre-sizing bands and archwires, preparing tooth surfaces for bonding, and recementing loose bands",
        "Charting existing restorations and missing teeth",
      ],
    },

    { type: "h2", id: "formal-indirect", text: "Formal training, indirect supervision" },
    {
      type: "p",
      text: "Here the dentist must have examined the patient, authorized the procedure and be in the office, but does not have to inspect the work before dismissal. These are the duties that return the most chair time.{{rule-16005}}",
    },
    {
      type: "ul",
      items: [
        "**Applying sealants**",
        "**Applying topical fluorides** approved by the American Dental Association or the Food and Drug Administration",
        "**Placing or removing rubber dams**",
        "**Placing or removing matrices**",
        "**Applying cavity liners, varnishes or bases**",
        "**Placing and removing periodontal and surgical dressings**",
        "**Removing sutures**",
        "Impressions for **study casts**, opposing models and stents",
        "Placing or removing orthodontic separators; securing or unsecuring an archwire",
        "**Positioning and exposing dental radiographs** — with an important qualification, below",
      ],
    },
    {
      type: "callout",
      title: "Radiographs are the exception",
      text: "The rule lists radiographs among formally trained tasks, but Rule 64B5-16.002 provides that this training requirement is met through certification as a dental radiographer under Rule 64B5-9.011.{{rule-16002}} An expanded-functions course does not authorize X-rays. See [How to get dental radiography certified in Florida](/blog/how-to-get-dental-radiography-certified-in-florida).",
    },

    { type: "h2", id: "ojt", text: "What an on-the-job-trained assistant may do" },
    {
      type: "p",
      text: "An assistant with no formal schooling is not limited to passing instruments. With training from the dentist, the rule permits the following.{{rule-16005}}",
    },
    {
      type: "table",
      caption: "Tasks delegable to an on-the-job-trained dental assistant",
      head: ["Supervision", "Tasks"],
      rows: [
        ["Direct", "Applying topical anesthetics and anti-inflammatory agents not delivered by aerosol or jet spray; changing bleach pellets in the internal bleaching of endodontically treated teeth"],
        ["Indirect", "Retracting lips, cheeks and tongue; irrigation and evacuation; placing and removing cotton rolls; taking and recording vital signs and case history; removing excess cement from orthodontic appliances with hand instruments"],
        ["General", "Instructing patients in oral hygiene; providing oral health education programs; fabricating temporary crowns or bridges in the laboratory"],
      ],
    },
    {
      type: "p",
      text: "The Board's April 2026 amendment added further tasks to the group performed with on-the-job training under direct supervision.{{rule-16005}} If you are building an office protocol, work from the current rule text on the Florida Administrative Code site rather than from any summary, this one included.",
    },

    { type: "h2", id: "cannot", text: "What no dental assistant may do" },
    {
      type: "p",
      text: "The limits matter as much as the permissions, and they are where offices get into trouble.",
    },
    {
      type: "ul",
      items: [
        "**Anything irremediable.** A dentist may not delegate irremediable tasks to a hygienist or an assistant. Cutting tooth structure or soft tissue is the clearest example.{{stat-466024}}",
        "**Diagnosis, treatment planning and prescribing.** These may not be delegated to anyone other than another licensed dentist.{{stat-466024}} An assistant exposes the radiograph; the dentist reads it.",
        "**Scaling, root planing and gingival curettage.** The statute allows these to be delegated to a dental hygienist but not to a dental assistant.{{stat-466024}} Polishing clinical crowns is not a cleaning.",
        "**Local anesthesia.** Administration is limited to dentists and to appropriately certified dental hygienists.{{rule-16006}}",
        "**Adjusting occlusion.** Even where the rule allows a temporary to be fabricated, it excludes adjusting the bite.{{rule-16005}}",
        "**Lasers.** Rule 64B5-16.001 excludes laser use from remediable tasks except as an assessment device. The Board opened rule development on limited laser use in September 2026, so watch this one.{{rule-16001}}{{rule-16005}}",
        "**Any listed task without the listed training or supervision.** The permission is the whole package, not the task alone.",
      ],
    },

    { type: "h2", id: "day-in-practice", text: "What this looks like in a working day" },
    {
      type: "p",
      text: "Take a crown preparation appointment. A formally trained, radiographer-certified assistant can expose the pre-operative image, place topical anesthetic, place the rubber dam, pack retraction cord once the dentist has finished the preparation, take the opposing impression, fabricate the temporary, cement it with temporary cement and remove the excess. The dentist diagnoses, anesthetizes, prepares the tooth, checks the occlusion and approves the temporary before the patient leaves.",
    },
    {
      type: "p",
      text: "That division of labor is the entire economic case for expanded functions. The dentist's time is spent on the irreversible, diagnostic work only a dentist can do. It is also why the training is task-specific: FIDA's [Expanded Functions for the Dental Assistant](/programs/efda-certification-florida) course is organized around thirteen procedures — sealants, fluoride, polishing clinical crowns, liners and bases, temporary restorations, matrices, alginate impressions, temporary crowns, retraction cord, periodontal dressings, the dental dam, suture removal and infection control — each practiced clinically under the student's own supervising dentist.",
    },

    { type: "h2", id: "for-dentists", text: "For dentists: three rules of thumb" },
    {
      type: "ol",
      items: [
        "**Match the task to the certificate.** A course certificate should list the remediable tasks the assistant completed.{{rule-16002}} Delegate those; do not assume the rest.",
        "**Be in the building.** Every formally trained task is direct or indirect supervision, which means a dentist on the premises. Only a short list of on-the-job tasks may be done under general supervision.",
        "**Remember who answers for it.** Delegating to a person not qualified by training, experience or licensure is a disciplinary ground against the dentist.{{stat-466028}} Our guide for employers, [Does your assistant need EFDA, radiography, or both?](/blog/efda-vs-radiography-certification-florida), covers the paperwork worth keeping.",
      ],
    },

    { type: "h2", id: "keeping-current", text: "Keeping current" },
    {
      type: "p",
      text: "Chapter 64B5-16 is a living document. The Board amended the assistant rule in 2026 after nearly two decades without change, and it has more amendments in development.{{chapter-16}} We review this page when the rule changes and update it in place, with the review date shown at the top. For training questions, [ask Atticus](/admissions) or [contact FIDA](/contact); for a ruling on a specific situation, contact the Florida Board of Dentistry.",
    },
  ],
  faqs: [
    {
      q: "Can a dental assistant place sealants in Florida?",
      a: "Yes, if the assistant has received formal training and performs the task under indirect supervision, as Rule 64B5-16.005 provides. On-the-job training alone is not sufficient for sealants.",
    },
    {
      q: "Can a dental assistant polish teeth in Florida?",
      a: "A formally trained assistant may polish clinical crowns under direct supervision when it is not for the purpose of changing the existing contour of the tooth. Scaling, root planing and gingival curettage may be delegated to a hygienist but not to an assistant.",
    },
    {
      q: "Can an EFDA give injections in Florida?",
      a: "No. Dental assistants may not administer local anesthesia. An on-the-job-trained assistant may apply topical anesthetic under direct supervision.",
    },
    {
      q: "Does the dentist have to be in the office when an EFDA works?",
      a: "For every task that requires formal training, yes — those tasks are assigned direct or indirect supervision, and both require the dentist on the premises. Only a few on-the-job tasks, such as oral hygiene instruction, fall under general supervision.",
    },
    {
      q: "Can an EFDA take X-rays?",
      a: "Only with dental radiographer certification under Rule 64B5-9.011, or as a graduate of a Board-approved dental assisting program. Expanded-functions training alone does not cover radiographs.",
    },
  ],
  sources: [
    "stat-466024",
    "rule-16001",
    "rule-16005",
    "rule-16002",
    "rule-16006",
    "stat-466028",
    "chapter-16",
  ],
  related: [
    "efda-certification-florida",
    "efda-vs-radiography-certification-florida",
    "how-to-get-dental-radiography-certified-in-florida",
  ],
};
