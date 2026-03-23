declare module 'katex/dist/contrib/auto-render' {
    import { KatexOptions } from 'katex';
    export interface RenderMathInElementOptions extends KatexOptions {
        delimiters?: {
            left: string;
            right: string;
            display: boolean;
        }[];
        ignoredTags?: string[];
        ignoredClasses?: string[];
        errorCallback?: (msg: string, err: Error) => void;
        preProcess?: (math: string) => string;
    }
    export default function renderMathInElement(
        element: HTMLElement,
        options?: RenderMathInElementOptions
    ): void;
}
