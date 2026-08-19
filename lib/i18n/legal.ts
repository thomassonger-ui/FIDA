import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for the public policy pages:
 *   /privacy · /terms · /accessibility · /non-discrimination · /refund-policy
 *
 * WHY THESE EXIST: the legacy fldentalassisting.com /apply-now page carried
 * "Disclosure" and "Non-Discrimination" sections that were lost in the
 * 2026-08-18 migration, and the site collects PII (Atticus intake, contact
 * form, tour requests) with no privacy policy. These pages close both gaps.
 *
 * ⚠️ CONTENT OWNERSHIP — READ BEFORE EDITING
 * - PRIVACY / TERMS / ACCESSIBILITY: written from what the app actually does
 *   (see app/api/atticus/route.ts, app/api/tickets/route.ts, lib/atticus-db.ts).
 *   If data handling changes, update these.
 * - NON-DISCRIMINATION: standard-form statement. Needs confirmation against
 *   FIDA's CIE-filed catalog language (Debbie/Ashley/Dr. Angely) — the legacy
 *   site's exact wording could not be recovered after DNS cutover.
 * - REFUND: deliberately does NOT state a refund schedule. Florida CIE-licensed
 *   institutions file a specific refund policy in their catalog and enrollment
 *   agreement; publishing an invented schedule would create a consumer-facing
 *   promise that conflicts with the signed agreement. Replace the placeholder
 *   section with the filed policy once obtained.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export type LegalSection = { heading: Bilingual; body: Bilingual[] };

export type LegalPage = {
  eyebrow: Bilingual;
  title: Bilingual;
  updated: Bilingual;
  intro: Bilingual;
  sections: LegalSection[];
};

const UPDATED = b("Last updated: August 18, 2026", "Última actualización: 18 de agosto de 2026");

const contactBlock: LegalSection = {
  heading: b("Contact us", "Contáctanos"),
  body: [
    b(
      "Florida Institute of Dental Assisting · 8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216 · (904) 674-3131 · Office hours 9 a.m.–3 p.m.",
      "Florida Institute of Dental Assisting · 8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216 · (904) 674-3131 · Horario de oficina: 9 a.m.–3 p.m.",
    ),
    b(
      "You can also reach us through the contact form on this site, which routes directly to our support queue.",
      "También puedes comunicarte con nosotros mediante el formulario de contacto de este sitio, que llega directamente a nuestra bandeja de soporte.",
    ),
  ],
};

/* ------------------------------------------------------------- PRIVACY --- */

export const privacyPage: LegalPage = {
  eyebrow: b("Legal", "Legal"),
  title: b("Privacy Policy", "Política de Privacidad"),
  updated: UPDATED,
  intro: b(
    "Florida Institute of Dental Assisting (FIDA) respects your privacy. This policy explains what information we collect through fldentalassisting.com, how we use it, and the choices you have.",
    "El Florida Institute of Dental Assisting (FIDA) respeta tu privacidad. Esta política explica qué información recopilamos a través de fldentalassisting.com, cómo la usamos y las opciones que tienes.",
  ),
  sections: [
    {
      heading: b("Information you give us", "Información que nos proporcionas"),
      body: [
        b(
          "When you start a conversation with Atticus (our AI admissions advisor), submit the contact form, request a tour, or open a support ticket, we collect the information you choose to share — typically your name, email address, phone number, and what you tell us about your background and program interest.",
          "Cuando inicias una conversación con Atticus (nuestro asesor de admisiones con inteligencia artificial), envías el formulario de contacto, solicitas una visita o abres un ticket de soporte, recopilamos la información que decides compartir: normalmente tu nombre, correo electrónico, número de teléfono y lo que nos cuentas sobre tu experiencia e interés en los programas.",
        ),
        b(
          "Enrolled students may also upload documents to the student portal's document vault as part of enrollment and recordkeeping.",
          "Los estudiantes inscritos también pueden cargar documentos en el archivo de documentos del portal estudiantil como parte de la inscripción y el mantenimiento de registros.",
        ),
        b(
          "Please do not share Social Security numbers, insurance information, payment card numbers, or medical history through the website or the Atticus chat. We do not ask for them and do not need them to answer your questions.",
          "Por favor, no compartas números de Seguro Social, información de seguros, números de tarjetas de pago ni historial médico a través del sitio web o del chat de Atticus. No los solicitamos ni los necesitamos para responder tus preguntas.",
        ),
      ],
    },
    {
      heading: b("Information collected automatically", "Información recopilada automáticamente"),
      body: [
        b(
          "We record basic technical information such as your browser type and a one-way encrypted (hashed) form of your IP address, which we use to prevent abuse and rate-limit automated traffic. We do not store your raw IP address alongside your inquiry.",
          "Registramos información técnica básica, como el tipo de navegador y una forma cifrada de un solo sentido (hash) de tu dirección IP, que usamos para prevenir el abuso y limitar el tráfico automatizado. No almacenamos tu dirección IP sin cifrar junto a tu consulta.",
        ),
        b(
          "If you reach the site by scanning a QR code or following a campaign link, we record which code or campaign brought you here so we know which outreach efforts are working. This is not tied to your identity unless you choose to share your contact information.",
          "Si llegas al sitio escaneando un código QR o siguiendo un enlace de campaña, registramos qué código o campaña te trajo aquí para saber qué esfuerzos de difusión funcionan. Esto no se vincula a tu identidad a menos que decidas compartir tus datos de contacto.",
        ),
        b(
          "We store your language preference (English or Spanish) in a cookie so the site remembers it on your next visit.",
          "Guardamos tu preferencia de idioma (inglés o español) en una cookie para que el sitio la recuerde en tu próxima visita.",
        ),
      ],
    },
    {
      heading: b("About the Atticus AI advisor", "Sobre el asesor con IA Atticus"),
      body: [
        b(
          "Atticus is an artificial intelligence assistant, not a person. Your conversation is processed by a third-party AI provider to generate responses, and the conversation is logged in our admissions system so a FIDA advisor can follow up with accurate context.",
          "Atticus es un asistente de inteligencia artificial, no una persona. Tu conversación es procesada por un proveedor externo de IA para generar respuestas, y la conversación queda registrada en nuestro sistema de admisiones para que un asesor de FIDA pueda darte seguimiento con el contexto correcto.",
        ),
        b(
          "Atticus is not a medical, legal, or financial professional and does not provide advice in those areas. Questions about individual financial aid, accommodations, or eligibility determinations are routed to a human advisor.",
          "Atticus no es un profesional médico, legal ni financiero, y no brinda asesoramiento en esas áreas. Las preguntas sobre ayuda financiera individual, adaptaciones o determinaciones de elegibilidad se dirigen a un asesor humano.",
        ),
      ],
    },
    {
      heading: b("How we use your information", "Cómo usamos tu información"),
      body: [
        b(
          "We use the information you provide to answer your questions, guide you to the right program or course, process enrollment, maintain student records, provide student support, and improve how the site and our admissions process work.",
          "Usamos la información que proporcionas para responder tus preguntas, orientarte al programa o curso adecuado, procesar la inscripción, mantener los registros estudiantiles, brindar apoyo estudiantil y mejorar el funcionamiento del sitio y de nuestro proceso de admisiones.",
        ),
      ],
    },
    {
      heading: b("How we communicate with you", "Cómo nos comunicamos contigo"),
      body: [
        b(
          "When you share your contact information, you agree that FIDA may contact you about your inquiry or enrollment by email or phone. We do not send marketing text messages. You can ask us to stop contacting you at any time by replying to any email or calling the school.",
          "Cuando compartes tus datos de contacto, aceptas que FIDA se comunique contigo sobre tu consulta o inscripción por correo electrónico o teléfono. No enviamos mensajes de texto publicitarios. Puedes pedirnos que dejemos de contactarte en cualquier momento respondiendo a cualquier correo o llamando a la escuela.",
        ),
      ],
    },
    {
      heading: b("How we share information", "Cómo compartimos la información"),
      body: [
        b(
          "We do not sell your personal information. We share it only with service providers who help us operate the school and this website — including our website hosting, database, learning management system, email delivery, scheduling, and AI providers — and only as needed to perform those services.",
          "No vendemos tu información personal. La compartimos únicamente con proveedores de servicios que nos ayudan a operar la escuela y este sitio web —incluidos nuestros proveedores de alojamiento web, base de datos, sistema de gestión del aprendizaje, envío de correo, programación de citas e inteligencia artificial— y solo en la medida necesaria para prestar esos servicios.",
        ),
        b(
          "We may also disclose information where required by law or by a regulator with authority over the school, including the Florida Commission for Independent Education.",
          "También podemos divulgar información cuando lo exija la ley o un organismo regulador con autoridad sobre la escuela, incluida la Comisión de Educación Independiente de Florida (Florida Commission for Independent Education).",
        ),
      ],
    },
    {
      heading: b("Student records", "Registros estudiantiles"),
      body: [
        b(
          "Records of enrolled students — including enrollment documents, attendance, and academic progress — are maintained by the school in accordance with its recordkeeping obligations as an institution licensed by the Florida Commission for Independent Education.",
          "Los registros de los estudiantes inscritos —incluidos los documentos de inscripción, la asistencia y el progreso académico— son mantenidos por la escuela conforme a sus obligaciones de conservación de registros como institución con licencia de la Comisión de Educación Independiente de Florida.",
        ),
      ],
    },
    {
      heading: b("Security and retention", "Seguridad y conservación"),
      body: [
        b(
          "Access to student and applicant information is limited to FIDA staff who need it to do their jobs. Documents in the student portal are stored with access controls and are retrieved through short-lived, single-use links. We keep information for as long as needed for the purposes described here and to meet our legal and regulatory obligations.",
          "El acceso a la información de estudiantes y solicitantes está limitado al personal de FIDA que la necesita para su trabajo. Los documentos del portal estudiantil se almacenan con controles de acceso y se recuperan mediante enlaces de un solo uso y corta duración. Conservamos la información durante el tiempo necesario para los fines aquí descritos y para cumplir nuestras obligaciones legales y regulatorias.",
        ),
      ],
    },
    {
      heading: b("Children", "Menores de edad"),
      body: [
        b(
          "This website and FIDA's programs are intended for adults. Admission requires applicants to be at least 18 years of age, and we do not knowingly collect information from children.",
          "Este sitio web y los programas de FIDA están dirigidos a adultos. La admisión requiere que los solicitantes tengan al menos 18 años, y no recopilamos intencionalmente información de menores.",
        ),
      ],
    },
    {
      heading: b("Your choices", "Tus opciones"),
      body: [
        b(
          "You can ask us what information we hold about you, ask us to correct it, or ask us to delete information we are not required to retain. Contact us using the details below and we will respond within a reasonable time.",
          "Puedes preguntarnos qué información tenemos sobre ti, pedirnos que la corrijamos o solicitar que eliminemos la información que no estamos obligados a conservar. Contáctanos con los datos que aparecen abajo y responderemos en un plazo razonable.",
        ),
      ],
    },
    {
      heading: b("Changes to this policy", "Cambios a esta política"),
      body: [
        b(
          "We may update this policy as our programs or systems change. The date at the top of this page shows when it was last revised.",
          "Podemos actualizar esta política a medida que cambien nuestros programas o sistemas. La fecha en la parte superior de esta página indica cuándo se revisó por última vez.",
        ),
      ],
    },
    contactBlock,
  ],
};

/* --------------------------------------------------------------- TERMS --- */

export const termsPage: LegalPage = {
  eyebrow: b("Legal", "Legal"),
  title: b("Terms of Use", "Términos de Uso"),
  updated: UPDATED,
  intro: b(
    "These terms apply to your use of fldentalassisting.com, operated by Florida Institute of Dental Assisting (FIDA).",
    "Estos términos se aplican a tu uso de fldentalassisting.com, operado por el Florida Institute of Dental Assisting (FIDA).",
  ),
  sections: [
    {
      heading: b("This website is informational", "Este sitio web es informativo"),
      body: [
        b(
          "The information on this site describes FIDA's programs and courses in general terms. It is not an enrollment contract. Enrollment is governed by the enrollment agreement and school catalog you receive and sign at registration. Where this website and your signed enrollment agreement differ, the signed agreement controls.",
          "La información de este sitio describe los programas y cursos de FIDA en términos generales. No constituye un contrato de inscripción. La inscripción se rige por el acuerdo de inscripción y el catálogo escolar que recibes y firmas al registrarte. Si este sitio web y tu acuerdo de inscripción firmado difieren, prevalece el acuerdo firmado.",
        ),
      ],
    },
    {
      heading: b("Program information may change", "La información de los programas puede cambiar"),
      body: [
        b(
          "Tuition, schedules, start dates, curriculum, and requirements are subject to change. We work to keep this site current, but you should confirm details with an advisor before making decisions.",
          "La matrícula, los horarios, las fechas de inicio, el plan de estudios y los requisitos están sujetos a cambios. Trabajamos para mantener este sitio actualizado, pero debes confirmar los detalles con un asesor antes de tomar decisiones.",
        ),
        b(
          "FIDA's Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education. The EFDA and Radiography courses are approved by the Florida Board of Dentistry. FIDA is not regionally or nationally accredited, and nothing on this site should be read to claim otherwise.",
          "El programa de diploma de Asistencia Dental de Nivel Inicial de FIDA cuenta con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education). Los cursos de EFDA y Radiografía están aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry). FIDA no cuenta con acreditación regional ni nacional, y nada en este sitio debe interpretarse como una afirmación contraria.",
        ),
      ],
    },
    {
      heading: b("No guarantee of employment or licensure", "Sin garantía de empleo ni de licencia"),
      body: [
        b(
          "Completing a FIDA program or course does not guarantee employment, a particular salary, or the issuance of any state credential. Career outcome figures shown on this site are drawn from published government labor statistics and are cited on the page where they appear; they describe the field generally, not any individual's results.",
          "Completar un programa o curso de FIDA no garantiza empleo, un salario determinado ni la emisión de ninguna credencial estatal. Las cifras de resultados profesionales que aparecen en este sitio provienen de estadísticas laborales gubernamentales publicadas y se citan en la página donde aparecen; describen el campo en general, no los resultados de una persona en particular.",
        ),
      ],
    },
    {
      heading: b("Student portal accounts", "Cuentas del portal estudiantil"),
      body: [
        b(
          "If you have a student portal account, you are responsible for keeping your sign-in credentials confidential and for activity that occurs under your account. Tell us right away if you believe your account has been accessed by someone else.",
          "Si tienes una cuenta del portal estudiantil, eres responsable de mantener la confidencialidad de tus credenciales de acceso y de la actividad que ocurra en tu cuenta. Avísanos de inmediato si crees que alguien más ha accedido a tu cuenta.",
        ),
      ],
    },
    {
      heading: b("Acceptable use", "Uso aceptable"),
      body: [
        b(
          "Please do not attempt to disrupt the site, gain unauthorized access to any part of it, scrape it in bulk, or use the Atticus chat to submit unlawful, abusive, or deliberately misleading content.",
          "Por favor, no intentes interrumpir el sitio, obtener acceso no autorizado a ninguna de sus partes, extraer datos de forma masiva ni usar el chat de Atticus para enviar contenido ilegal, abusivo o deliberadamente engañoso.",
        ),
      ],
    },
    {
      heading: b(
        "Intellectual property and technology",
        "Propiedad intelectual y tecnología",
      ),
      body: [
        b(
          "The content, design, and branding on this site belong to FIDA or its licensors. This website and its underlying platform — including the Atticus AI admissions advisor and the student portal — are built by WorldTeachPathways dba WorldTeachESL LLC and Powered by Atticus™. Atticus™ and the associated platform technology are the property of WorldTeachPathways dba WorldTeachESL LLC.",
          "El contenido, el diseño y la marca de este sitio pertenecen a FIDA o a sus licenciantes. Este sitio web y su plataforma subyacente —incluidos el asesor de admisiones con IA Atticus y el portal estudiantil— fueron construidos por WorldTeachPathways dba WorldTeachESL LLC y funcionan con la tecnología Atticus™ (Powered by Atticus™). Atticus™ y la tecnología de la plataforma asociada son propiedad de WorldTeachPathways dba WorldTeachESL LLC.",
        ),
        b(
          "This site links to third-party services — including our learning management system and scheduling tools — which have their own terms and privacy practices.",
          "Este sitio enlaza a servicios de terceros —incluidos nuestro sistema de gestión del aprendizaje y herramientas de programación— que tienen sus propios términos y prácticas de privacidad.",
        ),
      ],
    },
    {
      heading: b("Governing law", "Legislación aplicable"),
      body: [
        b(
          "These terms are governed by the laws of the State of Florida.",
          "Estos términos se rigen por las leyes del Estado de Florida.",
        ),
      ],
    },
    contactBlock,
  ],
};

/* ------------------------------------------------------- ACCESSIBILITY --- */

export const accessibilityPage: LegalPage = {
  eyebrow: b("Legal", "Legal"),
  title: b("Accessibility Statement", "Declaración de Accesibilidad"),
  updated: UPDATED,
  intro: b(
    "FIDA is committed to making this website usable by everyone, including people who use screen readers, keyboard navigation, magnification, or other assistive technology.",
    "FIDA se compromete a que este sitio web sea utilizable por todas las personas, incluidas aquellas que usan lectores de pantalla, navegación por teclado, ampliación u otras tecnologías de asistencia.",
  ),
  sections: [
    {
      heading: b("Our standard", "Nuestro estándar"),
      body: [
        b(
          "We build and test this site against the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA.",
          "Construimos y probamos este sitio conforme a las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1, nivel AA.",
        ),
      ],
    },
    {
      heading: b("What we've done", "Lo que hemos hecho"),
      body: [
        b(
          "The site uses proper heading structure and page landmarks, a skip-to-content link, visible keyboard focus, text and control contrast that meets AA thresholds, labeled form fields, and descriptive link text. Animated content respects your operating system's reduced-motion setting. The entire public site is available in English and Spanish.",
          "El sitio utiliza una estructura de encabezados y puntos de referencia adecuados, un enlace para saltar al contenido, foco de teclado visible, contraste de texto y controles que cumple los umbrales AA, campos de formulario etiquetados y texto de enlace descriptivo. El contenido animado respeta la configuración de movimiento reducido de tu sistema operativo. Todo el sitio público está disponible en inglés y español.",
        ),
        b(
          "We run automated accessibility testing as part of our development process and review pages manually when we make significant changes.",
          "Ejecutamos pruebas automatizadas de accesibilidad como parte de nuestro proceso de desarrollo y revisamos las páginas manualmente cuando hacemos cambios significativos.",
        ),
      ],
    },
    {
      heading: b("Known limitations", "Limitaciones conocidas"),
      body: [
        b(
          "Some features on this site are provided by third parties — including our scheduling tool and learning management system — and we do not control their accessibility. If you encounter a barrier in one of those tools, contact us and we will help you complete the task another way.",
          "Algunas funciones de este sitio son proporcionadas por terceros —incluidos nuestra herramienta de programación y el sistema de gestión del aprendizaje— y no controlamos su accesibilidad. Si encuentras una barrera en una de esas herramientas, contáctanos y te ayudaremos a completar la tarea de otra manera.",
        ),
      ],
    },
    {
      heading: b("Tell us about a barrier, or request assistance", "Infórmanos sobre una barrera o solicita asistencia"),
      body: [
        b(
          "If any part of this site is difficult to use, or you need information in another format, please contact us. We will work with you to provide the information or complete the task, and we treat accessibility reports as a priority.",
          "Si alguna parte de este sitio es difícil de usar, o necesitas la información en otro formato, contáctanos. Trabajaremos contigo para brindarte la información o completar la tarea, y tratamos los informes de accesibilidad como una prioridad.",
        ),
        b(
          "Prospective and enrolled students who need a disability-related accommodation for a program or course should contact the school directly so we can discuss options with you.",
          "Los estudiantes actuales y potenciales que necesiten una adaptación relacionada con una discapacidad para un programa o curso deben comunicarse directamente con la escuela para que podamos analizar las opciones contigo.",
        ),
      ],
    },
    contactBlock,
  ],
};

/* --------------------------------------------------- NON-DISCRIMINATION --- */

export const nonDiscriminationPage: LegalPage = {
  eyebrow: b("Legal", "Legal"),
  title: b("Non-Discrimination Policy", "Política de No Discriminación"),
  updated: UPDATED,
  intro: b(
    "Florida Institute of Dental Assisting is committed to providing an educational environment free from discrimination and harassment.",
    "El Florida Institute of Dental Assisting se compromete a ofrecer un entorno educativo libre de discriminación y acoso.",
  ),
  sections: [
    {
      heading: b("Our policy", "Nuestra política"),
      body: [
        b(
          "FIDA admits students of any race, color, national or ethnic origin, ancestry, religion, sex, sexual orientation, gender identity, age, marital status, veteran status, or disability to all the rights, privileges, programs, and activities generally made available to students at the school.",
          "FIDA admite estudiantes de cualquier raza, color, origen nacional o étnico, ascendencia, religión, sexo, orientación sexual, identidad de género, edad, estado civil, condición de veterano o discapacidad, otorgándoles todos los derechos, privilegios, programas y actividades que generalmente se ponen a disposición de los estudiantes de la escuela.",
        ),
        b(
          "The school does not discriminate on these bases in the administration of its admissions policies, educational policies, or any other school-administered program.",
          "La escuela no discrimina por estos motivos en la administración de sus políticas de admisión, políticas educativas ni en ningún otro programa administrado por la escuela.",
        ),
      ],
    },
    {
      heading: b("Admission requirements are applied equally", "Los requisitos de admisión se aplican por igual"),
      body: [
        b(
          "FIDA's published admission requirements — including age, education, health documentation, and background screening requirements described on our program pages — apply to all applicants equally and are based on the requirements of clinical training placements and the dental assisting profession in Florida.",
          "Los requisitos de admisión publicados por FIDA —incluidos los requisitos de edad, educación, documentación de salud y verificación de antecedentes descritos en nuestras páginas de programas— se aplican por igual a todos los solicitantes y se basan en los requisitos de las prácticas clínicas y de la profesión de asistencia dental en Florida.",
        ),
      ],
    },
    {
      heading: b("Accommodations for disability", "Adaptaciones por discapacidad"),
      body: [
        b(
          "Applicants and students who need a reasonable accommodation because of a disability are encouraged to contact the school so we can discuss the request individually.",
          "Se invita a los solicitantes y estudiantes que necesiten una adaptación razonable por motivo de discapacidad a comunicarse con la escuela para analizar la solicitud de manera individual.",
        ),
      ],
    },
    {
      heading: b("Concerns and complaints", "Inquietudes y quejas"),
      body: [
        b(
          "If you believe you have experienced discrimination or harassment in connection with the school, please contact the school administration directly using the information below so the concern can be reviewed.",
          "Si consideras que has sufrido discriminación u hostigamiento en relación con la escuela, comunícate directamente con la administración escolar mediante la información que aparece a continuación para que se revise tu inquietud.",
        ),
        b(
          "Students may also contact the Florida Commission for Independent Education, the state agency that licenses the school's Entry Level Dental Assisting diploma program, regarding unresolved concerns.",
          "Los estudiantes también pueden comunicarse con la Comisión de Educación Independiente de Florida (Florida Commission for Independent Education), la agencia estatal que otorga la licencia al programa de diploma de Asistencia Dental de Nivel Inicial de la escuela, respecto a inquietudes no resueltas.",
        ),
      ],
    },
    contactBlock,
  ],
};

/* --------------------------------------------------------------- REFUND --- */

export const refundPage: LegalPage = {
  eyebrow: b("Legal", "Legal"),
  title: b("Tuition, Cancellation & Refunds", "Matrícula, Cancelación y Reembolsos"),
  updated: UPDATED,
  intro: b(
    "This page explains where to find FIDA's cancellation and refund terms and how to request a cancellation.",
    "Esta página explica dónde encontrar los términos de cancelación y reembolso de FIDA y cómo solicitar una cancelación.",
  ),
  sections: [
    {
      heading: b("Registration fee", "Cuota de inscripción"),
      body: [
        b(
          "The $150 registration fee for the Entry Level Dental Assisting diploma program is non-refundable. Published tuition for each program and course is listed on our Tuition page.",
          "La cuota de inscripción de $150 para el programa de diploma de Asistencia Dental de Nivel Inicial no es reembolsable. La matrícula publicada de cada programa y curso aparece en nuestra página de Matrícula.",
        ),
      ],
    },
    {
      heading: b("Where the refund policy lives", "Dónde se encuentra la política de reembolso"),
      body: [
        b(
          "FIDA's cancellation and refund policy — including the refund schedule that applies if you withdraw after classes begin — is set out in the school catalog and in the enrollment agreement you receive and sign at registration. As an institution licensed by the Florida Commission for Independent Education, FIDA maintains this policy on file with the Commission.",
          "La política de cancelación y reembolso de FIDA —incluido el calendario de reembolsos aplicable si te retiras después del inicio de clases— se establece en el catálogo escolar y en el acuerdo de inscripción que recibes y firmas al registrarte. Como institución con licencia de la Comisión de Educación Independiente de Florida, FIDA mantiene esta política registrada ante la Comisión.",
        ),
        b(
          "Please review the enrollment agreement carefully before you sign it, and ask us about anything that is unclear. We would rather answer the question up front than have you discover it later.",
          "Revisa cuidadosamente el acuerdo de inscripción antes de firmarlo y pregúntanos sobre cualquier punto que no esté claro. Preferimos responder la pregunta desde el principio a que la descubras después.",
        ),
      ],
    },
    {
      heading: b("Requesting a cancellation or refund", "Cómo solicitar una cancelación o reembolso"),
      body: [
        b(
          "To cancel your enrollment or ask about a refund, contact the school directly using the information below, or open a ticket through the student portal if you are already enrolled. We will confirm your request in writing and explain how your enrollment agreement's refund terms apply to your situation.",
          "Para cancelar tu inscripción o consultar sobre un reembolso, comunícate directamente con la escuela mediante la información que aparece abajo, o abre un ticket a través del portal estudiantil si ya estás inscrito. Confirmaremos tu solicitud por escrito y te explicaremos cómo se aplican a tu situación los términos de reembolso de tu acuerdo de inscripción.",
        ),
      ],
    },
    {
      heading: b("Unresolved concerns", "Inquietudes no resueltas"),
      body: [
        b(
          "If a concern about tuition or refunds cannot be resolved with the school, students may contact the Florida Commission for Independent Education, the state agency that licenses the school's diploma program.",
          "Si una inquietud sobre matrícula o reembolsos no puede resolverse con la escuela, los estudiantes pueden comunicarse con la Comisión de Educación Independiente de Florida (Florida Commission for Independent Education), la agencia estatal que otorga la licencia al programa de diploma de la escuela.",
        ),
      ],
    },
    contactBlock,
  ],
};
