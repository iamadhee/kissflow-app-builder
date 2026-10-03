export interface PageTitleState {
    title: string;
    setTitle: (title: string) => void;
}
export declare const PageTitleContext: import("react").Context<PageTitleState>;
