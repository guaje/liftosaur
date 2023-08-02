/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from "@playwright/test";

export class PlaywrightUtils {
  public static clearCodeMirror(page: Page, dataCy: string, index?: number): Promise<void> {
    return page.evaluate(
      ([theDataCy, theIndex]) => {
        const i = parseInt(`${theIndex ?? "0"}`, 10);
        const cmContent = document.querySelectorAll(`[data-cy=${theDataCy}] .cm-content`)[i] as any;
        cmContent.cmView.view.update([
          cmContent.cmView.view.state.update({
            changes: { from: 0, to: cmContent.cmView.view.state.doc.length, insert: "" },
          }),
        ]);
      },
      [dataCy, index]
    );
  }

  public static typeCodeMirror(page: Page, dataCy: string, text: string, index?: number): Promise<void> {
    return page.evaluate(
      ([theDataCy, theText, theIndex]) => {
        const i = parseInt(`${theIndex ?? "0"}`, 10);
        const cmContent = document.querySelectorAll(`[data-cy=${theDataCy}] .cm-content`)[i] as any;
        cmContent.cmView.view.update([
          cmContent.cmView.view.state.update({
            changes: { from: 0, to: cmContent.cmView.view.state.doc.length, insert: theText },
          }),
        ]);
      },
      [dataCy, text, index]
    );
  }
}
