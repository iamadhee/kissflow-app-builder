/**
 * Read or set the title the root layout displays.
 *  - In a page: `usePageTitle("Contacts")` sets the current title.
 *  - In a layout: `const title = usePageTitle()` reads it.
 *
 * Setting the title also updates `document.title`. Because the layout is
 * persistent, the page can change the header without the shell remounting.
 */
export declare function usePageTitle(title?: string): string;
