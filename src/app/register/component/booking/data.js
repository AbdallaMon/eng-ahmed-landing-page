// Booking wizard static data: landing video + the 9 step definitions.
// Step 1 (FORM) creates the lead, steps 2-8 (SELECT) PATCH a single field,
// step 9 (FORM) submits all accumulated data.

export const BOOKING = {
  landingIframeSrc: "https://www.youtube.com/embed/4sDkaJthLC0?",
  bookButton: "booking.bookButton",
  makeDream: "booking.makeDream",
  success: "booking.registeredSuccess",
  waitForVisit: "booking.waitForVisit",
  fillDetails: "booking.fillDetails",
  steps: [
    {
      id: 1,
      key: "booking.fillDetails",
      type: "FORM",
      fields: [
        {
          id: "name",
          key: "bookingStep8.name",
          inputType: "text",
          required: true,
          errorKey: "validation.required",
        },
        {
          id: "phone",
          key: "bookingStep8.phone",
          inputType: "tel",
          required: true,
          errorKey: "validation.invalidPhone",
        },
      ],
    },
    {
      id: 2,
      key: "bookingStep1.title",
      field: "location",
      type: "SELECT",
      items: [
        {
          key: "bookingStep1.abuDhabi",
          value: "ABU_DHABI",
          type: "IMAGE",
          image: {
            src: "/booking/abu-dhabi.jpg",
            altKey: "bookingStep1.abuDhabi",
          },
        },
        {
          key: "bookingStep1.abuDhabiAlAin",
          value: "ABU_DHABI_AL_AIN",
          type: "IMAGE",
          image: {
            src: "/booking/abu-dhabi-al-ain.jpg",
            altKey: "bookingStep1.abuDhabiAlAin",
          },
        },
        {
          key: "bookingStep1.dubai",
          value: "DUBAI",
          type: "IMAGE",
          image: {
            src: "/booking/dubai.jpg",
            altKey: "bookingStep1.dubai",
          },
        },
        {
          key: "bookingStep1.sharjah",
          value: "SHARJAH",
          type: "IMAGE",
          image: {
            src: "/booking/sharjah.jpg",
            altKey: "bookingStep1.sharjah",
          },
        },
        {
          key: "bookingStep1.sharjahKhorFakkan",
          value: "SHARJAH_KHOR_FAKKAN",
          type: "IMAGE",
          image: {
            src: "/booking/sharjah-khor-fakkan.jpg",
            altKey: "bookingStep1.sharjahKhorFakkan",
          },
        },
        {
          key: "bookingStep1.rasAlKhaimah",
          value: "RAS_AL_KHAIMAH",
          type: "IMAGE",
          image: {
            src: "/booking/ras-al-khaimah.jpg",
            altKey: "bookingStep1.rasAlKhaimah",
          },
        },
        {
          key: "bookingStep1.ajman",
          value: "AJMAN",
          type: "IMAGE",
          image: {
            src: "/booking/ajman.jpg",
            altKey: "bookingStep1.ajman",
          },
        },
        {
          key: "bookingStep1.ummAlQuwain",
          value: "UMM_AL_QUWAIN",
          type: "IMAGE",
          image: {
            src: "/booking/umm-al-quwain.jpg",
            altKey: "bookingStep1.ummAlQuwain",
          },
        },
        {
          key: "bookingStep1.fujairah",
          value: "FUJAIRAH",
          type: "IMAGE",
          image: {
            src: "/booking/fujairah.jpg",
            altKey: "bookingStep1.fujairah",
          },
        },
        {
          key: "bookingStep1.dibbaFujairah",
          value: "DIBBA_FUJAIRAH",
          type: "IMAGE",
          image: {
            src: "/booking/dibba-fujairah.jpg",
            altKey: "bookingStep1.dibbaFujairah",
          },
        },
      ],
    },
    {
      id: 3,
      key: "bookingStep2.title",
      field: "projectType",
      type: "SELECT",
      items: [
        {
          key: "bookingStep2.privateVilla",
          value: "PRIVATE_VILLA",
          type: "IMAGE",
          image: {
            src: "/booking/private-villa.jpg",
            altKey: "bookingStep2.privateVilla",
          },
        },
        {
          key: "bookingStep2.palace",
          value: "PALACE",
          type: "IMAGE",
          image: {
            src: "/booking/palace.jpg",
            altKey: "bookingStep2.palace",
          },
        },
        {
          key: "bookingStep2.townhouse",
          value: "TOWNHOUSE",
          type: "IMAGE",
          image: {
            src: "/booking/townhouse.jpg",
            altKey: "bookingStep2.townhouse",
          },
        },
        {
          key: "bookingStep2.apartment",
          value: "APARTMENT",
          type: "IMAGE",
          image: {
            src: "/booking/apartment.jpg",
            altKey: "bookingStep2.apartment",
          },
        },
        {
          key: "bookingStep2.commercial",
          value: "COMMERCIAL",
          type: "IMAGE",
          image: {
            src: "/booking/commercial.jpg",
            altKey: "bookingStep2.commercial",
          },
        },
      ],
    },
    {
      id: 4,
      key: "bookingStep3.title",
      field: "projectStage",
      type: "SELECT",
      items: [
        {
          key: "bookingStep3.onPlan",
          value: "ON_PLAN",
          type: "IMAGE",
          image: {
            src: "/booking/on-plan.jpg",
            altKey: "bookingStep3.onPlan",
          },
        },
        {
          key: "bookingStep3.excavation",
          value: "EXCAVATION",
          type: "IMAGE",
          image: {
            src: "/booking/excavation.jpg",
            altKey: "bookingStep3.excavation",
          },
        },
        {
          key: "bookingStep3.columns",
          value: "COLUMNS_AND_BRICKWORK",
          type: "IMAGE",
          image: {
            src: "/booking/columns-and-brickwork.jpg",
            altKey: "bookingStep3.columns",
          },
        },
        {
          key: "bookingStep3.plastering",
          value: "PLASTERING_AND_EXTENSIONS",
          type: "IMAGE",
          image: {
            src: "/booking/plastering-and-extensions.jpg",
            altKey: "bookingStep3.plastering",
          },
        },
        {
          key: "bookingStep3.finishing",
          value: "FINISHING",
          type: "IMAGE",
          image: {
            src: "/booking/finishing.jpg",
            altKey: "bookingStep3.finishing",
          },
        },
        {
          key: "bookingStep3.renovation",
          value: "RENOVATION",
          type: "IMAGE",
          image: {
            src: "/booking/renovation.jpg",
            altKey: "bookingStep3.renovation",
          },
        },
      ],
    },
    {
      id: 5,
      key: "bookingStep4.title",
      field: "previousWork",
      type: "SELECT",
      items: [
        {
          key: "bookingStep4.no",
          value: "NO",
          type: "IMAGE",
          image: {
            src: "/booking/previous-work-no.jpg",
            altKey: "bookingStep4.no",
          },
        },
        {
          key: "bookingStep4.startedNotFinalized",
          value: "STARTED_NOT_FINALIZED",
          type: "IMAGE",
          image: {
            src: "/booking/started-not-finalized.jpg",
            altKey: "bookingStep4.startedNotFinalized",
          },
        },
        {
          key: "bookingStep4.startedWithOther",
          value: "STARTED_WITH_OTHER",
          type: "IMAGE",
          image: {
            src: "/booking/started-with-other.jpg",
            altKey: "bookingStep4.startedWithOther",
          },
        },
      ],
    },
    {
      id: 6,
      key: "bookingStep5.title",
      field: "hasArchitecturalPlan",
      type: "SELECT",
      items: [
        {
          key: "bookingStep5.yes",
          value: "YES",
          type: "IMAGE",
          image: {
            src: "/booking/architectural-plan-yes.jpg",
            altKey: "bookingStep5.yes",
          },
        },
        {
          key: "bookingStep5.no",
          value: "NO",
          type: "IMAGE",
          image: {
            src: "/booking/architectural-plan-no.png",
            altKey: "bookingStep5.no",
          },
        },
        {
          key: "bookingStep5.yesWithNotes",
          value: "YES_WITH_NOTES",
          type: "IMAGE",
          image: {
            src: "/booking/architectural-plan-yes-with-notes.jpg",
            altKey: "bookingStep5.yesWithNotes",
          },
        },
      ],
    },
    {
      id: 7,
      key: "bookingStep6.title",
      field: "serviceType",
      type: "SELECT",
      items: [
        {
          key: "bookingStep6.designOnly",
          value: "DESIGN_ONLY",
          type: "IMAGE",
          image: {
            src: "/booking/design-only.jpg",
            altKey: "bookingStep6.designOnly",
          },
        },
        {
          key: "bookingStep6.designAndPlans",
          value: "DESIGN_AND_PLANS",
          type: "IMAGE",
          image: {
            src: "/booking/design-and-plans.jpg",
            altKey: "bookingStep6.designAndPlans",
          },
        },
        {
          key: "bookingStep6.designAndExecution",
          value: "DESIGN_AND_EXECUTION_AND_QUALITY_SUPERVISION",
          type: "IMAGE",
          image: {
            src: "/booking/design-and-execution.jpg",
            altKey: "bookingStep6.designAndExecution",
          },
        },
      ],
    },
    {
      id: 8,
      key: "bookingStep7.title",
      field: "decisionMaker",
      type: "SELECT",
      items: [
        {
          key: "bookingStep7.me",
          value: "ME",
          type: "IMAGE",
          image: {
            src: "/booking/decision-maker-me.jpg",
            altKey: "bookingStep7.me",
          },
        },
        {
          key: "bookingStep7.meAndPartner",
          value: "ME_AND_PARTNER",
          type: "IMAGE",
          image: {
            src: "/booking/decision-maker-me-and-partner.jpg",
            altKey: "bookingStep7.meAndPartner",
          },
        },
        {
          key: "bookingStep7.notMe",
          value: "NOT_ME",
          type: "IMAGE",
          image: {
            src: "/booking/decision-maker-not-me.jpg",
            altKey: "bookingStep7.notMe",
          },
        },
      ],
    },
    {
      id: 9,
      key: "bookingStep8.title",
      type: "FORM",
      fields: [
        {
          id: "email",
          key: "bookingStep8.email",
          inputType: "email",
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          errorKey: "validation.invalidEmail",
        },
        {
          id: "contactAgreement",
          key: "bookingStep8.contactAgreement",
          inputType: "checkbox",
          required: true,
          errorKey: "validation.required",
        },
        {
          id: "contactInitialPriceAgreement",
          key: "bookingStep8.contactInitialPriceAgreement",
          inputType: "checkbox",
          required: true,
          errorKey: "validation.required",
        },
      ],
    },
  ],
};

export const BOOKING_STEPS = BOOKING.steps;
