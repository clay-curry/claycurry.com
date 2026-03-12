/**
 * @module services/Email
 *
 * Effect service wrapping the Resend email API. `EmailLive` creates the
 * Resend client once during Layer construction (avoiding per-request
 * instantiation). `EmailTest` records send calls for assertion without
 * sending real emails.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const email = yield* EmailService
 *   yield* email.send({
 *     from: "Contact <contact@claycurry.com>",
 *     to: "clay@example.com",
 *     subject: "Hello",
 *     text: "World",
 *   })
 * })
 * ```
 */
import { Context, Effect, Layer } from "effect";
import { Resend } from "resend";

export interface EmailSendParams {
  readonly from: string;
  readonly to: string;
  readonly replyTo?: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

export interface EmailServiceInterface {
  readonly send: (params: EmailSendParams) => Effect.Effect<void, Error>;
}

export class EmailService extends Context.Tag("EmailService")<
  EmailService,
  EmailServiceInterface
>() {}

/**
 * Production Layer. Creates a single Resend client from `RESEND_API_KEY`.
 * Fails the layer if the API key is not set.
 */
export const EmailLive = Layer.effect(
  EmailService,
  Effect.sync(() => {
    const apiKey = process.env.RESEND_API_KEY;
    const resend = apiKey ? new Resend(apiKey) : null;

    return {
      send: (params: EmailSendParams) =>
        Effect.gen(function* () {
          if (!resend) {
            return yield* Effect.fail(
              new Error("RESEND_API_KEY not configured"),
            );
          }

          const { error } = yield* Effect.tryPromise({
            try: () =>
              resend.emails.send({
                from: params.from,
                to: params.to,
                replyTo: params.replyTo,
                subject: params.subject,
                text: params.text,
                html: params.html,
              }),
            catch: (e) =>
              new Error(
                `Email send failed: ${e instanceof Error ? e.message : String(e)}`,
              ),
          });

          if (error) {
            return yield* Effect.fail(
              new Error(`Resend error: ${error.message}`),
            );
          }
        }),
    } satisfies EmailServiceInterface;
  }),
);

/**
 * Test Layer. Records all send calls for assertion.
 * Access the sent messages via the returned ref.
 */
export function makeEmailTest() {
  const sent: EmailSendParams[] = [];
  const layer = Layer.succeed(EmailService, {
    send: (params: EmailSendParams) =>
      Effect.sync(() => {
        sent.push(params);
      }),
  });
  return { layer, sent };
}

export const EmailTest = makeEmailTest().layer;
