export const NAVIGATE_TO_SECTION_EVENT = "navigateToSection";

export function navigateToSection(sectionId: string) {
  window.dispatchEvent(
    new CustomEvent(NAVIGATE_TO_SECTION_EVENT, {
      detail: { sectionId },
    })
  );
  window.history.pushState(null, "", `#${sectionId}`);
}
