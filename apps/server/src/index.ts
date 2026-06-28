import { Console, Effect } from "effect";

const program = Console.log("Hello from server. Crazy part is that this shit is running effect.");

await Effect.runPromise(program);
