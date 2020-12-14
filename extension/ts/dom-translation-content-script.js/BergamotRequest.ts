/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

import { TranslationRequestData } from "../shared-resources/bergamot.types";
import { ContentScriptBergamotApiClient } from "../shared-resources/ContentScriptBergamotApiClient";

// Temporary mock
class httpRequest {
  constructor(url, options) {
    console.log("MOCK HTTP REQUEST", { url, options });
  }
}

/**
 * Represents a request (for 1 chunk) sent off to Bergamot's service.
 *
 * @params translationData  The data to be used for this translation,
 *                          generated by the generateNextTranslationRequest...
 *                          function.
 * @param sourceLanguage    The source language of the document.
 * @param targetLanguage    The target language for the translation.
 *
 */
export class BergamotRequest {
  public translationData;
  private sourceLanguage;
  private targetLanguage;
  public characterCount;

  constructor(
    translationData: TranslationRequestData,
    sourceLanguage,
    targetLanguage,
  ) {
    this.translationData = translationData;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.characterCount = 0;
  }

  /**
   * Initiates the request
   */
  async fireRequest(bergamotApiClient: ContentScriptBergamotApiClient) {
    // Prepare the post data
    const texts = [];

    // Prepare the content of the post
    for (let [, text] of this.translationData) {
      // The next line is a hack to delay dealing with the problem of
      //               <b>Do not</b> touch.
      // being translated to something like
      //           <b>Ne</b> touche <b>pas</b>.
      // The server can only deal with pure text. The client has no
      // knowledge of semantics. So it can not remove the tags and
      // replace them as it doesn't know how to insert them in to
      // the translated result. So as a hack we just remove the
      // tags and hope the formatting is not too bad.
      text = text.replace(/<[^>]*>?/gm, " ");
      texts.push(text);
      this.characterCount += text.length;
    }

    // Fire the request.
    return bergamotApiClient.sendTranslationRequest(texts);
  }
}
