import { executeInPage } from "../utils/utils";
import { computeSelector } from "../utils/CSSUtils";
import { AbstractEditor } from "./AbstractEditor";

export class DraftEditor extends AbstractEditor {

    static matches (e: HTMLElement) {
        let parent = e;
        for (let i = 0; i < 3; ++i) {
            if (parent !== undefined && parent !== null) {
                if ((/DraftEditor/g).test(parent.className)) {
                    return true;
                }
                parent = parent.parentElement;
            }
        }
        return false;
    }

    private elem: HTMLElement;
    constructor (e: HTMLElement) {
        super();
        this.elem = e;
    }

    getContent () {
        return executeInPage(`(${(selec: string) => {
            let elem = document.querySelector(selec) as any;
            let editorState : any = undefined;
            do {
                const prop = Object.keys(elem).find(k => k.startsWith("__reactInternalInstance"));
                if (elem[prop] === undefined) {
                    return elem.innerText;
                }
                // TODO: replace with optional chaining once the build system supports it
                editorState = Object
                    .values(((elem[prop] || {}).return || {}).memoizedState || {})
                    .find((state: any) => (((state || {}).prototype || {}).constructor || {}).name === "EditorState");
                elem = elem.parentElement;
            } while (editorState === undefined);
            console.log(editorState);
            return editorState.getCurrentContent().getPlainText();
        }})(${JSON.stringify(computeSelector(this.elem))})`);
    }

    getCursor () {
        return Promise.resolve([1, 0] as [number, number]);
    }

    getElement () {
        return this.elem;
    }

    getLanguage () {
        return Promise.resolve(undefined);
    }

    setContent (text: string) {
        return executeInPage(`(${(selec: string, txt: string) => {
            debugger;
            let elem = document.querySelector(selec) as any;
            let child : any = undefined;
            do {
                const prop = Object.keys(elem).find(k => k.startsWith("__reactEventHandlers"));
                if (elem[prop] === undefined) {
                    return ; // Maybe throw an error? Don't wan't to disturb the page though…
                }
                // TODO: replace with optional chaining once the build system supports it
                const children = ((elem[prop] || {}).children || [])
                if (Array.isArray(children)) {
                    child = children
                        .filter((c: any) => c !== null && c !== undefined && c.props !== undefined)
                        .find((c: any) => c.props.onChange !== undefined && c.props.editorState !== undefined)
                } else if (children.props !== undefined && children.props.onChange !== undefined && children.props.editorState !== undefined) {
                    // React's a bit stupid and sometimes has a single object named "children".
                    child = children;
                }
                elem = elem.parentElement;
            } while (child === undefined);
            const editorStateConstructor = child.props.editorState.__proto__.constructor
            const contentStateConstructor = child.props.editorState.getCurrentContent().__proto__.constructor
            const newState = editorStateConstructor.createWithContent(contentStateConstructor.createFromText(txt))
            child.props.onChange(newState)
        }})(${JSON.stringify(computeSelector(this.elem))}, ${JSON.stringify(text)})`);
    }

    setCursor (line: number, column: number) {
        return Promise.resolve();
    }
}
