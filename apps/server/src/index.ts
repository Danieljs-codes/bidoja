import { Console, Effect } from "effect";

const program = Console.log("Hello from server");

await Effect.runPromise(program);
